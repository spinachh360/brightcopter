# Bright Copter security and technical deployment

This is a static catalogue and customer-initiated WhatsApp handoff. There is no active application backend, database, payment processor, visitor analytics, advertising pixel or tracking-cookie integration. The current code contains public contact numbers, not private API keys. No credential rotation was needed for the inspected source. Dependency auditing and the targeted source check supplement review; they cannot guarantee absence of all vulnerabilities or secrets.

## Environment variables and credentials

- `SITE_URL` is a public canonical HTTPS origin. The selected Firebase project is `brightcopter-337b5`, with default Hosting origin `https://brightcopter-337b5.web.app`. The Firebase wrapper rebuilds for the selected site or explicit custom domain; it overrides obsolete local Netlify origins.
- The only browser overrides allowed are `VITE_ORDER_WHATSAPP`, `VITE_CUSTOMER_CARE_WHATSAPP`, and `VITE_BRAND_LOGO_URL`. They are public. Vite's automatic environment-prefix exposure is disabled; unknown `VITE_*` variables fail configuration review.
- `.env`, `.env.local`, `.env.production`, `.env.server` and other real `.env.*` files are ignored. Only `.env.example` and `.env.server.example` are templates. The packaging script also excludes real environment files, even if they were accidentally tracked. Never put real credentials in those templates, source code, public assets, URLs or `VITE_*` variables.
- Future database strings and provider credentials belong in the backend host's environment or secret manager. `.env.server.example` shows server-only names. The browser must call a validated API; it must not connect directly to a database or receive provider secrets.
- If a secret was ever committed, removing it or moving it to an environment variable does not revoke it. Rotate it and review repository history and provider logs. No such secret was identified in this implementation.

## Headers and hosting

`npm run build` generates the route HTML, native Firebase `firebase.json` configuration and legacy Netlify `_headers`/`_redirects`. Firebase Hosting applies `firebase.json`; it does not interpret the Netlify files. Both configurations use the same newly generated CSP hashes and security headers. `firebase:build` records an ignored content fingerprint; predeploy verification rejects a changed build/configuration or mismatched project. An old generic build cannot silently publish under Firebase with stale canonicals. See [FIREBASE.md](FIREBASE.md).

Firebase authentication is CLI-side only. OAuth/CLI state is kept under ignored `.firebase/cli-config`, outside `dist/` and excluded from all archives even if accidentally tracked. The project ID and `.firebaserc` are public configuration. Unrelated ambient Google credentials are ignored unless CI deliberately opts into ADC using `FIREBASE_USE_ADC=true`. No Firebase SDK, client credentials, database or application server was added. CLI arguments are passed without a shell.

The policy permits same-origin scripts and hashes of the supplied JSON-LD. The navbar's fixed stylesheet is hash-authorised. There is no script `unsafe-inline` or `unsafe-eval`. Motion and glass controls need dynamic style attributes, so `style-src-attr 'unsafe-inline'` is the limited styling exception. Images and fonts are local/data assets; an explicitly configured HTTPS logo origin is the only additional image origin. Connections default to the same origin. Objects, framing and external form submissions are blocked. HSTS, MIME sniffing protection, referrer policy, cross-origin opener/resource headers and restricted browser permissions are configured. Hashed assets can be cached; HTML is revalidated.

Each known route is prerendered from the actual React pages with metadata, business/product JSON-LD and readable static content. Known products have the actual supplied price and photo URLs; social previews use compressed local JPEG copies. Prerendering uses empty browser state and never reads customer data. Interactive forms are replaced with call/JavaScript notices in the static markup so a browser without JavaScript cannot submit personal details through a native GET URL. React mounts the interactive forms after startup. No inventory status, review rating, unsupported specifications or return window is invented. Customer pages are `noindex,nofollow` and excluded from the sitemap. Unknown paths and product IDs use `404.html` with a 404 fallback rule. Robots directives guide crawlers; they are not access control.

Firebase preview-channel builds and legacy Netlify branch/deploy previews set `ROBOTS_PREVIEW=true`, making their HTML and response header noindex and robots disallow all. Portable downloadable previews are also noindex. Production uses the selected canonical origin. `firebase:test` checks Firebase's actual local Hosting emulator; `technical:test` checks generated metadata and security on a local HTTP server. Neither check claims that an authenticated production deployment has happened.

## Browser forms, local data and failure states

Shared plain-text validation normalizes Unicode, removes control/bidirectional-format characters, limits lengths and validates phone/email/PIN formats. React escapes user-supplied strings. Do not replace this with raw HTML insertion; HTML input must remain plain text. JSON-LD serialization escapes `<` and line separators. The liquid navbar no longer uses a raw HTML sink for its fixed CSS.

A hidden honeypot, in-memory duplicate guard and session-based cap of three prepared requests per five minutes reduce simple bot submissions and repeated clicks. These are browser UX safeguards, not server-enforced anti-abuse or authentication. Direct WhatsApp links and another browser can bypass them. An actual API must enforce its own limits and challenge verification when needed.

Prepared requests are capped at 30, validated on reading and pruned after seven days when accessed. They contain personal details and are readable by someone with access to the browser; they are not encrypted accounts or live order records. The privacy page provides deletion. Cart data is bounded, checked against known variants and deduplicated. Stored client totals are never used as authoritative prices.

Form errors retain the customer's input. An error boundary displays generic recovery actions rather than exception details. Request preparation remains distinct from sending, acceptance, payment and fulfilment. Confirmation provides a fallback WhatsApp link and downloadable copy; a blocked popup is not treated as an accepted order. References are local identifiers, not authentication or authorisation tokens.

## Future backend template

`server/example.mjs` is deliberately **not connected to the frontend or a database**. On Node 24:

```sh
cp .env.server.example .env.server
npm run server:example
```

It binds to loopback, exposes a health response and validates a demonstration enquiry request. Enquiry processing returns `503 SERVICE_NOT_CONFIGURED`; it does not save or send anything. The reusable safeguards include:

- Exact HTTPS-origin allowlisting; rejection of wildcard, `null` and unlisted origins, restricted preflight methods/headers, no cross-origin credentials and `Vary: Origin`.
- A bounded IP-based rate limiter with 429/Retry-After; it does not trust arbitrary `X-Forwarded-For` headers. Configure trusted proxies explicitly before hosting behind one, and use a shared rate-limit store for multiple instances.
- JSON-only requests, a 16 KiB body cap, field allowlists, length/format validation, plain-text handling, generic JSON errors and request/header timeouts.

CORS is not authentication and does not stop non-browser clients. Before enabling a real order or account endpoint, add the necessary authentication/authorisation, CSRF protection if cookies are used, server-side prices and inventory checks, idempotency, parameterised database queries, provider calls with server-only credentials, appropriate logging/retention and edge/DDoS controls. Never trust a browser's price, warranty, quantity, payment status or CAPTCHA result without validating it on the server.

## Tracking and consent

No optional visitor tracking is installed, so no cookie banner is displayed. Browser storage is used for the functional features documented above. The privacy page explains this and routine hosting access information. If optional analytics or advertising is added, implement an opt-in consent manager **before loading that integration**, with equally accessible accept/reject controls, optional purposes off by default, withdrawal/preferences, provider cleanup and an updated privacy notice. A banner by itself is not consent enforcement.

## Validation commands

```sh
npm run security:check
npm run test:server
npm test
npm run build
npm run technical:test
npm run preview:test
npm audit
```

The source check looks for recognised credential patterns, tracked private environment files and raw HTML sinks; inspect changes as well. Production metadata, CSP, static policy content, schema, 404 status and assets are checked by `technical:test`. Browser tests intercept WhatsApp instead of sending customer messages. The live hosting account and actual domain routing still need to be verified when deployed.
