import assert from 'node:assert/strict'
import test from 'node:test'
import sharp from 'sharp'
import { restrictToRasterImages } from './raster-safety.mjs'

test('raster pipeline rejects SVG before metadata decoding while valid PNG remains usable', async () => {
  restrictToRasterImages(sharp)
  const disguisedSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="red"/></svg>')
  await assert.rejects(sharp(disguisedSvg).metadata(), /blocked|disabled|unsupported/i)
  const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#124094' } }).png().toBuffer()
  const metadata = await sharp(png).metadata()
  assert.equal(metadata.format, 'png')
  assert.equal(metadata.width, 8)
})
