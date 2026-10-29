import { build } from 'vite';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A portable review artifact. Production continues to use BrowserRouter.
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.resolve(process.argv[2] || path.join(root, '../brightcopter-artifacts'));
const outDir = await mkdtemp(path.join(tmpdir(), 'brightcopter-preview-'));
try {
  await build({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    plugins: [{
      name: 'portable-preview-routing',
      enforce: 'pre',
      transform(code, id) {
        if (id !== path.join(root, 'src/main.tsx')) return;
        // Attachment viewers can use about:srcdoc/data: URLs. HashRouter cannot
        // construct navigable URLs from those origins; use in-memory routing
        // there while preserving browser history for normal downloads/hosting.
        return code
          .replace('import { BrowserRouter } from "react-router-dom";',
            'import { HashRouter, MemoryRouter } from "react-router-dom";')
          .replaceAll('BrowserRouter', 'PreviewRouter')
          .replace('ReactDOM.createRoot', `
function PreviewRouter({ children }: { children: React.ReactNode }) {
  const Router = /^(https?|file):$/.test(window.location.protocol)
    ? HashRouter
    : MemoryRouter;
  React.useEffect(() => {
    document.getElementById("preview-opening-help")?.remove();
  }, []);
  return <Router>{children}</Router>;
}

ReactDOM.createRoot`);
      },
    }],
    define: { __INDEXING_ALLOWED__: 'false' },
    build: { outDir, emptyOutDir: true, assetsInlineLimit: () => true },
  });
  let html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
  const style = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
  if (!script || !style) throw new Error('Expected one Vite script and stylesheet.');
  const js = await readFile(path.join(outDir, script[1].replace(/^\//, '')), 'utf8');
  const css = await readFile(path.join(outDir, style[1].replace(/^\//, '')), 'utf8');
  html = html.replace(script[0], () => `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`);
  html = html.replace(style[0], () => `<style>${css}</style>`);
  for (const name of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-192x192.png', 'favicon-512x512.png', 'apple-touch-icon.png']) {
    const icon = await readFile(path.join(root, 'public', name));
    const mime = name.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    html = html.replace(new RegExp(`/${name.replaceAll('.', '\\.')}(?:\\?v=[a-zA-Z0-9-]+)?`), `data:${mime};base64,${icon.toString('base64')}`);
  }
  // Kept outside the React root so a blocked script or startup error leaves
  // useful opening instructions instead of an empty page.
  html = html.replace(/<!-- STATIC_CONTENT_START -->[\s\S]*?<!-- STATIC_CONTENT_END -->/, `<aside id="preview-opening-help" aria-label="Opening the website" style="max-width:620px;margin:48px auto;padding:28px;font:16px/1.7 system-ui,sans-serif;color:#29252b;background:white;border:1px solid #e8dde2;border-radius:20px">
    <strong style="font-size:26px">Bright Copter website preview</strong>
    <p style="margin-top:16px">The interactive website will appear here when it finishes opening.</p>
    <p style="margin-top:16px">If this message stays on screen, download the HTML file and open it in a full browser such as Chrome, Edge or Safari. Some chat and phone file viewers block the scripts needed to run the website.</p>
    <noscript><p style="margin-top:16px;font-weight:600">JavaScript is disabled in this viewer. Open the downloaded file in a browser with JavaScript enabled.</p></noscript>
    <p style="margin-top:16px;font-size:14px">This is a downloaded preview file. A public website address has not been published yet.</p>
  </aside><div id="root"></div>`);
  await mkdir(destination, { recursive: true });
  for (const filename of [
    'Bright-Copter-Working-Preview.html',
    'Bright-Copter-Logo-Preview.html',
    'Bright-Copter-Redesign-Preview.html',
    'Bright-Copter-Preview.html',
    'Bright-Copter-Liquid-Preview.html',
    'Bright-Copter-Flow-Preview.html',
  ]) await writeFile(path.join(destination, filename), html);
  console.log(`Interactive preview: ${path.join(destination, 'Bright-Copter-Working-Preview.html')}`);
} finally {
  await rm(outDir, { recursive: true, force: true });
}
