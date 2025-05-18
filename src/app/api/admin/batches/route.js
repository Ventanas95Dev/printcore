import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/db'
import { requireAdmin } from '@/lib/auth/requireAdmin'

const BATCH_WIDTH = 6
const MAX_ROWS = 3
const MAX_ITEMS = BATCH_WIDTH * MAX_ROWS

export async function POST(req) {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const force = body.force === true

    const db = await getDb()
    const ordersCollection = db.collection('orders')
    const batchesCollection = db.collection('batches')

    const queuedOrders = await ordersCollection
      .find({ status: 'queued', paymentStatus: 'paid' })
      .sort({ createdAt: 1 })
      .toArray()

    const allItems = []

    for (const order of queuedOrders) {
      for (const item of order.items) {
        const batched = item.batchedQuantity || 0
        const unbatched = (item.quantity || 1) - batched

        for (let i = 0; i < unbatched; i++) {
          allItems.push({
            orderId: order._id,
            itemId: item.id,
            customerName: order.customerName,
            imageUrl: item.imageUrl,
            designId: item.designId,
          })
        }
      }
    }

    if (allItems.length < BATCH_WIDTH && !force) {
      return NextResponse.json({
        status: 'waiting',
        unbatchedItemCount: allItems.length,
        message: 'Not enough unbatched items to fill one row.',
      })
    }

    const batches = []
    const batchedItemMap = {} // { orderId: { itemId: count } }

    while (allItems.length >= BATCH_WIDTH || (force && allItems.length > 0)) {
      const itemsToUse = allItems.splice(0, MAX_ITEMS)
      if (itemsToUse.length === 0) break

      const rows = Math.ceil(itemsToUse.length / BATCH_WIDTH)
      const layout = itemsToUse.map((item, i) => ({
        ...item,
        position: {
          row: Math.floor(i / BATCH_WIDTH),
          col: i % BATCH_WIDTH,
        },
      }))

      const batch = {
        createdAt: new Date(),
        status: 'filling',
        cols: BATCH_WIDTH,
        rows,
        items: layout,
      }

      await batchesCollection.insertOne(batch)
      batches.push(batch)

      for (const item of layout) {
        const key = item.orderId.toString()
        if (!batchedItemMap[key]) batchedItemMap[key] = {}
        batchedItemMap[key][item.itemId] = (batchedItemMap[key][item.itemId] || 0) + 1
      }
    }

    const affectedOrderIds = Object.keys(batchedItemMap).map((id) => new ObjectId(id))
    if (affectedOrderIds.length > 0) {
      await ordersCollection.updateMany(
        { _id: { $in: affectedOrderIds } },
        { $addToSet: { batches: { $each: batches.map((b) => b._id) } } }
      )

      for (const [orderId, itemMap] of Object.entries(batchedItemMap)) {
        const updates = Object.entries(itemMap).map(([itemId, incBy]) => ({
          updateOne: {
            filter: { _id: new ObjectId(orderId), 'items.id': itemId },
            update: { $inc: { 'items.$.batchedQuantity': incBy } },
          },
        }))
        if (updates.length > 0) {
          await ordersCollection.bulkWrite(updates)
        }
      }
    }

    if (batches.length === 0) {
      return NextResponse.json({
        status: 'empty',
        message: 'No batch was created. All items may already be assigned.',
      })
    }

    return NextResponse.json({
      status: 'created',
      batches,
    })
  } catch (error) {
    console.error('Error creating batches:', error)
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
  }
}

export async function GET(req) {
  const db = await getDb()
  const batches = await db
    .collection('batches')
    .find({ status: 'filling' })
    .sort({ createdAt: 1 })
    .toArray()

  return NextResponse.json(batches)
}
