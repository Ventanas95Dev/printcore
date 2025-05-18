import Stripe from 'stripe'
import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET)

export async function POST() {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = await getDb()
  const orders = db.collection('orders')

  const unpaidOrders = await orders
    .find({
      paymentStatus: { $ne: 'paid' },
      stripeSessionId: { $exists: true },
    })
    .toArray()

  let updatedCount = 0

  for (const order of unpaidOrders) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)

      if (!session.payment_intent) continue

      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent.toString())
      const customer = session.customer_details
      const receiptUrl = paymentIntent?.charges?.data?.[0]?.receipt_url

      if (paymentIntent.status === 'succeeded') {
        const result = await orders.updateOne(
          { _id: new ObjectId(order._id) },
          {
            $set: {
              paymentStatus: 'paid',
              paidAt: new Date(paymentIntent.created * 1000),
              stripePaymentIntentId: paymentIntent.id,
              customerName: customer.name,
              customerEmail: customer.email,
              address: customer.address,
              stripeSessionId: session.id,
              stripePaymentIntent: session.payment_intent,
              stripeReceiptUrl: receiptUrl,
              updatedAt: new Date(),
            },
          }
        )

        if (result.modifiedCount > 0) updatedCount++
      }
    } catch (err) {
      console.error(`Failed to sync payment for order ${order._id}:`, err)
    }
  }

  return new Response(JSON.stringify({ success: true, updated: updatedCount }), { status: 200 })
}
