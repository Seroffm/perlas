// Vendor-documented mitigation for GHSA-wq5f-xc86-pv6w. This pipeline accepts
// JPEG/PNG/WebP only; reject disguised SVGs before librsvg can parse metadata.
// Keep the pinned encoder so all existing image bytes remain reproducible.
export function restrictToRasterImages(sharp) {
  sharp.block({ operation: ['VipsForeignLoadSvg'] })
}
