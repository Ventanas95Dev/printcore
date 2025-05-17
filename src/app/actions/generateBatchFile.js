'use server'

import clientPromise from '@/lib/db/db'
import { ObjectId } from 'mongodb'

export async function generateBatchFile(batchId) {
  if (!batchId) {
    throw new Error('Missing batchId')
  }

  const client = await clientPromise
  const db = client.db()
  const batch = await db.collection('batches').findOne({ _id: new ObjectId(batchId) })

  if (!batch) {
    throw new Error(`Batch not found: ${batchId}`)
  }

  console.log(`[generateBatchFile] Generating file for batch ${batchId}`)
  console.log(`Items: ${batch.items.length}`)

  // TODO:
  // 1. Download all image URLs (batch.items[x].imageUrl)
  // 2. Compose grid layout (e.g. using sharp or node-canvas)
  // 3. Export TIFF at 300 DPI
  // 4. Save to disk or upload to S3 / SMB
  // 5. Update batch.status to 'printed' or 'generated'

  return { success: true }
}
