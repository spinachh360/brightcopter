import { createServer, loadEnv } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSiteUrl, defaultSiteUrl, indexingAllowed } from '../config/site.mjs';
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
  if (!item) throw new Error(`Missing built image in manifest: ${source}`);
  return `/${item.file}`;
};
const server = await createServer({root, mode: 'production', server: {middlewareMode: true, hmr: false, watch: null}, appType: 'custom', optimizeDeps: {noDiscovery: true, include: []}});
try {
  const { pageMetadata, safeJson, publicRoutes, privateRoutes } = await server.ssrLoadModule('/src/seo.ts');
  const { legalPages } = await server.ssrLoadModule('/src/policies.ts');
  const { products, money } = await server.ssrLoadModule('/src/data.ts');
  const { careNumber, careDisplay, orderWhatsapp } = await server.ssrLoadModule('/src/contacts.ts');
  const { NIMBUS_CSS } = await server.ssrLoadModule('/components/ui/liquid-glass-navbar.tsx');
  const styleHash = `'sha256-${createHash('sha256').update(NIMBUS_CSS).digest('base64')}'`;
  const hashes = new Set();
  function head(meta) {
    const schema = safeJson(meta.schema);
    hashes.add(`'sha256-${createHash('sha256').update(schema).digest('base64')}'`);
    return `<title data-seo>${escape(meta.title)}</title>\n` + [
      ['name','description',meta.description], ['name','robots',meta.index ? 'index,follow' : 'noindex,nofollow'],
      ['property','og:title',meta.title], ['property','og:description',meta.description],
      ['property','og:type','website'], ['property','og:site_name','Bright Copter'], ['property','og:locale','en_IN'],
      ['property','og:url',meta.canonical], ['property','og:image',meta.image],
      ['property','og:image:alt',meta.imageAlt],
      ['name','twitter:card','summary_large_image'], ['name','twitter:title',meta.title],
      ['name','twitter:description',meta.description], ['name','twitter:image',meta.image],
    ].map(([key, name, content]) => `<meta data-seo ${key}="${escape(name)}" content="${escape(content)}">`).join('\n') +
      (meta.index ? `\n<link data-seo rel="canonical" href="${escape(meta.canonical)}">` : '') +
      `\n<script data-seo type="application/ld+json">${schema}</script>`;
  }
  function body(meta) {
    const legal = legalPages[meta.path];
    const nav = '<header class="container"><a href="/" aria-label="Bright Copter home"><img class="brand-image" src="/og-image.png" alt="Bright Copter" width="1672" height="941"></a><nav aria-label="Website"><a href="/products">Our products</a> · <a href="/contact">Contact</a></nav></header>';
    let content = `<article class="container policy-content glass"><h1>${escape(meta.label)}</h1><p>${escape(meta.description)}</p>`;
    if (legal) {
      content += `<nav aria-label="On this page"><h2>On this page</h2><ol>${legal.sections.map(section => `<li><a href="#policy-${section.id}">${escape(section.title)}</a></li>`).join('')}</ol></nav>`;
      content += legal.sections.map(section => `<section><h2 id="policy-${section.id}">${escape(section.title)}</h2>${section.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}</section>`).join('');
    } else if (meta.product) {
      const product = meta.product;
      content += `<img class="product-photo" src="${escape(resolveAsset(product.images[product.finish]))}" alt="${escape(product.name)} in ${escape(product.finish)}" width="640" height="440"><h2>${escape(money(product.price))} · ${product.warranty}-year warranty</h2><p>Colours: ${escape(product.colors.join(', '))}. Staff confirms warranty coverage, availability, final total, delivery and payment on WhatsApp.</p><a href="${escape(orderWhatsapp())}">Contact the order team</a>`;
    } else if (['/', '/products'].includes(meta.path)) {
      content += `<h2>Models and warranty prices</h2><ul>${products.map(product => `<li><a href="/product/${product.id}">${escape(product.name)} · ${product.warranty} years · ${escape(money(product.price))}</a></li>`).join('')}</ul>`;
    }
    content += `<p>Customer care: <a href="tel:+${escape(careNumber)}">${escape(careDisplay)}</a>. Parappur, Thrissur, Kerala, India.</p><noscript><p>JavaScript is needed for the interactive bag, colour selection and checkout. Contact our team directly if scripts are disabled.</p></noscript></article>`;
    return nav + `<main id="main-content">${content}</main><footer class="container"><a href="/return-policy">Returns & refunds</a> · <a href="/terms-and-conditions">Terms & conditions</a> · <a href="/policies/privacy">Privacy</a></footer>`;
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
  await writeFile(path.join(dist, '_headers'), '/*\n' + Object.entries(security).map(([name,value]) => `  ${name}: ${value}`).join('\n') + '\n  Cache-Control: no-cache\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
  // Existing static files are served directly. Explicit fallbacks cover SPA
  // routes; unknown routes and unknown product IDs retain an HTTP 404 status.
  const redirects = ['/policies/terms /terms-and-conditions 301', '/policies/returns /return-policy 301',
    ...[...publicRoutes,...privateRoutes].filter(route => route !== '/').map(route => `${route} ${route}/index.html 200`), '/* /404.html 404'];
  await writeFile(path.join(dist, '_redirects'), redirects.join('\n') + '\n');
  if (process.argv.includes('--sync-public')) {
    for (const file of ['sitemap.xml','robots.txt','robot.txt','_headers','_redirects']) await writeFile(path.join(root, 'public', file), await readFile(path.join(dist, file)));
  }
  console.log(`Generated ${indexable ? publicRoutes.length : 0} indexable pages, sitemap, robots, social metadata, JSON-LD and Netlify security headers for ${origin}.`);
} finally { await server.close(); }
