// Compressed social previews of the supplied photos; original assets stay intact.
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = new URL('../public/social/', import.meta.url);
await mkdir(destination, { recursive: true });
const server = await createServer({root, server:{middlewareMode:true,hmr:false,watch:null}, appType:'custom', optimizeDeps:{noDiscovery:true,include:[]}});
let browser;
try {
  const { modelProducts } = await server.ssrLoadModule('/src/data.ts');
  browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)});
  const page = await browser.newPage();
  for (const product of modelProducts) {
    const source = path.resolve(root, product.images[product.finish].replace(/^\//, ''));
    if (!source.startsWith(path.join(root, 'src/assets/'))) throw new Error('Social images must use the supplied local product photos.');
    const original = await readFile(source);
    const encoded = await page.evaluate(async data => {
      const photo = new Image(); photo.src = `data:image/png;base64,${data}`;
      await photo.decode();
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630;
      const context = canvas.getContext('2d'); context.fillStyle = '#ffffff'; context.fillRect(0, 0, 1200, 630);
      context.imageSmoothingQuality = 'high';
      const scale = Math.min(1152 / photo.naturalWidth, 582 / photo.naturalHeight);
      const width = photo.naturalWidth * scale, height = photo.naturalHeight * scale;
      context.drawImage(photo, (1200 - width) / 2, (630 - height) / 2, width, height);
      return canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
    }, original.toString('base64'));
    const image = Buffer.from(encoded, 'base64');
    await writeFile(new URL(`${product.modelId}.jpg`, destination), image);
    console.log(`${product.modelId}: ${Math.round(image.length / 1024)} KB, 1200 × 630 JPEG`);
  }
} finally { await browser?.close(); await server.close(); }
