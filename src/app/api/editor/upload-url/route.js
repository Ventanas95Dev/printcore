import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function POST(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.EDITOR_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { fileType = 'image/png', extension = 'png', folder = 'images' } = body

    const fileName = `${randomUUID()}.${extension}`
    const key = `${folder}/${fileName}`

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: fileType,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 min

    return NextResponse.json({ url, key })
  } catch (err) {
    console.error('[Presign Error]', err)
    return NextResponse.json({ error: 'Could not generate upload URL' }, { status: 500 })
  }
}
