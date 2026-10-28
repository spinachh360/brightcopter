// Format conversion of the existing favicon.svg, without redesigning the mark.
import {chromium} from '@playwright/test';
import {existsSync} from 'node:fs';
import {readFile,writeFile} from 'node:fs/promises';
const svg = await readFile(new URL('../public/favicon.svg', import.meta.url),'utf8');
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)});
try {
  const page = await browser.newPage();
  const images = await page.evaluate(async svg => {
    const image = new Image(); image.src = 'data:image/svg+xml;base64,' + btoa(svg); await image.decode();
    return [16,32,48,180].map(size => { const canvas = document.createElement('canvas'); canvas.width = canvas.height = size; canvas.getContext('2d').drawImage(image,0,0,size,size); return {size,png:canvas.toDataURL('image/png').split(',')[1]}; });
  }, svg);
  const entries = images.slice(0,3); const header = Buffer.alloc(6 + entries.length * 16); header.writeUInt16LE(1,2); header.writeUInt16LE(entries.length,4);
  let offset = header.length; const chunks = [header];
  entries.forEach(({size,png},index) => { const data = Buffer.from(png,'base64'); const at = 6 + index * 16; header[at]=header[at+1]=size; header.writeUInt16LE(1,at+4); header.writeUInt16LE(32,at+6); header.writeUInt32LE(data.length,at+8); header.writeUInt32LE(offset,at+12); chunks.push(data); offset += data.length; });
  await writeFile(new URL('../public/favicon.ico',import.meta.url),Buffer.concat(chunks));
  await writeFile(new URL('../public/apple-touch-icon.png',import.meta.url),Buffer.from(images[3].png,'base64'));
} finally {await browser.close();}
