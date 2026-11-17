import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

// Reuse the unmodified P outline from the supplied wordmark. The square canvas
// keeps it legible at favicon sizes without changing the website's full logo.
const logo = await readFile(new URL('../public/assets/perlas-logo.svg', import.meta.url), 'utf8')
const polygons = [...logo.matchAll(/<polygon\b[^>]*\bpoints="([^"]+)"[^>]*\/>/g)]
assert.equal(polygons.length, 1, 'The source wordmark must have one identifiable P outline')
assert(/^[\d\s.,-]+$/.test(polygons[0][1]), 'Only numeric geometry from the tracked wordmark is accepted')
const coordinates = polygons[0][1].trim().split(/[\s,]+/).map(Number)
assert(coordinates.length >= 6 && coordinates.length <= 512 && coordinates.length % 2 === 0
  && coordinates.every(value => Number.isFinite(value) && Math.abs(value) < 10000), 'Bounded numeric logo geometry required')
const icon = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="368" height="368" viewBox="0 0 368 368"><rect width="368" height="368" fill="#fff"/><polygon transform="translate(57 24)" fill="#073372" fill-rule="evenodd" points="${polygons[0][1]}"/></svg>`)
const sizes = [16, 32, 48, 64, 128, 256]
const frames = await Promise.all(sizes.map((size) => sharp(icon).resize(size, size).png().toBuffer()))
const directory = Buffer.alloc(6 + 16 * sizes.length)
directory.writeUInt16LE(1, 2)
directory.writeUInt16LE(sizes.length, 4)
let offset = directory.length
for (const [index, size] of sizes.entries()) {
  const position = 6 + index * 16
  directory[position] = size === 256 ? 0 : size
  directory[position + 1] = size === 256 ? 0 : size
  directory.writeUInt16LE(1, position + 4)
  directory.writeUInt16LE(32, position + 6)
  directory.writeUInt32LE(frames[index].length, position + 8)
  directory.writeUInt32LE(offset, position + 12)
  offset += frames[index].length
}
await writeFile(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([directory, ...frames]))
console.log(`Created favicon.ico with ${sizes.join(', ')}px frames from the existing Perla’s P outline.`)
