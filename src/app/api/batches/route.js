import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { mockOrders } from '@/lib/mock'

// SETTING
const BATCH_WIDTH = 6
const MAX_ROWS = 3
const MAX_ITEMS = BATCH_WIDTH * MAX_ROWS

export async function POST() {
  // 1. Filter queued orders (mock only for now)
  const queuedOrders = mockOrders
    .filter((o) => o.status === 'queued')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

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

  // TODO: save to DB and update orders in real use
  console.log('[mock] Created batch:', batch)

  return NextResponse.json({
    status: 'created',
    batch,
  })
}
