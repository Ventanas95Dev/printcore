import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

export async function POST(req, props) {
  const { printedAt } = await req.json()
  const params = await props.params
  const db = await getDb()

  const r = await db.collection('batches').updateOne(
    { _id: new ObjectId(params.id) },
    {
      $set: {
        status: 'sent_to_printer',
        sentToPrinterAt: new Date(printedAt),
      },
    }
  )
  console.log(r)

  return NextResponse.json({ success: true })
}
