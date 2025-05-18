import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDb } from '@/lib/db/db'
import { ELink } from '@/components/ELink'
import { CreateBatchButton } from '@/components/CreateBatchsButtons'

export default async function AdminDashboardPage() {
  let batches

  const db = await getDb()
  batches = await db.collection('batches').find({}).sort({ createdAt: -1 }).limit(10).toArray()

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Batchöversikt</h1>
      <CreateBatchButton />

      {batches.map((batch) => (
        <ELink key={batch._id.toString()} href={`/admin/batches/${batch._id}`}>
          <Card className="hover:shadow-sm transition">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Batch: {batch?._id?.toString()}</p>
                <p className="text-sm text-gray-500">
                  Skapad: {new Date(batch.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary">{batch.status}</Badge>
            </CardContent>
          </Card>
        </ELink>
      ))}
    </main>
  )
}
