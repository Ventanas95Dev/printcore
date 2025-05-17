import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db/db'

export async function POST(req) {
  const body = await req.json()

  if (!body || !body.items || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
  }

  const order = {
    customerName: body.customerName || 'Unknown',
    platformOrderId: body.platformOrderId || null,
    status: 'queued',
    createdAt: new Date(),
    items: body.items.map((item) => ({
      designId: item.designId,
      imageUrl: item.imageUrl,
      quantity: item.quantity || 1,
    })),
  }

  try {
    const client = await clientPromise
    const db = client.db()
    const result = await db.collection('orders').insertOne(order)

    return NextResponse.json({
      status: 'ok',
      orderId: result.insertedId.toString(),
    })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
