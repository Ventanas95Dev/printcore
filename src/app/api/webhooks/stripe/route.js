import Stripe from 'stripe'
import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'

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
    const customer = session.customer_details
    if (orderId) {
      const db = await getDb()
      const orders = db.collection('orders')

      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
      const receiptUrl = paymentIntent?.charges?.data?.[0]?.receipt_url

      await orders.updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            paymentStatus: 'paid',
            paidAt: new Date(),
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

      console.log(`✅ Order ${orderId} marked as paid via Stripe webhook`)
    }
  }

  return new Response('ok', { status: 200 })
}
