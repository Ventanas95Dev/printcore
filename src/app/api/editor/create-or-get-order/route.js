import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'

export async function POST(req) {
  const body = await req.json()

  try {
    const db = await getDb()
    let order = null

    if (!body?.orderId) {
      order = await createNewOrder(db)
    } else {
      const existingOrder = await db
        .collection('orders')
        .findOne({ _id: new ObjectId(body.orderId) })

      if (existingOrder?.paymentStatus === 'paid') {
        order = await createNewOrder(db)
      } else {
        order = existingOrder
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order?._id,
    })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Server error', success: false }, { status: 500 })
  }
}

async function createNewOrder(db) {
  const now = new Date()

  const order = {
    customerName: 'Unknown',
    platformOrderId: null,
    status: 'queued',
    paymentStatus: 'unpaid',
    renderStatus: 'pending',
    editorPreviewUrl: null,
    createdAt: now,
    updatedAt: now,
    items: [],
  }

  const result = await db.collection('orders').insertOne(order)
  return { ...order, _id: result.insertedId }
}
