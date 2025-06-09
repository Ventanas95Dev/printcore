import fs from 'fs'
import path from 'path'

const fontRoot = path.join(process.cwd(), 'public', 'fonts')
const families = fs.readdirSync(fontRoot).filter((f) =>
  fs.statSync(path.join(fontRoot, f)).isDirectory()
)

const result = []

for (const family of families) {
  const familyPath = path.join(fontRoot, family)
  const files = fs.readdirSync(familyPath)
  for (const file of files) {
    if (file.endsWith('.ttf') || file.endsWith('.otf')) {
      const fontWeight = inferFontWeight(file)
      const fontStyle = inferFontStyle(file)

      result.push({
        family,
        file: `${family}/${file}`,
        weight: fontWeight,
        style: fontStyle,
      })
    }
  }
}

fs.writeFileSync(path.join(process.cwd(), 'src/helpers/fonts.json'), JSON.stringify(result, null, 2))
console.log(`✅ Generated fonts.json with ${result.length} fonts`)

// Helpers

function inferFontWeight(filename) {
  filename = filename.toLowerCase()
  if (filename.includes('thin')) return '100'
  if (filename.includes('extralight') || filename.includes('extra-light')) return '200'
  if (filename.includes('light')) return '300'
  if (filename.includes('regular') || filename.includes('normal')) return '400'
  if (filename.includes('medium')) return '500'
  if (filename.includes('semibold') || filename.includes('semi-bold')) return '600'
  if (filename.includes('bold')) return '700'
  if (filename.includes('extrabold') || filename.includes('extra-bold')) return '800'
  if (filename.includes('black') || filename.includes('heavy')) return '900'
  return '400' // fallback
}

function inferFontStyle(filename) {
  filename = filename.toLowerCase()
  if (filename.includes('italic')) return 'italic'
  return 'normal'
}
