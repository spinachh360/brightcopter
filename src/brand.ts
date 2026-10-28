// Vite bundles the original artwork into both the site and portable preview.
// Add the supplied file as src/assets/brand-logo.png (or jpg/jpeg/webp/svg).
const artwork = import.meta.glob<string>(
  "./assets/brand-logo.{png,jpg,jpeg,webp,svg}",
  { eager: true, query: "?url", import: "default" },
);

export const brandLogoUrl: string | undefined =
  import.meta.env.VITE_BRAND_LOGO_URL || Object.values(artwork)[0];
