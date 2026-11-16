import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const root = new URL('../', import.meta.url)
let failures = 0

function report(ok, label) {
  console.log(`${ok ? 'OK' : 'FAIL'} ${label}`)
  if (!ok) failures++
}

const [major, minor] = process.versions.node.split('.').map(Number)
report(major > 20 || (major === 20 && minor >= 9), `Node ${process.versions.node} (minimum 20.9; .nvmrc selects 24)`)

try {
  for (const dependency of ['react', 'react-dom', 'vite', 'typescript']) require.resolve(dependency)
  const { versions } = require('sharp')
  report(true, `Dependencies installed; Sharp ${versions.sharp}, libvips ${versions.vips}, WebP ${versions.webp}`)
} catch {
  report(false, 'Dependencies/native image module unavailable. Run npm ci.')
}

report(existsSync(new URL('.env.development.local', root)), 'Local development config (create with npm run setup)')

const php = spawnSync('php', ['-r', `echo json_encode([
  'version' => PHP_VERSION,
  'supported' => PHP_VERSION_ID >= 80200,
  'extensions' => array_map('extension_loaded', ['curl', 'fileinfo', 'zip']),
]);`], { encoding: 'utf8' })
try {
  const info = JSON.parse(php.stdout)
  report(php.status === 0 && info.supported && info.extensions.every(Boolean),
    `PHP ${info.version}, required curl/fileinfo/zip: ${info.extensions.every(Boolean) ? 'available' : 'missing'}`)
} catch {
  report(false, 'PHP unavailable. Install PHP >=8.2 with curl/fileinfo/zip; see server/README.md.')
}

const remote = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' })
report(remote.status === 0 && /^(?:https:\/\/github\.com\/|git@github\.com:)Seroffm\/perlas(?:\.git)?\s*$/.test(remote.stdout),
  'Git origin points to Seroffm/perlas (local check; authentication is separate)')

process.exitCode = failures ? 1 : 0
