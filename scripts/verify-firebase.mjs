// These checks run against Firebase's actual Hosting emulator, not an SPA mock.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import {existsSync} from 'node:fs';

const base = 'http://127.0.0.1:5000';
const receipt = JSON.parse(await readFile(new URL('../.firebase-build.json',import.meta.url),'utf8'));
const config = JSON.parse(await readFile(new URL('../firebase.json',import.meta.url),'utf8'));
assert.equal(config.hosting.public,'dist');
assert(!config.hosting.rewrites,'Unknown URLs must retain real 404 responses');
const expectedPolicy = config.hosting.headers[0].headers.find(header=>header.key==='Content-Security-Policy').value;
for (const route of ['/','/products','/product/nanohead-wood-model-7-year','/support','/terms-and-conditions','/return-policy','/cart','/checkout']) {
  const response = await fetch(base+route,{redirect:'manual'});
  assert.equal(response.status,200,route);
  assert.equal(response.headers.get('content-security-policy'),expectedPolicy,route);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  const html = await response.text();
  assert(html.includes('class="site-header"'),route);
  if (['/cart','/checkout'].includes(route) || receipt.preview) assert(html.includes('content="noindex,nofollow"'));
  else assert(html.includes(`rel="canonical" href="${receipt.origin}${route==='/'?'/':route}"`));
}
for (const route of ['/missing-firebase-check','/product/not-a-real-fan']) {
  const response = await fetch(base+route,{redirect:'manual'});
  assert.equal(response.status,404,route);
  assert((await response.text()).includes('noindex,nofollow'));
}
for (const [from,to] of [['/policies/terms','/terms-and-conditions'],['/policies/returns','/return-policy'],['/products/','/products']]) {
  const response = await fetch(base+from,{redirect:'manual'});
  assert.equal(response.status,301,from);
  assert.equal(new URL(response.headers.get('location'),base).pathname,to);
}
const manifest = JSON.parse(await readFile(new URL('../dist/.vite/manifest.json',import.meta.url),'utf8'));
const entry = Object.values(manifest).find(item=>item.isEntry);
const asset = await fetch(`${base}/${entry.file}`);
assert.equal(asset.status,200);
assert.equal(asset.headers.get('cache-control'),'public, max-age=31536000, immutable');
const sitemap = await (await fetch(base+'/sitemap.xml')).text();
assert.equal((sitemap.match(/<loc>/g)||[]).length,receipt.preview?0:24);
assert(!sitemap.includes('netlify.app'));

const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)});
try {
  const context = await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const page = await context.newPage();
  const errors = [];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{window.firebaseCspErrors=[];document.addEventListener('securitypolicyviolation',event=>window.firebaseCspErrors.push(event.violatedDirective));});
  await page.goto(base);
  await expect(page.getByRole('heading',{name:'Ceiling fans. ചൂടിന് ഇത്ര ജാഡ വേണ്ട.'})).toBeVisible();
  await page.getByRole('link',{name:'See fans & prices'}).click();
  await expect(page.locator('.product-card')).toHaveCount(5);
  await page.reload();await expect(page.locator('.product-card')).toHaveCount(5);
  await page.goto(base+'/product/nanohead-wood-model-7-year');
  await expect(page.getByRole('heading',{name:'Nanohead Wood model',exact:true})).toBeVisible();
  await expect(page.locator('.detail-price')).toContainText('₹4,400');
  assert.deepEqual(await page.evaluate(()=>window.firebaseCspErrors),[]);
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
console.log('Firebase Hosting checks passed: native clean routes, legacy redirects, real 404s, CSP, caching, sitemap and browser navigation.');
