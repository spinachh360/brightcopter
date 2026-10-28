import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { defaultSiteUrl, normalizeSiteUrl, assertPublicEnv, indexingAllowed } from "./config/site.mjs";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  assertPublicEnv(env);
  const publicConfig = {
    VITE_ORDER_WHATSAPP: env.VITE_ORDER_WHATSAPP || '917907344474',
    VITE_CUSTOMER_CARE_WHATSAPP: env.VITE_CUSTOMER_CARE_WHATSAPP || '919400885633',
    VITE_BRAND_LOGO_URL: env.VITE_BRAND_LOGO_URL || '',
  };
  for (const number of [publicConfig.VITE_ORDER_WHATSAPP, publicConfig.VITE_CUSTOMER_CARE_WHATSAPP])
    if (!/^\d{10,15}$/.test(number)) throw new Error('Public WhatsApp numbers must contain 10–15 digits.');
  if (publicConfig.VITE_BRAND_LOGO_URL) {
    const logo = new URL(publicConfig.VITE_BRAND_LOGO_URL, normalizeSiteUrl(env.SITE_URL || defaultSiteUrl));
    if (logo.protocol !== 'https:' || logo.username || logo.password) throw new Error('Logo override must be a relative path or HTTPS URL without credentials.');
  }
  return {
    plugins: [react(), tailwindcss()],
    envPrefix: [], // Never expose all VITE_* variables automatically.
    define: {
      __INDEXING_ALLOWED__: JSON.stringify(indexingAllowed(env)),
      __SITE_URL__: JSON.stringify(normalizeSiteUrl(env.SITE_URL || defaultSiteUrl)),
      ...Object.fromEntries(Object.entries(publicConfig).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])),
    },
    build: { manifest: true, sourcemap: false },
    resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  };
});
