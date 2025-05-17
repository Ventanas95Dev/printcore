// lib/print/generatePrintFile.js

import sharp from 'sharp'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

const DPI = 300
const mmToInch = (mm) => mm / 25.4
const px = (mm) => Math.round(mmToInch(mm) * DPI)

const TILE_WIDTH_MM = 200
const TILE_HEIGHT_MM = 170
const TILE_WIDTH_PX = px(TILE_WIDTH_MM)
const TILE_HEIGHT_PX = px(TILE_HEIGHT_MM)

export async function generatePrintFile(batch) {
  const { rows, cols, items } = batch
  const WIDTH = TILE_WIDTH_PX * cols
  const HEIGHT = TILE_HEIGHT_PX * rows

  const compositeList = []

  for (const item of items) {
    const { imageUrl, position } = item
    const imgBuffer = await fetchImageBuffer(imageUrl)

    compositeList.push({
      input: imgBuffer,
      top: position.row * TILE_HEIGHT_PX,
      left: position.col * TILE_WIDTH_PX,
    })
  }

  const canvas = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })

  const output = await canvas
    .composite(compositeList)
    .tiff({ compression: 'none', resolutionUnit: 'inch', xres: DPI, yres: DPI })
    .toBuffer()

  const filename = `batch_${batch._id}.tiff`
  const filePath = path.join('./output', filename)
  await fs.mkdir('./output', { recursive: true })
  await fs.writeFile(filePath, output)

  console.log(`✅ Saved batch TIFF to ${filePath}`)
  return filePath
}

async function fetchImageBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`)
  return Buffer.from(await res.arrayBuffer())
}
