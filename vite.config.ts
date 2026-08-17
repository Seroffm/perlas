import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function productionBase(siteUrl?: string) {
  if (!siteUrl) return '/perlas/'

  const pathname = new URL(siteUrl).pathname
  return pathname.slice(-1) === '/' ? pathname : `${pathname}/`
}

export default defineConfig(({ command, isPreview, mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    base: command === 'build' || isPreview ? productionBase(env.PERLAS_SITE_URL) : '/',
  }
})
