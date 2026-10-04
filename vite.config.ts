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
    define: {
      'import.meta.env.VITE_PERLAS_SITE_URL': JSON.stringify(env.PERLAS_SITE_URL || 'https://seroffm.github.io/perlas/'),
      'import.meta.env.VITE_PERLAS_INDEX_SITE': JSON.stringify(env.PERLAS_INDEX_SITE ?? ''),
    },
    base: command === 'build' || isPreview ? productionBase(env.PERLAS_SITE_URL) : '/',
  }
})
