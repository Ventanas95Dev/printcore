import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import clientPromise from "@/lib/db/db";



export default async function AdminDashboardPage() {
  let batches

  const client = await clientPromise
    const db = client.db()
    batches = await db.collection('batches').find({}).sort({ createdAt: -1 }).limit(10).toArray()


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
