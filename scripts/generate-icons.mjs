// Export browser-sized copies from the lion-and-cub favicon source.
import {chromium} from '@playwright/test';
import {existsSync} from 'node:fs';
import {readFile,writeFile} from 'node:fs/promises';
const source = await readFile(new URL('../src/assets/favicon-source.png', import.meta.url));
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)});
try {
  const page = await browser.newPage();
  const images = await page.evaluate(async data => {
    const image = new Image(); image.src = 'data:image/png;base64,' + data; await image.decode();
    if (image.naturalWidth !== image.naturalHeight) throw new Error('Icon source must be square');
    return [16,32,48,64,180,192,512].map(size => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
      const context = canvas.getContext('2d'); context.imageSmoothingQuality = 'high';
      context.drawImage(image,0,0,size,size);
      return {size,png:canvas.toDataURL('image/png').split(',')[1]};
    });
  }, source.toString('base64'));
  const entries = images.slice(0,4); const header = Buffer.alloc(6 + entries.length * 16); header.writeUInt16LE(1,2); header.writeUInt16LE(entries.length,4);
  let offset = header.length; const chunks = [header];
  entries.forEach(({size,png},index) => { const data = Buffer.from(png,'base64'); const at = 6 + index * 16; header[at]=header[at+1]=size; header.writeUInt16LE(1,at+4); header.writeUInt16LE(32,at+6); header.writeUInt32LE(data.length,at+8); header.writeUInt32LE(offset,at+12); chunks.push(data); offset += data.length; });
  await writeFile(new URL('../public/favicon.ico',import.meta.url),Buffer.concat(chunks));
  for (const {size,png} of images) {
    if (![16,32,180,192,512].includes(size)) continue;
    const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
    await writeFile(new URL(`../public/${filename}`,import.meta.url),Buffer.from(png,'base64'));
    console.log(`${filename}: ${size} × ${size}`);
  }
  console.log('favicon.ico: 16, 32, 48 and 64 px');
} finally {await browser.close();}
