import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/db'

export async function POST(req) {
  const { orderId, itemId } = await req.json()

  if (!orderId || !itemId) {
    return NextResponse.json({ error: 'Missing orderId or itemId' }, { status: 400 })
  }

  const db = await getDb()
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const result = await db.collection('orders').updateOne(
    { _id: new ObjectId(orderId) },
    {
      $pull: {
        items: { id: itemId },
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  )

  return NextResponse.json({ success: true })
}
