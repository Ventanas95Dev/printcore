import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/db'
import { randomUUID } from 'crypto'

export async function POST(req) {
  const body = await req.json()

  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
  }

  const now = new Date()

  const order = {
    customerName: body.customerName || 'Unknown',
    platformOrderId: body.platformOrderId || null,
    status: 'queued',
    paymentStatus: 'unpaid',
    renderStatus: 'pending',
    editorPreviewUrl: body.editorPreviewUrl || null,
    createdAt: now,
    updatedAt: now,
    items: body.items.map((item) => ({
      designId: randomUUID(),
      quantity: item.quantity || 1,
    })),
  }

  try {
    const db = await getDb()
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

