The website imports `brand-logo.webp` by default. No environment configuration
is required. Regenerate it from the retained original PNG with
`npm run assets:brand` (requires the installed Playwright browser).

`src/brand.ts` imports this asset through Vite, so the regular build bundles it
and `scripts/export-preview.mjs` embeds it in the downloadable HTML. The header
and footer show the complete artwork with its original proportions.

`brand-logo.png` is the exact original extracted from the supplied
`Bright Copter Lion Bond Logo.zip`: 1672 × 941 pixels, RGB PNG. The red background,
white wordmark, lion and cub, trademark and tagline are preserved. The image has
not been cropped, recoloured, regenerated or re-encoded. The WebP is a high-quality
format conversion of this original, with all artwork and dimensions retained.
Its rounded, flush-left header badge is styled in CSS; the footer remains contained.

Original PNG SHA-256:
`b825c7c7f6a6ece5a34e304c06985fadbab99b4937da16f4b0b3d2bae245d038`
