import { createCanvas, loadImage } from 'canvas'

const EDITOR_WIDTH_PX = 600
const EDITOR_HEIGHT_PX = 510

export async function generateImageBuffer(images, size) {
  const canvas = createCanvas(size.width, size.height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, size.width, size.height)

  const scaleX = size.width / EDITOR_WIDTH_PX
  const scaleY = size.height / EDITOR_HEIGHT_PX

  for (const img of images) {
    const image = await loadImage(img.url)

    const scaledX = img.x * scaleX
    const scaledY = img.y * scaleY
    const scaledWidth = img.width * scaleX
    const scaledHeight = img.height * scaleY

    const centerX = scaledX + scaledWidth / 2
    const centerY = scaledY + scaledHeight / 2

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(((img.rotation || 0) * Math.PI) / 180)
    ctx.scale(img.flipX ? -1 : 1, img.flipY ? -1 : 1)
    ctx.drawImage(image, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight)
    ctx.restore()
  }

  return canvas.toBuffer('image/png')
}
