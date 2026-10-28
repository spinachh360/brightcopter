// A future API security template, not an active website backend or order service.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { allowedOrigins, applyCors, createRateLimiter, readJson } from './security.mjs';
import { validateEnquiry } from '../shared/validation.ts';
export function createApi({origins, rateLimit = createRateLimiter()} = {}) {
  if (!origins) throw new Error('An explicit origin allowlist is required.');
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store'); response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    if (!applyCors(request, response, origins)) return;
    // Deliberately do not trust user-supplied X-Forwarded-For headers.
    if (!rateLimit(request.socket.remoteAddress || 'unknown')) { response.setHeader('Retry-After', '60'); response.writeHead(429); response.end(JSON.stringify({error: 'TOO_MANY_REQUESTS'})); return; }
    try {
      if (request.method === 'GET' && request.url === '/health') { response.end(JSON.stringify({status: 'ok', enquiriesConfigured: false})); return; }
      if (request.method === 'POST' && request.url === '/api/enquiries') {
        validateEnquiry(await readJson(request));
        response.writeHead(503); response.end(JSON.stringify({error: 'SERVICE_NOT_CONFIGURED', message: 'No request has been saved or sent. Contact Bright Copter directly.'})); return;
      }
      response.writeHead(404); response.end(JSON.stringify({error: 'NOT_FOUND'}));
    } catch (error) {
      const status = [400, 413, 415].includes(error.status) ? error.status : 400;
      response.writeHead(status); response.end(JSON.stringify({error: status === 413 ? 'REQUEST_TOO_LARGE' : 'INVALID_REQUEST', message: 'Check the request format and field lengths.'}));
    }
  });
  server.requestTimeout = 10_000; server.headersTimeout = 10_000; server.keepAliveTimeout = 5_000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const origins = allowedOrigins(process.env.SERVER_ALLOWED_ORIGINS);
  createApi({origins}).listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('Future API template listening on loopback; enquiry processing is disabled.'));
}
