import { getDb } from '@/lib/db/db'

export function createBatchDocument({ items }) {
  const rows = Math.ceil(items.length / 6)

  return {
    createdAt: new Date(),
    status: 'filling', // 'filling' | 'ready' | 'printed'
    cols: 6,
    rows,
    items: items.map((item, index) => ({
      orderId: item._id,
      imageUrl: item.imageUrl,
      customerName: item.customerName,
      position: {
        row: Math.floor(index / 6),
        col: index % 6,
      },
    })),
  }
}

export async function createBatchFromOrders(orders) {
  const batchDoc = createBatchDocument({ items: orders })
  const db = await getDb()
  const result = await db.collection('batches').insertOne(batchDoc)

  // Mark orders as batched
  const orderIds = orders.map((o) => o._id)
  await db
    .collection('orders')
    .updateMany({ _id: { $in: orderIds } }, { $set: { status: 'batched' } })

  return result.insertedId
}
