import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET)

export async function POST(req) {
  const { orderId } = await req.json()

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'sek',
          product_data: {
            name: 'Custom disktrasa',
          },
          unit_amount: 9900, // 99.00 SEK
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/editor?cancelled=true`,
  })

  return Response.json({ url: session.url })
}
