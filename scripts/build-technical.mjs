import { createServer, loadEnv } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSiteUrl, defaultSiteUrl, indexingAllowed } from '../config/site.mjs';
import { firebaseHostingConfig } from '../config/firebase.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const env = {...loadEnv('production', root, ''), ...process.env};
const origin = normalizeSiteUrl(env.SITE_URL || defaultSiteUrl);
const indexable = indexingAllowed(env);
const manifest = JSON.parse(await readFile(path.join(dist, '.vite/manifest.json'), 'utf8'));
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const marker of ['SEO_START', 'SEO_END', 'STATIC_CONTENT_START', 'STATIC_CONTENT_END']) {
  if (!template.includes(`<!-- ${marker} -->`)) throw new Error(`Missing HTML build marker: ${marker}`);
}
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const resolveAsset = source => {
  if (/^(data:|https:)/.test(source)) return source;
  const item = manifest[source.replace(/^\//, '')];
  if (item) return `/${item.file}`;
  // Vite inlines small assets, so they have no manifest entry. The same small
  // checked-in category thumbnails must also work in the prerendered markup.
  const local = path.resolve(root, source.replace(/^\//, ''));
  const mime = {'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'}[path.extname(local)];
  if (local.startsWith(path.join(root, 'src/assets/') ) && mime) {
    const bytes = readFileSync(local);
    if (bytes.length <= 4096) return `data:${mime};base64,${bytes.toString('base64')}`;
  }
  throw new Error(`Missing built image in manifest: ${source}`);
};
const server = await createServer({root, mode: 'production', server: {middlewareMode: true, hmr: false, watch: null}, appType: 'custom', optimizeDeps: {noDiscovery: true, include: []}});
try {
  const { pageMetadata, safeJson, publicRoutes, privateRoutes } = await server.ssrLoadModule('/src/seo.ts');
  const { productOptions, money } = await server.ssrLoadModule('/src/data.ts');
  const { careNumber, careDisplay } = await server.ssrLoadModule('/src/contacts.ts');
  const { renderRoute } = await server.ssrLoadModule('/src/prerender.tsx');
  const { NIMBUS_CSS } = await server.ssrLoadModule('/components/ui/liquid-glass-navbar.tsx');
  const styleHash = `'sha256-${createHash('sha256').update(NIMBUS_CSS).digest('base64')}'`;
  const hashes = new Set();
  function head(meta) {
    const schema = safeJson(meta.schema);
    hashes.add(`'sha256-${createHash('sha256').update(schema).digest('base64')}'`);
    return `<title data-seo>${escape(meta.title)}</title>\n` + [
      ['name','description',meta.description], ['name','robots',meta.index ? 'index,follow' : 'noindex,nofollow'],
      ['property','og:title',meta.title], ['property','og:description',meta.description],
      ['property','og:type',meta.type], ['property','og:site_name','Bright Copter'], ['property','og:locale','en_IN'],
      ['property','og:url',meta.canonical], ['property','og:image',meta.image],
      ['property','og:image:alt',meta.imageAlt],
      ['property','og:image:width','1200'], ['property','og:image:height','630'], ['property','og:image:type','image/jpeg'],
      ['name','twitter:card','summary_large_image'], ['name','twitter:title',meta.title],
      ['name','twitter:description',meta.description], ['name','twitter:image',meta.image], ['name','twitter:image:alt',meta.imageAlt],
    ].map(([key, name, content]) => `<meta data-seo ${key}="${escape(name)}" content="${escape(content)}">`).join('\n') +
      (meta.index ? `\n<link data-seo rel="canonical" href="${escape(meta.canonical)}">` : '') +
      `\n<script data-seo type="application/ld+json">${schema}</script>`;
  }
  function body(meta) {
    let html = renderRoute(meta.path).replace(/\b(src|href)="(\/src\/assets\/[^"]+)"/g,
      (_match, attribute, source) => `${attribute}="${escape(resolveAsset(source))}"`);
    // Native GET submission must never put customer details into a URL when JS
    // is disabled. Interactive forms are mounted by React after startup.
    html = html.replace(/<form\b[^>]*>[\s\S]*?<\/form>/g,
      `<aside class="notice"><p>Enable JavaScript to prepare a request, or call Bright Copter on <a href="tel:+${escape(careNumber)}">${escape(careDisplay)}</a>.</p></aside>`);
    const options = meta.product ? `<ul>${productOptions(meta.product).map(option =>
      `<li><a href="/product/${option.id}">${escape(option.name)} · ${option.warranty}-year warranty · ${escape(money(option.price))}</a></li>`).join('')}</ul>` : '';
    return html + `<noscript><aside class="container notice"><p>The catalogue is available here. Enable JavaScript for colour selection, comparison and WhatsApp checkout, or contact customer care on <a href="tel:+${escape(careNumber)}">${escape(careDisplay)}</a>.</p>${options}</aside></noscript>`;
  }
  for (const route of [...publicRoutes, ...privateRoutes, '/404']) {
    const meta = pageMetadata(route, resolveAsset);
    const html = template.replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, `<!-- SEO_START -->\n${head(meta)}\n<!-- SEO_END -->`)
      .replace(/<!-- STATIC_CONTENT_START -->[\s\S]*?<!-- STATIC_CONTENT_END -->/, () => `<!-- STATIC_CONTENT_START -->\n<div id="root">${body(meta)}</div>\n<!-- STATIC_CONTENT_END -->`);
    const target = route === '/' ? path.join(dist, 'index.html') : route === '/404' ? path.join(dist, '404.html') : path.join(dist, route.slice(1), 'index.html');
    await mkdir(path.dirname(target), {recursive: true}); await writeFile(target, html);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${(indexable ? publicRoutes : []).map(route => `  <url><loc>${escape(origin + (route === '/' ? '/' : route))}</loc></url>`).join('\n')}\n</urlset>\n`;
  const robots = indexable ? `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /compare\nDisallow: /track\nDisallow: /order/\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n`;
  await writeFile(path.join(dist, 'sitemap.xml'), xml);
  await writeFile(path.join(dist, 'robots.txt'), robots);
  await writeFile(path.join(dist, 'robot.txt'), '# Compatibility copy; the standard crawler file is /robots.txt.\n' + robots);
  const logoOrigin = env.VITE_BRAND_LOGO_URL ? new URL(env.VITE_BRAND_LOGO_URL, origin).origin : origin;
  const csp = `default-src 'self'; script-src 'self' ${[...hashes].join(' ')}; style-src 'self' ${styleHash}; style-src-elem 'self' ${styleHash}; style-src-attr 'unsafe-inline'; img-src 'self' data:${logoOrigin !== origin ? ' ' + logoOrigin : ''}; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
  const security = {
    'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin', 'Strict-Transport-Security': 'max-age=31536000',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-origin',
  };
  if (!indexable) security['X-Robots-Tag'] = 'noindex, nofollow';
  // Firebase does not read Netlify's _headers/_redirects. Export its native
  // configuration with the same freshly generated CSP hashes on every build.
  await writeFile(path.join(root, 'firebase.json'), JSON.stringify(firebaseHostingConfig(security, env.FIREBASE_HOSTING_SITE), null, 2) + '\n');
  await writeFile(path.join(dist, '_headers'), '/*\n' + Object.entries(security).map(([name,value]) => `  ${name}: ${value}`).join('\n') + '\n  Cache-Control: no-cache\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
  // Existing static files are served directly. Explicit fallbacks cover SPA
  // routes; unknown routes and unknown product IDs retain an HTTP 404 status.
  const redirects = ['/policies/terms /terms-and-conditions 301', '/policies/returns /return-policy 301',
    ...[...publicRoutes,...privateRoutes].filter(route => route !== '/').map(route => `${route} ${route}/index.html 200`), '/* /404.html 404'];
  await writeFile(path.join(dist, '_redirects'), redirects.join('\n') + '\n');
  if (process.argv.includes('--sync-public')) {
    for (const file of ['sitemap.xml','robots.txt','robot.txt','_headers','_redirects']) await writeFile(path.join(root, 'public', file), await readFile(path.join(dist, file)));
  }
  console.log(`Generated ${indexable ? publicRoutes.length : 0} indexable pages, sitemap, robots, social metadata, JSON-LD and Firebase/Netlify security headers for ${origin}.`);
} finally { await server.close(); }
