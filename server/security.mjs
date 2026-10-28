export function allowedOrigins(value) {
  const list = (value || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!list.length) throw new Error('SERVER_ALLOWED_ORIGINS must explicitly list permitted HTTPS origins.');
  return new Set(list.map(item => {
    const url = new URL(item);
    if (url.protocol !== 'https:' || url.origin !== item || url.username || url.password) throw new Error('Only exact HTTPS origins are allowed. Wildcards, paths and credentials are rejected.');
    return url.origin;
  }));
}
export function applyCors(request, response, origins) {
  response.setHeader('Vary', request.method === 'OPTIONS' ? 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers' : 'Origin');
  const origin = request.headers.origin;
  if (origin && !origins.has(origin)) { response.writeHead(403); response.end(JSON.stringify({error: 'ORIGIN_NOT_ALLOWED'})); return false; }
  if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
  // No cross-origin cookies or credentials; no wildcard origins.
  if (request.method === 'OPTIONS') {
    const method = request.headers['access-control-request-method'];
    const headers = String(request.headers['access-control-request-headers'] || '').toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
    if (!['GET', 'POST'].includes(method) || headers.some(header => header !== 'content-type')) { response.writeHead(403); response.end(); return false; }
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Max-Age', '600'); response.writeHead(204); response.end(); return false;
  }
  return true;
}
export function createRateLimiter({limit = 10, windowMs = 60_000, maxEntries = 10_000} = {}) {
  const entries = new Map();
  return (key, now = Date.now()) => {
    for (const [id, entry] of entries) if (now >= entry.until) entries.delete(id);
    let entry = entries.get(key);
    if (!entry) {
      if (entries.size >= maxEntries) return false; // Fail closed instead of growing without bound.
      entries.set(key, entry = {count: 0, until: now + windowMs});
    }
    return ++entry.count <= limit;
  };
}
export async function readJson(request, maxBytes = 16_384) {
  if (String(request.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') throw Object.assign(new Error('JSON content type required'), {status: 415});
  if (Number(request.headers['content-length']) > maxBytes) throw Object.assign(new Error('Request too large'), {status: 413});
  const chunks = []; let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > maxBytes) throw Object.assign(new Error('Request too large'), {status: 413});
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('Invalid JSON'), {status: 400}); }
}
