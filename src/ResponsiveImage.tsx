import type { ImgHTMLAttributes } from 'react'
import imageVariants from './image-variants.json'

type ImageVariant = { src: string; srcSet: string; width: number; height: number }
const variants: Record<string, ImageVariant> = imageVariants
const assetsPath = `${import.meta.env.BASE_URL}assets/`

type ResponsiveImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  asset: string
  alt: string
}

// Keep one asset map for both the interactive app and its initial static HTML.
export default function ResponsiveImage({
  asset,
  alt,
  sizes = '(max-width: 767px) calc(100vw - 40px), 600px',
  loading = 'lazy',
  decoding = 'async',
  ...props
}: ResponsiveImageProps) {
  const variant = variants[asset]
  const srcSet = variant?.srcSet.split(', ').map((candidate) => `${assetsPath}${candidate}`).join(', ')

  return (
    <img
      width={variant?.width}
      height={variant?.height}
      {...props}
      src={`${assetsPath}${variant?.src ?? asset}`}
      srcSet={srcSet}
      sizes={variant ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding={decoding}
    />
  )
}
