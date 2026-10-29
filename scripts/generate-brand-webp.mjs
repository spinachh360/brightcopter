// Format conversion only: retain the original dimensions and complete artwork.
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const original = await readFile(new URL('../src/assets/brand-logo.png', import.meta.url));
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
});
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async data => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d').drawImage(image, 0, 0);
    return {
      encoded: canvas.toDataURL('image/webp', 0.98).split(',')[1],
      width: canvas.width,
      height: canvas.height,
    };
  }, original.toString('base64'));
  const webp = Buffer.from(result.encoded, 'base64');
  if (webp.toString('ascii', 8, 12) !== 'WEBP') throw new Error('WebP encoding unavailable');
  await writeFile(new URL('../src/assets/brand-logo.webp', import.meta.url), webp);
  console.log(`Brand: ${result.width} × ${result.height} WebP, ${webp.length} bytes (PNG: ${original.length} bytes)`);
} finally {
  await browser.close();
}
