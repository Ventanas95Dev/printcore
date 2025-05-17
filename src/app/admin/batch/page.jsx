import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Toggle this flag to switch between mock and live
const USE_MOCK = true

const mockBatches = [
  {
    _id: { toString: () => 'mock001' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    status: 'filling',
  },
  {
    _id: { toString: () => 'mock002' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'ready',
  },
]

export default async function AdminDashboardPage() {
  let batches

  if (USE_MOCK) {
    batches = mockBatches
  } else {
    const client = await (await import('@/lib/db')).default
    const db = client.db()
    batches = await db.collection('batches').find({}).sort({ createdAt: -1 }).limit(10).toArray()
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Batchöversikt</h1>
      {batches.map((batch) => (
        <Link key={batch._id.toString()} href={`/admin/batch/${batch._id}`}>
          <Card className="hover:shadow-sm transition">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Batch: {batch._id.toString().slice(-6)}</p>
                <p className="text-sm text-gray-500">
                  Skapad: {new Date(batch.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary">{batch.status}</Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </main>
  )
}
