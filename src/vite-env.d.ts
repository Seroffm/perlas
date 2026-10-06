/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PERLAS_API_URL?: string
  readonly VITE_PERLAS_GA_MEASUREMENT_ID?: string
  readonly VITE_PERLAS_SITE_URL: string
  readonly VITE_PERLAS_INDEX_SITE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
