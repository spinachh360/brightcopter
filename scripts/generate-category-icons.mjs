// Export matching transparent WebPs from the blade-free navigation artwork.
// The original product photographs remain unchanged.
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const destination = new URL('../src/assets/products/icons/', import.meta.url);
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
});
try {
  const page = await browser.newPage();
  for (const model of ['base', 'jumbohead', 'nanohead']) {
    const source = await readFile(new URL(`../src/assets/category-heads/${model}.png`, import.meta.url));
    const encoded = await page.evaluate(async data => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const sample = document.createElement('canvas');
      sample.width = image.naturalWidth; sample.height = image.naturalHeight;
      const sampleContext = sample.getContext('2d');
      sampleContext.drawImage(image, 0, 0);
      const pixels = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
      let left = sample.width, top = sample.height, right = -1, bottom = -1;
      let transparent = false;
      for (let y = 0; y < sample.height; y++) for (let x = 0; x < sample.width; x++) {
        const alpha = pixels[(y * sample.width + x) * 4 + 3];
        if (alpha < 8) transparent = true;
        if (alpha > 16) {
          left = Math.min(left, x); right = Math.max(right, x);
          top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
      }
      if (!transparent || right < left) throw new Error('Category artwork needs a visible head and transparent background');
      const width = right - left + 1, height = bottom - top + 1;
      const scale = 208 / Math.max(width, height);
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
      const context = canvas.getContext('2d'); context.imageSmoothingQuality = 'high';
      context.drawImage(image, left, top, width, height, (256 - width * scale) / 2, (256 - height * scale) / 2, width * scale, height * scale);
      return canvas.toDataURL('image/webp', .94).split(',')[1];
    }, source.toString('base64'));
    const webp = Buffer.from(encoded, 'base64');
    if (webp.toString('ascii', 8, 12) !== 'WEBP') throw new Error('WebP encoding unavailable');
    await writeFile(new URL(`${model}.webp`, destination), webp);
    console.log(`${model}: ${webp.length} bytes, 256 × 256 transparent WebP`);
  }
} finally { await browser.close(); }
