// app/api/webhooks/stripe/route.js

import Stripe from 'stripe'
import clientPromise from '@/lib/db/db'

const stripe = new Stripe(process.env.STRIPE_SECRET)

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message)
    return new Response('Webhook Error', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.orderId

    if (orderId) {
      const db = await clientPromise
      const orders = db.collection('orders')

      await orders.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { paymentStatus: 'paid', paidAt: new Date() } }
      )

      console.log(`✅ Order ${orderId} marked as paid via Stripe webhook`)
    }
  }

  return new Response('ok', { status: 200 })
}
