export const defaultSiteUrl = 'https://brightcopter-in.web.app';
export function normalizeSiteUrl(value = defaultSiteUrl) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/')
    throw new Error('SITE_URL must be a public HTTPS origin, without credentials, path, query or fragment.');
  return url.origin;
}
export function assertPublicEnv(env) {
  const allowed = new Set(['VITE_ORDER_WHATSAPP', 'VITE_CUSTOMER_CARE_WHATSAPP', 'VITE_BRAND_LOGO_URL']);
  for (const key of Object.keys(env)) if (key.startsWith('VITE_') && !allowed.has(key))
    throw new Error(`Unexpected frontend environment variable ${key}. Keep secrets server-side; explicitly review public configuration before exposing it.`);
}

export function indexingAllowed(env) {
  return env.ROBOTS_PREVIEW !== 'true' && (!env.CONTEXT || env.CONTEXT === 'production');
}
