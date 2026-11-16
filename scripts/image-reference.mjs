// Keep the existing exact byte comparison. ARM64 encoders can round differently.
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const action = process.argv[2]
if (process.argv.length !== 3 || !['--setup', '--check'].includes(action)) {
  throw new Error('Usage: node scripts/image-reference.mjs --setup|--check')
}
const macArm = process.platform === 'darwin' && process.arch === 'arm64'
const reference = new URL('../.tmp-sharp-x64/node_modules/sharp/', import.meta.url)
const sharpVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).devDependencies.sharp

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit' })
  if (result.error) console.error(result.error.message)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

if (action === '--setup') {
  if (macArm) {
    run('arch', ['-x86_64', process.execPath, '--version'])
    const manifest = new URL('package.json', reference)
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest)).version === sharpVersion) {
      console.log(`Kept isolated x64 Sharp ${sharpVersion} for exact image verification.`)
    } else {
      run('npm', ['install', '--prefix', '.tmp-sharp-x64', '--cpu=x64', '--os=darwin',
        '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false',
        '--cache', '.tmp-npm-cache', `sharp@${sharpVersion}`])
    }
  } else {
    console.log('Image verification uses the native Node/Sharp installation.')
  }
} else if (macArm) {
  if (!existsSync(new URL('package.json', reference))) {
    throw new Error('Missing isolated x64 image verifier. Run npm run setup:images; see docs/DEVELOPMENT.md.')
  }
  console.log('Checking exact image bytes with x64/Rosetta; tracked assets remain unchanged.')
  run('arch', ['-x86_64', process.execPath, 'scripts/optimize-images.mjs', '--check'], {
    ...process.env, PERLAS_SHARP_MODULE: fileURLToPath(reference),
  })
} else {
  run(process.execPath, ['scripts/optimize-images.mjs', '--check'])
}
