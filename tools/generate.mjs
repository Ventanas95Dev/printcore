// tools/generate-batch.js

import 'dotenv/config'
import path from 'path'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import { generatePrintFile } from './generatePrintFile.mjs'

const API_URL = process.env.BATCH_API_URL || 'http://localhost:3000/api'
const USE_MOCK = process.env.USE_MOCK === 'true'

const mockBatch = {
  _id: 'mock-batch-001',
  createdAt: new Date().toISOString(),
  status: 'filling',
  cols: 6,
  rows: 2,
  items: [
    {
      imageUrl: 'https://picsum.photos/seed/b1/200/170',
      customerName: 'Alice',
      position: { row: 0, col: 0 },
    },
    {
      imageUrl: 'https://picsum.photos/seed/b2/200/170',
      customerName: 'Bob',
      position: { row: 0, col: 1 },
    },
    {
      imageUrl: 'https://picsum.photos/seed/b3/200/170',
      customerName: 'Charlie',
      position: { row: 0, col: 2 },
    },
    {
      imageUrl: 'https://picsum.photos/seed/b4/200/170',
      customerName: 'Dana',
      position: { row: 1, col: 0 },
    },
    {
      imageUrl: 'https://picsum.photos/seed/b5/200/170',
      customerName: 'Eli',
      position: { row: 1, col: 1 },
    },
    {
      imageUrl: 'https://picsum.photos/seed/b6/200/170',
      customerName: 'Frank',
      position: { row: 1, col: 2 },
    },
  ],
}

async function run() {
  if (USE_MOCK) {
    console.log('🧪 Using mock batch...')
    const filepath = await generatePrintFile(mockBatch)
    console.log(`✅ Mock file saved at ${filepath}`)
    return
  }

  console.log('🔄 Fetching unprocessed batches from API...')

  const res = await fetch(`${API_URL}/batches?status=filling`)

  if (!res.ok) {
    console.error('❌ Failed to fetch batches:', res.status)
    process.exit(1)
  }

  const batches = await res.json()

  if (!batches.length) {
    console.log('✅ No batches pending print generation.')
    return
  }

  for (const batch of batches) {
    console.log(`🧩 Generating print file for batch ${batch._id}...`)
    const filepath = await generatePrintFile(batch)
    console.log(`✅ Done! File saved at ${filepath}`)
  }
}

run().catch((err) => {
  console.error('💥 Error:', err)
  process.exit(1)
})
