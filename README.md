# Bright Copter

A responsive React + TypeScript storefront for Bright Copter, with frosted surfaces, locally hosted fonts, the supplied fan photographs, and WhatsApp order checkout. Built with Vite, React Router, Tailwind CSS 4, Motion and Lucide icons, with a shadcn-compatible component structure.

The refreshed design uses white, restrained rose glass and Bright Copter red. Shared tokens in `src/styles.css` define the surfaces, control shadows, typography, focus rings and motion. Primary actions use red; secondary buttons and selected tabs use translucent white. The responsive stylesheet replaces the previous layered styling rather than adding another override sheet.

The homepage includes interactive fan-finish previews and a simpler visual hierarchy. The hero separates the fan photo, finish controls and product link into rows, with the decorative orbits, background word, edition badge and duplicate label removed. Product cards use labelled Add to bag buttons, and their selected finish carries through to the detail page. Model category controls use blade-free fan-head artwork based on the Base, Jumbohead and Nanohead photos, displayed in glass tiles with visible names and a selected checkmark. Phones show all three home categories in a row and catalogue filters in a two-column grid. Checkout shows Details → Review → WhatsApp, preserves edits, and returns keyboard focus to the current step. Product-information tabs support arrows and Home/End. Phone inputs are 16px to avoid automatic iOS zoom. Animation respects reduced motion; the liquid navbar and flowing background retain their controls and fallbacks.

The category icons are checked-in transparent 256 × 256 WebPs under `src/assets/products/icons/`. Edited source artwork is retained under `src/assets/category-heads/`; the original product photos remain intact. Run `npm run assets:categories` to normalize the transparent margins and regenerate the small WebPs. The normal build uses checked-in files and does not need an image service or browser for asset generation. The earlier full-fan thumbnails and their `assets:thumbnails` export command are retained as source references and are no longer used in category controls.

The warranty/service section lives in `src/components/WarrantyServiceSection.tsx`. Its image has a bounded frame, and the model caption and two warranty prices follow in normal document flow. Desktop columns align at the top; tablet and phone layouts stack the card above the service copy. The original product photograph is contained without cropping or covering the caption.

## Components, Tailwind and shadcn

- `src/App.tsx` composes the router and site layout; individual routes live in `src/pages/`.
- Website components such as `Brand`, `Field`, `ProductCard`, `Quantity` and forms live in `src/components/`, with header/footer under `src/components/layout/`.
- `src/store/StoreProvider.tsx` owns the persistent cart, comparisons and notifications. `src/hooks/useFormGuard.tsx` handles form submission safeguards.
- Reusable UI components: **`components/ui/` at the repository root**.
- Shared utilities: `lib/utils.ts`, including the `cn` helper from `clsx` and `tailwind-merge`.
- Global styles, Tailwind imports and theme tokens: **`src/styles.css`**.
- The `@/` alias maps to the **repository root** in both `tsconfig.json` and `vite.config.ts`.
- `components.json` tells the shadcn CLI to use `@/components/ui`, `@/lib/utils` and `src/styles.css`. This Vite project uses `rsc: false` and TypeScript components.

The original site had no reusable components directory. Creating `components/ui/` gives copied UI components and the shadcn CLI a consistent destination, keeps UI primitives apart from page code, and makes `@/components/ui/...` imports resolve predictably. Page code remains in `src/`; components are not duplicated under `src/components`.

The setup is already installed. The relevant commands for reproducing it are:

```sh
npm install motion clsx tailwind-merge tw-animate-css
npm install -D tailwindcss @tailwindcss/vite
```

Tailwind 4 uses the `@tailwindcss/vite` plugin and `@import "tailwindcss"` in the global stylesheet; it does not require a Tailwind 3 configuration file. TypeScript was already installed and remains strict. Theme variables follow shadcn conventions, and page styles use the same shared tokens.

To add another shadcn component to this configured project:

```sh
npm exec -- shadcn@latest add button
```

For a separate, unconfigured React/TypeScript Vite project, `npm exec -- shadcn@latest init` initializes shadcn after configuring Tailwind and the matching TypeScript/Vite import aliases. Initialization is already represented by this repository's `components.json`, aliases, utility and theme setup.

### Floating paths background

`components/ui/floating-paths.tsx` exports the supplied `FloatingPathsBackground` API:

```tsx
import { FloatingPathsBackground } from "@/components/ui/floating-paths";

<FloatingPathsBackground position={-1} className="floating-paths-home">
  {/* Existing hero content */}
</FloatingPathsBackground>;
```

The standalone example is `components/ui/demo.tsx`. On the actual site, `src/pages/Home.tsx` wraps the homepage hero. `position` controls the curves, `className` controls the wrapper, and `children` holds the page content. The wrapper follows its content on mobile instead of forcing the demo's 16:9 ratio.

The background has 36 faint continuous tracks and 36 shorter highlights that travel along them. Highlights keep a fixed dash length and staggered phases, with seamless 6–8.4-second loops, so they visibly flow instead of fading into full stationary lines. The SVG is framed across the hero on desktop and mobile. Motion's `useReducedMotion` omits the moving highlights and retains the static tracks when requested. Timing is deterministic so parent state updates do not change it. The decorative SVG is hidden from assistive technology, clipped to its own bounds, and cannot intercept pointer events. Foreground content remains above it. The homepage uses brand-red styling in `src/styles.css`.

The optional `showControls` prop enables a small Play/Pause flow button and is enabled on the homepage. This lets customers pause ongoing motion or explicitly opt into playback when their device requests reduced motion. No provider or app-level state is required. The controls use the already installed Lucide icons, and the component needs no external image assets. Existing product illustrations remain in place; Unsplash imagery is unnecessary because the component has no image slots.

### Liquid-glass navbar

`components/ui/liquid-glass-navbar.tsx` contains the supplied Nimbus Waterline component, with its original attribution retained. `components/ui/liquid-glass-navbar-demo.tsx` contains the standalone example; the existing floating-paths demo is preserved.

`src/components/layout/Header.tsx` uses the component in the sticky header with Home, Our products, Our story, Support and Contact. Its controlled `active` prop follows React Router, including product details, checkout, support and browser history. The added optional `renderLink` adapter renders real React Router links, retaining normal link behavior and uninterrupted liquid animation across page changes.

Props include `items`, `active` or `defaultActive`, `onChange`, `tone`, `compact`, `sound`, `className`, `style`, `ariaLabel` and `renderLink`. No new dependency, context provider or image asset is needed; React and Lucide were already installed. Sound is disabled on the storefront. Icon effects, ripples, stretch/split/merge physics and the WebGL shader are retained, with white/pale-red styling to fit the brand.

Keyboard arrows and Home/End move link focus; Enter activates a link. Phones and tablets show all five navigation links in a persistent row below a compact, proportional logo and search/bag controls. Visible labels and targets of at least 44 × 44 pixels remain available down to 320 pixels. Escape closes product search and returns focus to its button. At widths up to 900 pixels or with a coarse pointer, the navbar uses the CSS selection drop and rests when idle; desktop keeps the liquid water effect. The component uses unique refraction filter IDs, pauses when hidden or off-screen, responds to reduced-motion preference changes, cleans up rendering/audio resources, and also falls back to the CSS drop if WebGL is unavailable.

The project already has the required TypeScript, Tailwind 4, shadcn aliases and root `components/ui/` structure. Setup and component-add commands are documented above; no reinitialization is necessary.

## Run

Node.js 22.12+ or 24 LTS is recommended. This environment uses Node 24.

```sh
cd /workspace/brightcopter
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173 --strictPort
```

The development server binds to `0.0.0.0`. In this cloud environment, use the existing checkout; each task is already isolated and does not need a Git worktree.

```sh
npm run typecheck
npm run build
npm test
```

Browser tests use the installed `/usr/bin/chromium` if available. Else run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to your browser binary. Tests intercept WhatsApp handoffs locally and never send messages or contact the WhatsApp destination.

## Customer experience

- Homepage with interactive finish previews, filterable/searchable collections and product details.
- Finish selection, quantities, and a shopping bag persisted in browser local storage.
- Fan warranty option comparison.
- Two website steps: delivery/contact details and payment preference, then review. The third progress milestone is the WhatsApp handoff.
- Final action opens WhatsApp for the configured order team with the complete order message. The customer still taps Send in WhatsApp.
- Payment preference is **not** a guaranteed or processed payment method. Staff confirms the final method, price, actual model, stock and fulfillment directly on WhatsApp.
- A fallback WhatsApp link and downloadable request copy remain available if an app handoff is blocked or unavailable.
- Service and dealer enquiry forms prepare separate handoffs to the configured customer care number.
- Saved request lookup is local to the browser. It does not claim to track actual acceptance, payment, shipment or message delivery.
- Support FAQs, warranty guidance, contact, story and explanatory policy pages.
- Reduced-motion support, keyboard navigation, labelled forms and responsive layouts.

## Configuration

Default customer care and order numbers are defined once in `shared/contacts.ts`. `src/contacts.ts` resolves public environment overrides and derives display text and WhatsApp links; existing imports through `src/data.ts` remain supported. Call links, checkout notices, FAQs, recovery screens, policies, static HTML and SEO/schema all use these shared values.

Copy `.env.example` to `.env.local` if you need to override the public numbers or logo location. Leave the number overrides blank to use the shared defaults; otherwise enter international digits including the country code without `+` or spaces. Rebuild after changing numbers or `VITE_` configuration. Never put private credentials in Vite environment variables; they are included in the client bundle.

`src/data.ts` holds the catalogue, prices and finish options, and re-exports the shared contact helpers. `src/components/ProductPhoto.tsx` renders the original product photographs from `src/assets/products/`.

The catalogue contains Base model, Jumbohead model, Jumbohead Wood model, Nanohead model and Nanohead Wood model. Base model has four colours: Black, White, Brown and Ivory. A 2-year warranty costs ₹2,350; a 3-year warranty costs ₹2,550. Each warranty uses a stable variant ID (`base-model-2-year`, `base-model-3-year`), so different warranties in the same colour remain distinct bag lines. Model cards group variants by `modelId` and offer a warranty selector. Category and model identity are separate, so Jumbohead and Jumbohead Wood share a category while retaining separate products, photos and price schedules. Both the chosen photo and price follow the selection through the bag, review and WhatsApp message.

Jumbohead model is available in Black, White and Brown. Its 3-, 5- and 7-year warranty prices are ₹3,550, ₹3,750 and ₹4,300. Jumbohead Wood model is a separate product with a fixed Wood finish and prices of ₹3,950, ₹4,150 and ₹4,700 for the same durations. Wood is excluded from the standard model's colour selector. Both products belong to the Jumbohead model category; each warranty has its own stable variant ID.

Nanohead model is available in Black, Silver, White and Brown. Its 3-, 5- and 7-year warranty prices are ₹3,350, ₹3,650 and ₹4,000. Nanohead Wood model is a separate product with a fixed Wood finish and prices of ₹3,750, ₹4,050 and ₹4,400 for the same durations. Both belong to the Nanohead model category. Standard models cannot select Wood through colour options or URL parameters.

The photographs are exact PNGs extracted from `base model colors.zip`, `jumbohead colors.zip` and `nanohead colors.zip`, matched by their supplied filenames. They have not been regenerated, cropped or recoloured. The extra Nanohead Ivory photograph is preserved at `src/assets/products/nanohead/ivory.png` but is not imported into the catalogue: the owner explicitly limited the standard Nanohead prices to Black, Silver, White and Brown. Old sample catalogue items are discarded from persisted bags and comparison selections by existing validation. Motor type, power, speed, remote features and dimensions have not been assumed from the photographs.

The original lion-and-cub logo from `Bright Copter Lion Bond Logo.zip` is retained at `src/assets/brand-logo.png`. The header and footer load the smaller `src/assets/brand-logo.webp` through `src/brand.ts`; the downloadable preview embeds it. Run `npm run assets:brand` to regenerate the WebP using the installed Playwright browser. The conversion retains all artwork and the original 1672 × 941 proportions, reducing the file from 1.38 MB to about 177 KB. The header badge starts at the left screen edge, has rounded right corners, and scales for mobile; navigation and action buttons retain their own spacing. The footer uses a larger, contained logo. `VITE_BRAND_LOGO_URL` remains an optional public image URL override.

## Data and privacy

Bag selections, comparison choices and prepared requests are saved locally. Prepared requests can include customer contact/address information. There is no application server, customer account, payment processor, email delivery or WhatsApp automation. Only the customer's deliberate WhatsApp handoff shares a prepared message; the customer sends it within WhatsApp. Browser storage cannot establish whether a message was sent or an order accepted.

The privacy page includes a two-step action to remove saved requests. Request creation still allows a WhatsApp handoff when local request saving is unavailable; a copy is available in the current confirmation screen until the user leaves it.

## Before public launch

1. Review the supplied photographs and pricing for all five listed products. Confirm Nanohead Ivory availability and price before adding it to the catalogue.
2. Supply any additional model numbers and verified specifications.
3. Supply complete warranty coverage/returns, tax, delivery and installation terms for the owner-supplied prices.
4. Verify the published address and all public contact details. The order number was explicitly supplied by the owner for WhatsApp checkout.
5. Confirm operational handling for order, service and trade messages. Test the real WhatsApp app handoff on a phone and desktop without treating app opening as order acceptance.
6. Add business-approved legal and privacy terms appropriate to actual operations. Current pages explain this enquiry flow and do not invent a returns policy.

## Deploy

Run `npm run build` and deploy `dist/` to Netlify with HTTPS. The build renders each known route into its own HTML document and generates `_redirects` and `_headers`. Known routes serve their generated documents; unknown routes serve `404.html` with an HTTP 404. Configure equivalent static route resolution, response headers and 404 handling on another host.

All fonts, icons and product illustrations are served locally. Browsing does not depend on a CDN. External contact links go to WhatsApp or the owner-supplied Google Maps link. No deployment or public publication is performed by the build command.

## Portable review preview

Run `node scripts/export-preview.mjs` to export a self-contained HTML preview to `../brightcopter-artifacts/`. An optional destination path can be passed as the first argument. Download `Bright-Copter-Working-Preview.html` and open it in a browser. It includes local fonts, scripts, CSS and illustrations, and uses hash routing so pages work without a server. Restricted embedded viewers with `about:` or `data:` URLs use memory routing to avoid invalid-URL startup errors. If scripts are disabled or startup fails, a static opening guide stays visible instead of a blank page. Some chat/file viewers disable scripts entirely; download the HTML and open it in a full browser to use the interactive site. Production keeps normal BrowserRouter URLs. The export does not deploy or publish the site. Download again after changes; an already downloaded file does not update itself.

## Validation

The Playwright suite checks liquid navigation and browser history, keyboard interaction, WebGL fallback and responsive navbar layout, catalogue filtering, hero-finish previews, selected finishes carried into product details, keyboard product tabs, finish/quantity persistence, comparison, the complete WhatsApp order payload and destination, service enquiries, malformed stored data, mobile layouts and checkout/edit focus, floating-path animation and reduced-motion behavior, and automated WCAG A/AA checks for the homepage and checkout. Contrast checks wait for finite page-entry transitions to finish so the scan measures the settled interface. Automated accessibility checks are useful coverage and do not replace manual testing.

Run `npm run preview:test` to rebuild the portable HTML and check it in a normal browser, an opaque sandbox frame, a script-blocked frame and a browser with JavaScript disabled. Interactive cases verify the logo, product navigation, bag and checkout entry; blocked cases must display opening instructions.

## Technical files, policies and security

The canonical origin is configured as `https://brightcopter.netlify.app`, supplied by the owner. `SITE_URL` can override it at build time. Netlify uses the checked-in `netlify.toml`; build with `npm run build` and publish `dist/`.

The build generates `sitemap.xml`, standard `robots.txt` (plus a compatibility `robot.txt`), a custom `404.html`, and prerendered HTML from the actual React pages through `src/prerender.tsx`. All 24 public routes contain their page content, Open Graph/Twitter metadata, canonical links and JSON-LD before JavaScript runs. Every warranty variant has a product-specific title, price-aware description and Product/Offer schema. The client then mounts the interactive app and reads the customer's local browser state. Private routes remain noindex and never include customer data in the build. Static forms show a call/JavaScript notice to avoid native GET submissions exposing customer details in URLs.

`index.html` also contains fallback Open Graph/Twitter tags, a canonical URL and readable home content. Build-time generation replaces these with route-specific metadata using `SITE_URL`. Sharing images under `public/social/` are 1200 × 630 JPEG copies of the supplied model photos, approximately 21–32 KB each. Run `npm run assets:social` to regenerate them after changing product photos; normal builds use the checked-in files. The original logo remains at `public/og-image.png` for business schema and is unchanged. The lion-and-cub favicon rendition is retained at `src/assets/favicon-source.png`. Run `npm run assets:icons` to export `public/favicon.ico` (16/32/48/64 px), PNG icons (16/32/192/512 px) and the 180 px Apple touch icon. The former letter-B SVG is removed. Icon links include a version query so browsers can refresh the previously cached design; the portable preview embeds all linked icons. Sitemap/robots/header snapshots are refreshed with `node scripts/build-technical.mjs --sync-public`; builds always regenerate the deployed versions.

The footer links directly to `/return-policy` and `/terms-and-conditions`. Both use original Bright Copter wording, semantic sections and contents links, with static HTML in the build. Legacy policy links redirect. Returns guidance explains assessment and staff confirmation without inventing a return window, fee or refund deadline. Statutory consumer rights remain protected. Privacy and warranty pages describe the actual local-storage and WhatsApp flow.

There are no private frontend credentials or optional tracking integrations. Cookie consent is therefore not displayed. See [SECURITY.md](SECURITY.md) for the environment allowlist, Netlify CSP/headers, input validation, client spam controls, error/success states, retention, future API CORS/rate-limit template, limitations and verification commands. The API template is inactive and does not accept orders.

To refresh the complete review ZIPs after building/exporting, run `npm run package:project` (Python 3 and Git required). It packages Git-listed source, excludes real environment files and symlinks, and includes the current built site and portable preview.
