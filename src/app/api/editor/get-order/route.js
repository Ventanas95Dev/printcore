import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { orderId } = await req.json()

  if (!orderId || !ObjectId.isValid(orderId)) {
    return new Response(JSON.stringify({ error: 'Missing or invalid orderId' }), { status: 400 })
  }

  const db = await getDb()
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) })

  if (order?.paymentStatus === 'paid') {
    return new Response(JSON.stringify({ error: 'Order already paid' }), { status: 400 })
  }

  return NextResponse.json({ order })
}
