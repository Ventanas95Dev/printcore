import Stripe from 'stripe'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/db'

const stripe = new Stripe(process.env.STRIPE_SECRET)

export async function POST(req) {
  const { orderId } = await req.json()

  if (!orderId || !ObjectId.isValid(orderId)) {
    return new Response(JSON.stringify({ error: 'Missing or invalid orderId' }), { status: 400 })
  }

  const db = await getDb()
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) })

  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return new Response(JSON.stringify({ error: 'Order not found or empty' }), { status: 404 })
  }
  // Stripe line_items from order.items
  const line_items = order.items.map((item, index) => ({
    price_data: {
      currency: 'sek',
      product_data: {
        name: `Custom disktrasa #${index + 1}`,
        images: item.previewUrl ? [item.previewUrl] : [],
      },
      unit_amount: calculateNetUnitAmount(39),
    },
    quantity: item.quantity || 1,
  }))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    customer_creation: 'always',
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['SE'], // eller ['SE', 'NO', 'FI'] om du säljer till fler
    },
    automatic_tax: { enabled: true },
    payment_intent_data: {
      metadata: {
        orderId,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/editor?cancelled=true`,
  })

  await db.collection('orders').updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        stripeSessionId: session.id,
        stripeSessionCreatedAt: new Date(session.created * 1000), // valfritt men bra för sync
      },
    }
  )

  return Response.json({ url: session.url })
}

function calculateNetUnitAmount(grossSEK, vatPercent = 25) {
  const net = grossSEK / (1 + vatPercent / 100)
  return Math.round(net * 100) // Stripe needs öre
}
