import bundledLogo from "./assets/brand-logo.webp";

export const brandLogoUrl: string | undefined =
  import.meta.env.VITE_BRAND_LOGO_URL || bundledLogo;
