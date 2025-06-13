import Stripe from 'stripe'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/db'

const stripe = new Stripe(process.env.STRIPE_SECRET)

export async function POST(req) {
  const { orderId, locale } = await req.json()

  if (!orderId || !ObjectId.isValid(orderId)) {
    return new Response(JSON.stringify({ error: 'Missing or invalid orderId' }), { status: 400 })
  }

  const db = await getDb()
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) })

  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return new Response(JSON.stringify({ error: 'Order not found or empty' }), { status: 404 })
  }

  const totalItems = order.items.reduce((total, item) => total + item.quantity, 0)
  // Stripe line_items from order.items
  const line_items = order.items.map((item, index) => ({
    price_data: {
      currency: getCurrency({ locale }),
      product_data: {
        name: `Custom disktrasa #${index + 1}`,
        images: item.previewUrl ? [item.previewUrl] : [],
      },
      unit_amount: calculateNetUnitAmount(getPrice({ locale, totalItems })),
    },
    quantity: item.quantity || 1,
  }))

  const totalPrice = line_items.reduce(
    (total, item) => total + item.quantity * item.price_data.unit_amount,
    0
  )

  const shippingRate = getShippingRate({ locale, totalPrice }) //totalAmount < 5000 ? SHIPPING_RATE_ID : FREE_SHIPPING_RATE_ID

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: getCurrency({ locale }),
    shipping_options: [{ shipping_rate: shippingRate }],
    payment_method_types: ['card'],
    line_items,
    customer_creation: 'always',
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['SE', 'NO', 'FI', 'DK'], // eller ['SE', 'NO', 'FI'] om du säljer till fler
    },
    automatic_tax: { enabled: true },
    payment_intent_data: {
      metadata: {
        orderId,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/editor/thank-you?orderId=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/editor/cart`,
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

const calculateNetUnitAmount = (grossSEK, vatPercent = 25) => {
  return grossSEK * 100
}

const getPrice = ({ locale, totalItems }) => {
  if (locale === 'sv') {
    if (totalItems > 300) {
      return 17.5
    } else if (totalItems > 150) {
      return 20
    } else if (totalItems > 60) {
      return 22.5
    } else if (totalItems > 5) {
      return 29
    }
    return 39
  }

  if (totalItems > 300) {
    return 2
  } else if (totalItems > 150) {
    return 2.8
  } else if (totalItems > 60) {
    return 3
  } else if (totalItems > 5) {
    return 3.53
  }
  return 4
}

const getCurrency = ({ locale }) => {
  switch (locale) {
    case 'sv':
      return 'sek'
    default:
      return 'eur'
  }
}

const getShippingRate = ({ locale, totalPrice }) => {
  if (locale === 'sv') {
    if (totalPrice > 30000) {
      return 'shr_1RZZG9P9wNW4I4PwGJXt8Zz8'
    }

    return 'shr_1RZZDmP9wNW4I4PweR3SP3JJ'
  }

  if (totalPrice > 3000) {
    return 'shr_1RZZllP9wNW4I4PwCqKFo5w5'
  }

  return 'shr_1RZZW0P9wNW4I4PwAoCWw75d'
}
