import { getDb } from '@/lib/db/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ObjectId } from 'mongodb'
import { generateBatchFile } from '@/app/actions/generateBatchFile'
import { notFound } from 'next/navigation'
import { CreatePrintFileButton } from '@/components/CreatePrintFileButton'

export default async function BatchDetailPage(props) {
  const params = await props.params

  const db = await getDb()
  const batches = db.collection('batches')
  const batch = await batches.findOne({ _id: new ObjectId(params.id) })

  if (!batch) return notFound()

  const grid = Array.from({ length: batch.rows }, () => Array(batch.cols).fill(null))

  batch.items.forEach((item) => {
    const { row, col } = item.position
    grid[row][col] = item
  })

  return (
    <main className="p-6 space-y-4">
      {batch.status !== 'generated' && <CreatePrintFileButton batchId={params.id} />}

      <h1 className="text-2xl font-bold">Batch: {params.id}</h1>
      <Badge variant="secondary">{batch.status}</Badge>

      {batch.generatedAt && (
        <p className="text-sm text-muted-foreground mt-2">
          Generated at:{' '}
          {new Date(batch.generatedAt).toLocaleString('sv-SE', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      )}

      {batch.previewImageUrl && (
        <div>
          <h2 className="text-lg font-medium mt-6 mb-2">Preview</h2>
          <img
            src={batch.previewImageUrl}
            alt="Batch preview"
            className="border rounded max-w-full h-auto"
          />
        </div>
      )}

      {batch.printFileUrl && (
        <div className="mt-4">
          <a
            href={batch.printFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline text-blue-600"
          >
            Download print file (TIFF)
          </a>
        </div>
      )}

      <div className="space-y-2">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((item, colIndex) => (
              <Card
                key={colIndex}
                className="w-[200px] h-[170px] flex items-center justify-center relative"
              >
                {item ? (
                  <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={item.imageUrl}
                      alt={item.customerName}
                      className="max-w-full max-h-full object-contain hover:scale-105 transition-transform"
                    />
                  </a>
                ) : (
                  <span className="text-gray-400">Empty</span>
                )}
                <span className="absolute bottom-0 left-0 bg-white bg-opacity-70 text-xs px-1">
                  {item?.customerName || '–'}
                </span>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}
