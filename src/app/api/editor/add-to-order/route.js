import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'
import { randomUUID } from 'crypto'
import { generateImageBuffer } from '@/helpers/generateImageBuffer'
import { uploadToS3 } from '@/helpers/uploadToS3'

export const maxDuration = 800

export async function POST(req) {
  try {
    const { item, orderId } = await req.json()

    if (!item || !orderId) {
      return NextResponse.json({ error: 'Missing item or orderId' }, { status: 400 })
    }

    const db = await getDb()
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    const savedItems = []

    const images = item.images
    const texts = item.texts

    const fullBuffer = await generateImageBuffer({
      images,
      texts,
      backgroundColor: item.backgroundColor,
      scale: 4,
    })
    const fullFilename = `orders/${orderId}/${item.id}/${randomUUID()}-full.png`
    const fullUrl = await uploadToS3(fullBuffer, fullFilename)

    const previewBuffer = await generateImageBuffer({
      images,
      backgroundColor: item.backgroundColor,
      texts,
      scale: 1,
    })
    const previewFilename = `orders/${orderId}/${item.id}/${randomUUID()}-preview.png`
    const previewUrl = await uploadToS3(previewBuffer, previewFilename)

    savedItems.push({
      id: item.id,
      quantity: item.quantity,
      imageUrl: fullUrl,
      previewUrl,
      renderStatus: 'completed',
      editorPreviewUrl: item?.editorPreviewUrl,
    })

    const result = await updateOrderWithItems({ orderId, items: savedItems })

    if (!result.result.acknowledged) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: result.updatedOrder, previewUrl })
  } catch (err) {
    console.error('[Generate Error]', err)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}

async function updateOrderWithItems({ orderId, items }) {
  const db = await getDb()
  const orders = db.collection('orders')

  if (!ObjectId.isValid(orderId)) {
    throw new Error('Invalid orderId')
  }

  const result = await orders.updateOne(
    { _id: new ObjectId(orderId) },
    {
      $push: {
        items: { $each: items },
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  )

  // Fetch the updated order document
  const updatedOrder = await orders.findOne({ _id: new ObjectId(orderId) })

  return { result, updatedOrder }
}
