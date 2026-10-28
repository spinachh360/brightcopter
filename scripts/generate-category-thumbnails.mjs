// Resize the supplied product photos for category controls. Originals stay intact.
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const photos = [
  ['base', 'base/black.png'],
  ['jumbohead', 'jumbohead/brown.png'],
  ['nanohead', 'nanohead/silver.png'],
];
const destination = new URL('../src/assets/products/thumbnails/', import.meta.url);
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
});
try {
  const page = await browser.newPage();
  for (const [model, source] of photos) {
    const original = await readFile(new URL(`../src/assets/products/${source}`, import.meta.url));
    const encoded = await page.evaluate(async data => {
      const photo = new Image();
      photo.src = `data:image/png;base64,${data}`;
      await photo.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 96;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff'; context.fillRect(0, 0, 128, 96);
      context.imageSmoothingQuality = 'high';
      const scale = Math.min(128 / photo.naturalWidth, 96 / photo.naturalHeight);
      const width = photo.naturalWidth * scale, height = photo.naturalHeight * scale;
      context.drawImage(photo, (128 - width) / 2, (96 - height) / 2, width, height);
      return canvas.toDataURL('image/webp', 0.9).split(',')[1];
    }, original.toString('base64'));
    const thumbnail = Buffer.from(encoded, 'base64');
    await writeFile(new URL(`${model}.webp`, destination), thumbnail);
    console.log(`${model}: ${thumbnail.length} bytes, 128 × 96 WebP`);
  }
} finally { await browser.close(); }
