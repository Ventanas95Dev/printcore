import Stripe from 'stripe'
import clientPromise from '@/lib/db/db'
import { ObjectId } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET)

export async function POST(request) {
  const db = await clientPromise
  const orders = db.collection('orders')

  const body = await request.json()
  const fromDate = body?.fromDate ? new Date(body.fromDate) : null

  const unpaidOrders = await orders.find({ paymentStatus: { $ne: 'paid' } }).toArray()
  let updatedCount = 0

  if (unpaidOrders.length === 0) {
    return new Response(JSON.stringify({ success: true, updated: 0 }), { status: 200 })
  }

  const fallbackLatest = unpaidOrders.reduce((latest, order) => {
    const created = order.createdAt || order._id.getTimestamp()
    return created > latest ? created : latest
  }, new Date(0))

  const createdAfter = Math.floor((fromDate || fallbackLatest).getTime() / 1000)

  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    created: { gte: createdAfter },
  })

  const sessionMap = new Map()
  for (const s of sessions.data) {
    const id = s.metadata?.orderId
    if (id && s.payment_status === 'paid') {
      sessionMap.set(id, s)
    }
  }

  for (const order of unpaidOrders) {
    const match = sessionMap.get(order._id.toString())
    if (match) {
      await orders.updateOne(
        { _id: new ObjectId(order._id) },
        { $set: { paymentStatus: 'paid', paidAt: new Date(match.created * 1000) } }
      )
      updatedCount++
    }
  }

  return new Response(JSON.stringify({ success: true, updated: updatedCount }), { status: 200 })
}
