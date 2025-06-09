import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDb } from '@/lib/db/db'
import { ELink } from '@/components/ELink'
import { CreateBatchButton } from '@/components/CreateBatchsButtons'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function AdminDashboardPage({ searchParams }) {
  const cookieStore = await cookies()
  
  // Pagination parameters
  const page = parseInt(searchParams?.page) || 1
  const limit = 10
  const skip = (page - 1) * limit

  let batches = []
  let totalBatches = 0

  const db = await getDb()
  
  // Get total count for pagination
  totalBatches = await db.collection('batches').countDocuments({})
  
  // Get paginated batches
  batches = await db.collection('batches')
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()

  // Calculate total pages
  const totalPages = Math.ceil(totalBatches / limit) || 1 // Ensure at least 1 page even when empty

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Batches</h1>
      <CreateBatchButton />

      {batches.length > 0 ? (
        batches.map((batch) => (
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
        ))
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Inga batches hittades.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Pagination controls - only show if there are batches */}
      {totalBatches > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {totalBatches > 0 ? skip + 1 : 0}-{Math.min(skip + limit, totalBatches)} of {totalBatches} batches
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
            >
              {page > 1 ? (
                <ELink href={`/admin/batches?page=${page - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </ELink>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
            >
              {page < totalPages ? (
                <ELink href={`/admin/batches?page=${page + 1}`}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </ELink>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
