import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/db/db'

// SETTING
const BATCH_WIDTH = 6
const MAX_ROWS = 3
const MAX_ITEMS = BATCH_WIDTH * MAX_ROWS

export async function POST() {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()
    const ordersCollection = db.collection('orders')

    // 1. Query queued orders from MongoDB
    const queuedOrders = await ordersCollection
        .find({ status: 'queued' })
        .sort({ createdAt: 1 })
        .toArray()

    // 2. Expand to disktrasa-items
    const allItems = []
    for (const order of queuedOrders) {
      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          allItems.push({
            orderId: order._id,
            customerName: order.customerName,
            imageUrl: item.imageUrl,
            designId: item.designId,
          })
        }
      }
    }

    if (allItems.length < BATCH_WIDTH) {
      return NextResponse.json({
        status: 'waiting',
        message: 'Not enough items to fill one row.',
      })
    }

    const itemsToUse = allItems.slice(0, MAX_ITEMS)
    const rows = Math.ceil(itemsToUse.length / BATCH_WIDTH)

    const layout = itemsToUse.map((item, i) => ({
      ...item,
      position: {
        row: Math.floor(i / BATCH_WIDTH),
        col: i % BATCH_WIDTH,
      },
    }))

    const batch = {
      _id: new ObjectId().toString(),
      createdAt: new Date(),
      status: 'filling',
      cols: BATCH_WIDTH,
      rows,
      items: layout,
    }

    // Save batch to database and update orders
    const batchesCollection = db.collection('batches')
    await batchesCollection.insertOne(batch)

    // Update the status of orders that are included in this batch
    const orderIdsInBatch = [...new Set(layout.map(item => item.orderId))]

    // We don't want to mark the entire order as processed if only some items are included
    // Instead, we'll add a reference to the batch in the order
    await ordersCollection.updateMany(
        { _id: { $in: orderIdsInBatch } },
        {
          $push: { batches: batch._id },
          // Only update status if you want to mark these orders as being processed
          // $set: { status: 'processing' }
        }
    )

    return NextResponse.json({
      status: 'created',
      batch,
    })
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json(
        { error: 'Failed to create batch' },
        { status: 500 }
    )
  }
}
