import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/db'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function POST(req) {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { since } = await req.json()

    const sinceDate = since ? new Date(since) : new Date(Date.now() - 1000 * 60 * 60 * 24)

    // 🔁 Hämta nya ordrar från e-commerce (mockad här)
    const fetchedOrders = await mockFetchFromShopify({ since: sinceDate })

    const db = await getDb()

    let imported = 0

    for (const order of fetchedOrders) {
      const exists = await db
        .collection('orders')
        .findOne({ platformOrderId: order.platformOrderId })

      if (!exists) {
        await db.collection('orders').insertOne({
          ...order,
          status: 'queued',
          createdAt: new Date(order.createdAt),
        })
        imported++
      }
    }

    return NextResponse.json({
      status: 'ok',
      imported,
    })
  } catch (err) {
    console.error('[Sync Orders]', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

// 🔁 Mock-funktion – byt mot Shopify/Centra API-anrop
async function mockFetchFromShopify({ since }) {
  return [
    {
      platformOrderId: 'shopify-9001',
      customerName: 'Synced Order',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      items: [
        {
          designId: 'sync001',
          imageUrl: 'https://picsum.photos/seed/sync1/200/170',
          quantity: 2,
        },
      ],
    },
  ]
}
