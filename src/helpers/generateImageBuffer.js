import { createCanvas as nodeCreateCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'
import Konva from 'konva'
import fonts from './fonts.json'
// Fix __dirname i ES-moduler
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TILE_WIDTH_PX = 590.5
const TILE_HEIGHT_PX = 531.5

export async function generateImageBuffer({
  images = [],
  texts = [],
  backgroundColor = '#ffffff',
  scale = 1,
}) {
  const SCALE = scale
  const WIDTH = TILE_WIDTH_PX * SCALE
  const HEIGHT = TILE_HEIGHT_PX * SCALE

  const stage = new Konva.Stage({ width: WIDTH, height: HEIGHT })
  const layer = new Konva.Layer()
  stage.add(layer)

  // Bakgrund
  const background = new Konva.Rect({
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
    fill: backgroundColor,
  })
  layer.add(background)

  // Bilder
  for (const img of images) {
    const image = await loadImage(img.uploadedUrl)
    const konvaImage = new Konva.Image({
      image,
      x: img.x * SCALE + (img.width * SCALE) / 2,
      y: img.y * SCALE + (img.height * SCALE) / 2,
      width: img.width * SCALE,
      height: img.height * SCALE,
      offsetX: (img.width * SCALE) / 2,
      offsetY: (img.height * SCALE) / 2,
      rotation: img.rotation || 0,
    })
    layer.add(konvaImage)
  }

  // Texter
  for (const text of texts) {
    console.log(text)
    const konvaText = new Konva.Text({
      x: text.x * SCALE,
      y: text.y * SCALE,
      text: text.text,
      fontSize: text.fontSize * SCALE,
      fontFamily: text.fontFamily || 'Roboto',
      fontStyle: text.fontWeight || '400',
      fill: text.fill || text.color || '#000000',
      width: text.width * SCALE,
      align: text.align || 'left',
      rotation: text.rotation || 0,
      lineHeight: text.lineHeight || 1,
      wrap: text.wrap || 'word',
      offsetY: text.offsetY || 0,
      offsetX: text.offsetX || 0,
      padding: text.padding || 0,
      verticalAlign: text.verticalAlign || 'top',
    })
    layer.add(konvaText)
  }

  const frame = await stage.toCanvas()
  const buffer = frame.toBuffer('image/png')

  return buffer
}


export function registerFonts() {
  const fontRoot = path.join(process.cwd(), 'public', 'fonts')

  for (const font of fonts) {
    // console.log(
    //   `Registering font ${font.file} for family ${font.family} with weight ${font.weight} and style ${font.style}`
    // )
    registerFont(path.join(fontRoot, font.file), {
      family: font.family,
      weight: font.weight,
      style: font.style,
    })
  }
}
registerFonts()
