import { getDb } from '@/lib/db/db'

export function createOrderDocument({ designId, imageUrl, customerName, platformOrderId }) {
  return {
    designId,
    imageUrl,
    customerName,
    platformOrderId,
    createdAt: new Date(),
    status: 'queued', // 'queued' | 'batched' | 'printed'
  }
}

export async function saveOrder(data) {
  const db = await getDb()

  const doc = createOrderDocument(data)
  const result = await db.collection('orders').insertOne(doc)
  return result.insertedId
}
