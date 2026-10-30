import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,expect} from '@playwright/test';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const config=await readFile(path.join(root,'_headers'),'utf8');
const headers=Object.fromEntries(config.split('\n').slice(1).filter(line=>/^  [A-Za-z-]+:/.test(line)).map(line=>{const at=line.indexOf(':');return [line.slice(2,at),line.slice(at+1).trim()];}));
// Asset Cache-Control overrides are irrelevant to security checks.
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(request,response)=>{
 try {
  const url=new URL(request.url,'http://localhost');
  const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(filename!==root&&!filename.startsWith(root+path.sep)){response.writeHead(400);response.end();return;}
  let target=filename;let status=200;
  try {if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);}
  catch {target=path.join(root,'404.html');status=404;}
  const body=await readFile(target);
  response.writeHead(status,{...headers,'Content-Type':mime[path.extname(target)]||'application/octet-stream'});response.end(body);
 }catch{response.writeHead(500);response.end('Test server error');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
 const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
 assert.equal((sitemap.match(/<loc>/g)||[]).length,24);
 for(const page of ['return-policy','terms-and-conditions','product/nanohead-wood-model-7-year'])assert(sitemap.includes(page));
 for(const page of ['checkout','/cart','/track','/order/'])assert(!sitemap.includes(page));
 assert((await readFile(path.join(root,'robots.txt'),'utf8')).includes('Sitemap: https://brightcopter-in.web.app/sitemap.xml'));
 const ico=await readFile(path.join(root,'favicon.ico'));assert.equal(ico.readUInt16LE(2),1);assert(ico.readUInt16LE(4)>=1);
 assert(headers['Content-Security-Policy'].includes("script-src 'self' 'sha256-"));
 assert(!headers['Content-Security-Policy'].includes("'unsafe-eval'"));
 assert.equal(headers['X-Content-Type-Options'],'nosniff');
 assert.equal(headers['X-Frame-Options'],'DENY');
 assert(!config.includes('Access-Control-Allow-Origin: *'));
 const template=await readFile(new URL('../index.html',import.meta.url),'utf8');
 for(const tag of ['property="og:title"','property="og:description"','property="og:image"','name="twitter:card"','name="twitter:image"','rel="canonical"'])assert(template.includes(tag));
 assert(!template.includes('<div id="root"></div>'));
 const productTitles=new Set(),productDescriptions=new Set(),socialImages=new Set();
 const getMeta=(html,key)=>html.match(new RegExp(`<meta[^>]+(?:property|name)="${key}"[^>]+content="([^"]+)"`))?.[1];
 for(const [,location] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)){
  const pathname=new URL(location).pathname;
  const response=await fetch(url+pathname);assert.equal(response.status,200,pathname);
  const html=await response.text();
  assert(html.includes('class="site-header"')&&html.includes('class="site-footer"'),pathname+' must contain the rendered layout');
  assert(!html.includes('<div id="root"></div>'),pathname);
  assert(!/(?:src|href)="\/src\/assets\//.test(html),pathname+' contains an unbuilt image URL');
  assert(!/<form\b/.test(html),pathname+' must not submit personal details without JavaScript');
  assert(html.includes(`rel="canonical" href="${location}"`),pathname);
  assert.equal(getMeta(html,'og:url'),location);
  const social=getMeta(html,'og:image');assert(social?.startsWith('https://brightcopter-in.web.app/social/'));
  assert.equal(getMeta(html,'twitter:image'),social);socialImages.add(social);
  if(pathname==='/')assert(html.includes('class="hero-section container"'));
  if(pathname==='/products')assert.equal((html.match(/class="product-card glass"/g)||[]).length,5);
  if(pathname.startsWith('/product/')){
   const title=html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1];
   assert(title.includes('ceiling fan')&&title.includes('— Bright Copter'));
   productTitles.add(title);productDescriptions.add(getMeta(html,'description'));
   assert(getMeta(html,'description').includes('warranty'));
  }
 }
 assert.equal(productTitles.size,14);assert.equal(productDescriptions.size,14);assert.equal(socialImages.size,5);
 for(const image of socialImages){
  const response=await fetch(url+new URL(image).pathname);assert.equal(response.status,200);
  assert(response.headers.get('content-type').startsWith('image/jpeg'));
  const bytes=Buffer.from(await response.arrayBuffer());assert(bytes.length<150_000);assert.equal(bytes.readUInt16BE(0),0xffd8);
 }
 const response=await fetch(url+'/product/nanohead-wood-model-7-year');assert.equal(response.status,200);
 const raw=await response.text();assert(raw.includes('property="og:title"'));assert(raw.includes('Nanohead Wood model'));
 const schema=JSON.parse(raw.match(/<script data-seo type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const product=schema['@graph'].find(item=>item['@type']==='Product');
 assert.equal(product.offers.price,4400);assert.equal(product.offers.priceCurrency,'INR');
 assert(!('availability' in product.offers));assert(!('aggregateRating' in product));
 for(const image of product.image){const local=new URL(image).pathname;assert.equal((await fetch(url+local)).status,200);}
 const returns=await (await fetch(url+'/return-policy')).text();assert(/<h2\b[^>]*id="policy-refunds"/.test(returns));assert(returns.includes('Approved refunds'));
 assert.equal((await fetch(url+'/unknown-page')).status,404);
 assert.equal((await fetch(url+'/product/unknown-model')).status,404);
 const privateHtml=await (await fetch(url+'/checkout?name=PRIVATE_TEST')).text();assert(privateHtml.includes('noindex,nofollow'));assert(!privateHtml.includes('PRIVATE_TEST'));assert(!privateHtml.includes('rel="canonical"'));
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium'});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.cspViolations=[];document.addEventListener('securitypolicyviolation',event=>window.cspViolations.push(event.violatedDirective+': '+event.blockedURI));});
 await page.goto(url,{waitUntil:'load'});
 await expect(page.getByRole('heading',{name:'Ceiling fans. ചൂടിന് ഇത്ര ജാഡ വേണ്ട.'})).toBeVisible();
 await expect(page).toHaveTitle('Ceiling Fans in Kerala from ₹2,350 | Bright Copter');
 await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeVisible();
 await page.getByRole('link',{name:'Our products',exact:true}).click();
 await expect(page.locator('.product-card')).toHaveCount(5);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://brightcopter-in.web.app/products');
 await page.goto(url+'/product/nanohead-wood-model-7-year?finish=Wood&utm_source=test');
 await expect(page).toHaveTitle('Nanohead Wood model ceiling fan · 7-year warranty — Bright Copter');
 await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/7-year warranty at ₹4,400/);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://brightcopter-in.web.app/product/nanohead-wood-model-7-year');
 await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://brightcopter-in.web.app/social/nanohead-wood-model.jpg');
 await page.goto(url+'/return-policy');
 await expect(page.getByRole('heading',{name:'Returns, replacements & refunds',exact:true})).toBeVisible();
 await expect(page).toHaveTitle('Returns, replacements & refunds | Bright Copter');
 await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
 assert.deepEqual(await page.evaluate(()=>window.cspViolations),[]);
 assert.deepEqual(errors,[]);
 const noJs=await browser.newContext({javaScriptEnabled:false});const staticPage=await noJs.newPage();
 await staticPage.goto(url+'/terms-and-conditions');await expect(staticPage.getByRole('heading',{name:'Terms & conditions',exact:true})).toBeVisible();await expect(staticPage.locator('article section')).toHaveCount(11);
 await staticPage.goto(url+'/');await expect(staticPage.getByRole('heading',{name:'Ceiling fans. ചൂടിന് ഇത്ര ജാഡ വേണ്ട.'})).toBeVisible();
 await staticPage.goto(url+'/products');await expect(staticPage.locator('.product-card')).toHaveCount(5);
 await staticPage.goto(url+'/product/nanohead-wood-model-7-year');
 await expect(staticPage.getByRole('heading',{name:'Nanohead Wood model',exact:true})).toBeVisible();
 await expect(staticPage.locator('.detail-price')).toContainText('₹4,400');
 await expect(staticPage.getByRole('link',{name:/3-year warranty · ₹3,750/})).toHaveAttribute('href','/product/nanohead-wood-model-3-year');
 await staticPage.goto(url+'/business');await expect(staticPage.locator('form')).toHaveCount(0);await expect(staticPage.getByText('Enable JavaScript to prepare a request, or call Bright Copter on', {exact:false})).toBeVisible();
 await noJs.close();
 const dimensions=await page.evaluate(async urls=>Promise.all(urls.map(async source=>{const image=new Image();image.src=source;await image.decode();return [image.naturalWidth,image.naturalHeight];})),[...socialImages].map(source=>url+new URL(source).pathname));
 assert(dimensions.every(([width,height])=>width===1200&&height===630));
 console.log('Built-site checks passed: all 24 prerendered public routes, 14 unique product titles/descriptions, compressed model sharing images, Open Graph/Twitter/canonical tags, JSON-LD, no-JavaScript catalogue and policies, real 404 status, strict CSP and safe static form fallbacks.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
