import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'

export async function POST(req) {
  const body = await req.json()

  if (!body?.editorPreviewUrl || !body.orderId) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
  }

  try {
    const db = await getDb()
    const result = await db
      .collection('orders')
      .updateOne(
        { _id: new ObjectId(body.orderId) },
        { $set: { editorPreviewUrl: body.editorPreviewUrl } }
      )

    return NextResponse.json({
      status: 'ok',
    })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
