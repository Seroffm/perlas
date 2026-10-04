/**
 * Generate responsive WebP copies of every JPEG/PNG photo in public/assets/kundenbilder
 * and the six partner logos used by the website (JPEG/PNG/WebP).
 * Originals are never changed. No cropping, upscaling, retouching or remote downloads.
 *
 * Requirements: Node.js 20+ and Sharp (tested with 0.35.4 / libvips 8.18.6).
 * Use a project-installed Sharp, or point PERLAS_SHARP_MODULE at an existing Sharp module:
 *   $env:PERLAS_SHARP_MODULE = 'C:/path/to/node_modules/sharp'
 *   node scripts/optimize-images.mjs
 *   node scripts/optimize-images.mjs --check
 *
 * --check verifies existing output bytes and the manifest without modifying any files.
 * JSON contract: original asset-relative path -> { src, srcSet, width, height }.
 * src/srcSet are asset-relative, without the website base path. Dimensions describe
 * the original image after EXIF orientation, preserving its intrinsic aspect ratio.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require(process.env.PERLAS_SHARP_MODULE || 'sharp');
} catch {
  throw new Error('Sharp is required. Set PERLAS_SHARP_MODULE to an existing Sharp module, or install Sharp as a development dependency before running this generator.');
}
const checkOnly = process.argv.includes('--check');
if (process.argv.slice(2).some(argument => argument !== '--check')) {
  throw new Error('Usage: node scripts/optimize-images.mjs [--check]');
}
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(workspace, 'public', 'assets');
const sources = path.join(assets, 'kundenbilder');
const destination = path.join(assets, 'optimized');
const manifestPath = path.join(workspace, 'src', 'image-variants.json');
const widths = [320, 640, 960, 1280];
const partnerWidths = [160, 320, 480];
// Only the displayed logo sources are generated, not unused alternatives or fallbacks.
const partnerSources = [
  'partners/david-lloyd-clubs.png',
  'partners/immtelli.png',
  'partners/uniresta.jpeg',
  'partners/valo.png',
  'partners/zeidler.webp',
  'partners/bundesanstalt.webp',
];
const encoder = { quality: 82, alphaQuality: 100, effort: 5, smartSubsample: true };
// Keep the photo configuration byte-for-byte stable so existing photo filenames persist.
const configuration = JSON.stringify({ widths, encoder, orientation: 'auto', sharp: sharp.versions.sharp, vips: sharp.versions.vips, webp: sharp.versions.webp });
const partnerConfiguration = JSON.stringify({ widths: partnerWidths, encoder, orientation: 'auto', sharp: sharp.versions.sharp, vips: sharp.versions.vips, webp: sharp.versions.webp });
const compare = (left, right) => left < right ? -1 : left > right ? 1 : 0;

async function findPhotos(directory) {
  const entries = (await fs.readdir(directory, { withFileTypes: true })).sort((left, right) => compare(left.name, right.name));
  const results = [];
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Symlink sources are not supported: ${filename}`);
    }
    if (entry.isDirectory()) results.push(...await findPhotos(filename));
    else if (entry.isFile() && /\.(?:png|jpe?g)$/i.test(entry.name)) results.push(filename);
  }
  return results;
}

function assertOutputPath(filename) {
  const relative = path.relative(destination, filename);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('An output path escaped the generated image directory.');
  }
}

const photoFiles = await findPhotos(sources);
if (!photoFiles.length) throw new Error('No JPEG/PNG source photos found.');
const partnerFiles = partnerSources.sort(compare).map(assetPath => path.join(assets, ...assetPath.split('/')));
for (const filename of partnerFiles) {
  const entry = await fs.lstat(filename);
  if (entry.isSymbolicLink() || !entry.isFile()) {
    throw new Error(`Partner logo sources must be regular files: ${filename}`);
  }
}
const inputFiles = [...photoFiles, ...partnerFiles];
if (!checkOnly) await fs.mkdir(destination, { recursive: true });
const manifest = {};
const statistics = { images: 0, variants: 0, originalBytes: 0, defaultVariantBytes: 0, allVariantBytes: 0, smallestVariantBytes: 0 };
const outputNames = new Set();
for (const filename of inputFiles) {
  const assetPath = path.relative(assets, filename).split(path.sep).join('/');
  const isPartner = assetPath.startsWith('partners/');
  const bytes = await fs.readFile(filename);
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
    throw new Error(`Invalid JPEG/PNG/WebP source or dimensions: ${assetPath}`);
  }
  if ((metadata.pages ?? 1) > 1) throw new Error(`Animated image sources require separate treatment: ${assetPath}`);
  // EXIF orientations 5–8 swap width and height; rotate() performs only this orientation.
  const swapsAxes = [5, 6, 7, 8].includes(metadata.orientation);
  const originalWidth = swapsAxes ? metadata.height : metadata.width;
  const originalHeight = swapsAxes ? metadata.width : metadata.height;
  const targetWidths = isPartner ? partnerWidths : widths;
  const sizes = [...new Set(targetWidths.map(width => Math.min(width, originalWidth)))].sort((left, right) => left - right);
  const slug = assetPath.replace(/^kundenbilder\//, '').replace(/\.[^.]+$/, '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 88);
  const imageConfiguration = isPartner ? partnerConfiguration : configuration;
  const hash = createHash('sha256').update(assetPath).update('\0').update(imageConfiguration).update('\0').update(bytes).digest('hex').slice(0, 10);
  const variants = [];
  let defaultBytes = 0;
  let smallestBytes = 0;
  for (const width of sizes) {
    const name = `${slug}-${hash}-${width}.webp`;
    if (outputNames.has(name)) throw new Error(`Generated filename collision: ${name}`);
    outputNames.add(name);
    const output = path.join(destination, name);
    assertOutputPath(output);
    const { data, info } = await sharp(bytes).rotate()
      .resize({ width, withoutEnlargement: true, fit: 'inside' }).webp(encoder)
      .toBuffer({ resolveWithObject: true });
    if (info.width !== width || info.width > originalWidth || info.height > originalHeight
        || Math.abs(info.height - originalHeight * width / originalWidth) > 1) {
      throw new Error(`Unexpected aspect ratio or upscaling: ${assetPath}`);
    }
    if (checkOnly) {
      const existing = await fs.readFile(output);
      if (!existing.equals(data)) throw new Error(`Outdated or altered variant: ${name}`);
    } else {
      await fs.writeFile(output, data);
    }
    variants.push({ path: `optimized/${name}`, width });
    statistics.variants++;
    statistics.allVariantBytes += data.length;
    defaultBytes = data.length;
    if (!smallestBytes) smallestBytes = data.length;
  }
  manifest[assetPath] = {
    src: variants.at(-1).path,
    srcSet: variants.map(variant => `${variant.path} ${variant.width}w`).join(', '),
    width: originalWidth,
    height: originalHeight,
  };
  statistics.images++;
  statistics.originalBytes += bytes.length;
  statistics.defaultVariantBytes += defaultBytes;
  statistics.smallestVariantBytes += smallestBytes;
  if (statistics.images % 10 === 0 || statistics.images === inputFiles.length) {
    console.log(`${checkOnly ? 'Verified' : 'Generated'} ${statistics.images}/${inputFiles.length} image sets`);
  }
}
const json = JSON.stringify(manifest, null, 2) + '\n';
if (checkOnly) {
  if (await fs.readFile(manifestPath, 'utf8') !== json) throw new Error('Image manifest is outdated or altered.');
} else {
  // This file is wholly derived from source images and regenerated mechanically.
  await fs.writeFile(manifestPath, json);
}
console.log(JSON.stringify({ ...statistics,
  defaultSavingsPercent: Number((100 * (1 - statistics.defaultVariantBytes / statistics.originalBytes)).toFixed(1)),
  mode: checkOnly ? 'verification' : 'generation',
  sharp: sharp.versions.sharp, vips: sharp.versions.vips, webp: sharp.versions.webp,
}, null, 2));
