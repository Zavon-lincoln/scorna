const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SIZES = [16, 32, 48]

// SVG uses generic serif so librsvg can render it reliably
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#0A0A0A"/>
  <text
    x="${size / 2}"
    y="${Math.round(size * 0.82)}"
    font-family="Georgia, serif"
    font-size="${Math.round(size * 0.84)}"
    font-weight="normal"
    fill="#C41A1A"
    text-anchor="middle"
  >S</text>
</svg>`

// Wrap PNG buffers into a multi-size ICO
function buildIco(images) {
  // images: array of { size, png }
  const count = images.length
  const headerSize = 6
  const entrySize = 16
  const dataOffset = headerSize + entrySize * count

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: ICO
  header.writeUInt16LE(count, 4)

  let currentOffset = dataOffset
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(entrySize)
    entry.writeUInt8(size === 256 ? 0 : size, 0) // width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2)                        // color count (truecolor)
    entry.writeUInt8(0, 3)                        // reserved
    entry.writeUInt16LE(1, 4)                     // planes
    entry.writeUInt16LE(32, 6)                    // bit depth
    entry.writeUInt32LE(png.length, 8)            // byte size of image data
    entry.writeUInt32LE(currentOffset, 12)        // offset to image data
    currentOffset += png.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map(i => i.png)])
}

async function main() {
  const images = await Promise.all(
    SIZES.map(async (size) => {
      const png = await sharp(Buffer.from(svg(size)))
        .png()
        .toBuffer()
      return { size, png }
    })
  )

  const ico = buildIco(images)
  const outPath = path.join(__dirname, '../public/favicon.ico')
  fs.writeFileSync(outPath, ico)
  console.log(`✓ favicon.ico written (${SIZES.join('/')}px, ${ico.length} bytes)`)
}

main().catch(err => { console.error(err); process.exit(1) })
