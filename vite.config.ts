import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { defaultSiteUrl, normalizeSiteUrl, assertPublicEnv, indexingAllowed } from "./config/site.mjs";
import { resolveContactNumbers } from "./shared/contacts.ts";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  assertPublicEnv(env);
  const { careNumber, orderNumber } = resolveContactNumbers(env);
  const publicConfig = {
    VITE_ORDER_WHATSAPP: orderNumber,
    VITE_CUSTOMER_CARE_WHATSAPP: careNumber,
    VITE_BRAND_LOGO_URL: env.VITE_BRAND_LOGO_URL || '',
  };
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
