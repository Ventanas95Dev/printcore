import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/db'

const BATCH_WIDTH = 6
const MAX_ROWS = 3
const MAX_ITEMS = BATCH_WIDTH * MAX_ROWS

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const force = body.force === true

    const db = await getDb()
    const ordersCollection = db.collection('orders')
    const batchesCollection = db.collection('batches')

    const queuedOrders = await ordersCollection
      .find({ status: 'queued' })
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
        message: 'Not enough unbatched items to fill one row.',
      })
    }

    const itemsToUse = allItems.slice(0, MAX_ITEMS)

    if (itemsToUse.length === 0) {
      return NextResponse.json({
        status: 'no-items',
        message: 'No available items to batch.',
      })
    }

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

    // 1. Lägg till batch-id på orders
    const orderIdsInBatch = [...new Set(layout.map((item) => item.orderId))]
    await ordersCollection.updateMany(
      { _id: { $in: orderIdsInBatch } },
      {
        $addToSet: { batches: batch._id },
      }
    )

    // 2. Uppdatera batchedQuantity för varje item
    const updatesByOrder = {}

    for (const item of layout) {
      const key = item.orderId.toString()
      if (!updatesByOrder[key]) updatesByOrder[key] = {}
      updatesByOrder[key][item.itemId] = (updatesByOrder[key][item.itemId] || 0) + 1
    }

    for (const [orderId, itemMap] of Object.entries(updatesByOrder)) {
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

    return NextResponse.json({
      status: 'created',
      batch,
    })
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
  }
}
