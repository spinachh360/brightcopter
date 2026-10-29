import { chromium, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifact = process.argv[2] || path.join(root, '../brightcopter-artifacts/Bright-Copter-Working-Preview.html');
const html = await readFile(artifact, 'utf8');
const escaped = html.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const server = createServer((request, response) => {
  // The outer srcdoc host must decode the embedded Malayalam as UTF-8 too.
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  if (request.url === '/sandbox' || request.url === '/blocked') {
    const permissions = request.url === '/sandbox' ? 'allow-scripts' : '';
    response.end(`<iframe title="Preview" sandbox="${permissions}" style="width:100%;height:900px;border:0" srcdoc="${escaped}"></iframe>`);
  } else response.end(html);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseURL = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
    headless: true,
  });
  for (const mode of ['browser', 'sandbox', 'blocked', 'disabled']) {
    const context = await browser.newContext({
      javaScriptEnabled: mode !== 'disabled',
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const embedded = mode === 'sandbox' || mode === 'blocked';
    await page.goto(baseURL + (embedded ? `/${mode}` : ''), { waitUntil: 'load' });
    const scope = embedded ? page.frameLocator('iframe') : page;
    if (mode === 'disabled' || mode === 'blocked') {
      const help = scope.getByLabel('Opening the website');
      await expect(help).toBeVisible();
      await expect(help).toContainText('download the HTML file and open it in a full browser');
    } else {
      await expect(scope.getByRole('heading', { name: 'Ceiling fans. വീട്ടിലാകെ നല്ല കാറ്റ്.' })).toBeVisible();
      await expect(scope.getByLabel('Opening the website')).toHaveCount(0);
      await expect.poll(() => scope.locator('.site-header .brand-image').evaluate(img => img.naturalWidth)).toBe(1672);
      await scope.getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Our products' }).click();
      await expect(scope.getByRole('heading', { name: 'Find your fan. See your price.' })).toBeVisible();
      await scope.getByRole('button', { name: 'Add Base model to bag' }).click();
      await scope.getByRole('link', { name: 'Shopping bag, 1 items' }).click();
      await scope.getByRole('link', { name: 'Continue to checkout' }).click();
      await expect(scope.getByRole('heading', { name: 'Your delivery details' })).toBeVisible();
    }
    expect(errors).toEqual([]);
    console.log(`Passed portable preview: ${mode}`);
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
