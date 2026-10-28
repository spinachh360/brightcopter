# Bright Copter

A responsive React + TypeScript storefront for Bright Copter, with frosted surfaces, locally hosted fonts, original illustrative product renders, and WhatsApp order checkout. Built with Vite, React Router, Tailwind CSS 4, Motion and Lucide icons, with a shadcn-compatible component structure.

The refreshed design uses white, restrained rose glass and Bright Copter red. Shared tokens in `src/styles.css` define the surfaces, control shadows, typography, focus rings and motion. Primary actions use red; secondary buttons and selected tabs use translucent white. The responsive stylesheet replaces the previous layered styling rather than adding another override sheet.

The homepage includes interactive fan-finish previews and a simpler visual hierarchy. Product cards use labelled Add to bag buttons, and their selected finish carries through to the detail page. Catalogue filters sit above the range and scroll horizontally on smaller screens. Checkout shows Details → Review → WhatsApp, preserves edits, and returns keyboard focus to the current step. Product-information tabs support arrows and Home/End. Phone inputs are 16px to avoid automatic iOS zoom. Animation respects reduced motion; the liquid navbar and flowing background retain their controls and fallbacks.

## Components, Tailwind and shadcn

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

The standalone example is `components/ui/demo.tsx`. On the actual site, `src/App.tsx` wraps the existing homepage hero. `position` controls the curves, `className` controls the wrapper, and `children` holds the page content. The wrapper follows its content on mobile instead of forcing the demo's 16:9 ratio.

The background has 36 faint continuous tracks and 36 shorter highlights that travel along them. Highlights keep a fixed dash length and staggered phases, with seamless 6–8.4-second loops, so they visibly flow instead of fading into full stationary lines. The SVG is framed across the hero on desktop and mobile. Motion's `useReducedMotion` omits the moving highlights and retains the static tracks when requested. Timing is deterministic so parent state updates do not change it. The decorative SVG is hidden from assistive technology, clipped to its own bounds, and cannot intercept pointer events. Foreground content remains above it. The homepage uses brand-red styling in `src/styles.css`.

The optional `showControls` prop enables a small Play/Pause flow button and is enabled on the homepage. This lets customers pause ongoing motion or explicitly opt into playback when their device requests reduced motion. No provider or app-level state is required. The controls use the already installed Lucide icons, and the component needs no external image assets. Existing product illustrations remain in place; Unsplash imagery is unnecessary because the component has no image slots.

### Liquid-glass navbar

`components/ui/liquid-glass-navbar.tsx` contains the supplied Nimbus Waterline component, with its original attribution retained. `components/ui/liquid-glass-navbar-demo.tsx` contains the standalone example; the existing floating-paths demo is preserved.

`src/App.tsx` uses the component in the sticky header with Home, Our products, Our story, Support and Contact. Its controlled `active` prop follows React Router, including product details, checkout, support and browser history. The added optional `renderLink` adapter renders real React Router links, retaining normal link behavior and uninterrupted liquid animation across page changes.

Props include `items`, `active` or `defaultActive`, `onChange`, `tone`, `compact`, `sound`, `className`, `style`, `ariaLabel` and `renderLink`. No new dependency, context provider or image asset is needed; React and Lucide were already installed. Sound is disabled on the storefront. Icon effects, ripples, stretch/split/merge physics and the WebGL shader are retained, with white/pale-red styling to fit the brand.

Keyboard arrows and Home/End move link focus; Enter activates a link. Escape closes the mobile menu and returns focus to its button. Small tablets use labelled-for-accessibility icons; phone menus show icons and small visible labels. The component uses unique refraction filter IDs, pauses when hidden or off-screen, responds to reduced-motion preference changes, cleans up rendering/audio resources, and falls back to a CSS selection drop if WebGL is unavailable.

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
- Three-way BLDC fan comparison.
- Two website steps: delivery/contact details and payment preference, then review. The third progress milestone is the WhatsApp handoff.
- Final action opens WhatsApp for **+91 79073 44474** with the complete order message. The customer still taps Send in WhatsApp.
- Payment preference is **not** a guaranteed or processed payment method. Staff confirms the final method, price, actual model, stock and fulfillment directly on WhatsApp.
- A fallback WhatsApp link and downloadable request copy remain available if an app handoff is blocked or unavailable.
- Service and dealer enquiry forms prepare separate handoffs to the supplied customer care number, **+91 94008 85633**.
- Saved request lookup is local to the browser. It does not claim to track actual acceptance, payment, shipment or message delivery.
- Support FAQs, warranty guidance, contact, story and explanatory policy pages.
- Reduced-motion support, keyboard navigation, labelled forms and responsive layouts.

## Configuration

Copy `.env.example` to `.env.local` if you need to override the public numbers or logo location. Rebuild after changing `VITE_` configuration. Never put private credentials in Vite environment variables; they are included in the client bundle.

`src/data.ts` holds the catalogue, prices, finish options and WhatsApp destinations. `src/ProductVisual.tsx` contains original illustrative product artwork. These visuals do not represent verified Bright Copter SKUs.

The original lion-and-cub logo from `Bright Copter Lion Bond Logo.zip` is included at `src/assets/brand-logo.png` and displayed in the header and footer. Its red background, wordmark and tagline are preserved, without cropping or redrawing. `src/brand.ts` bundles the original PNG automatically; the downloadable preview embeds the image so it works without an external logo URL. The header scales it for smaller screens, and the footer uses a larger version. `VITE_BRAND_LOGO_URL` remains an optional override for a separately hosted image.

## Data and privacy

Bag selections, comparison choices and prepared requests are saved locally. Prepared requests can include customer contact/address information. There is no application server, customer account, payment processor, email delivery or WhatsApp automation. Only the customer's deliberate WhatsApp handoff shares a prepared message; the customer sends it within WhatsApp. Browser storage cannot establish whether a message was sent or an order accepted.

The privacy page includes a two-step action to remove saved requests. Request creation still allows a WhatsApp handoff when local request saving is unavailable; a copy is available in the current confirmation screen until the user leaves it.

## Before public launch

1. Add actual product photographs; the original logo is already included.
2. Replace the clearly labelled illustrative collection names with verified SKU names, finishes and specifications.
3. Confirm the owner-supplied indicative prices and warranty durations, then supply complete warranty/returns, tax, delivery and installation terms.
4. Verify the published address and all public contact details. The order number was explicitly supplied by the owner for WhatsApp checkout.
5. Confirm operational handling for order, service and trade messages. Test the real WhatsApp app handoff on a phone and desktop without treating app opening as order acceptance.
6. Add business-approved legal and privacy terms appropriate to actual operations. Current pages explain this enquiry flow and do not invent a returns policy.

## Deploy

Run `npm run build` and deploy `dist/` to a static host with HTTPS. Client-side routes must fall back to `index.html`; `public/_redirects` supplies the standard Netlify/Cloudflare Pages fallback. Configure an equivalent SPA fallback on another host.

All fonts, icons and product illustrations are served locally. Browsing does not depend on a CDN. External contact links go to WhatsApp or the owner-supplied Google Maps link. No deployment or public publication is performed by the build command.

## Portable review preview

Run `node scripts/export-preview.mjs` to export a self-contained HTML preview to `../brightcopter-artifacts/`. An optional destination path can be passed as the first argument. Download `Bright-Copter-Working-Preview.html` and open it in a browser. It includes local fonts, scripts, CSS and illustrations, and uses hash routing so pages work without a server. Restricted embedded viewers with `about:` or `data:` URLs use memory routing to avoid invalid-URL startup errors. If scripts are disabled or startup fails, a static opening guide stays visible instead of a blank page. Some chat/file viewers disable scripts entirely; download the HTML and open it in a full browser to use the interactive site. Production keeps normal BrowserRouter URLs. The export does not deploy or publish the site. Download again after changes; an already downloaded file does not update itself.

## Validation

The Playwright suite checks liquid navigation and browser history, keyboard interaction, WebGL fallback and responsive navbar layout, catalogue filtering, hero-finish previews, selected finishes carried into product details, keyboard product tabs, finish/quantity persistence, comparison, the complete WhatsApp order payload and destination, service enquiries, malformed stored data, mobile layouts and checkout/edit focus, floating-path animation and reduced-motion behavior, and automated WCAG A/AA checks for the homepage and checkout. Contrast checks wait for finite page-entry transitions to finish so the scan measures the settled interface. Automated accessibility checks are useful coverage and do not replace manual testing.

Run `npm run preview:test` to rebuild the portable HTML and check it in a normal browser, an opaque sandbox frame, a script-blocked frame and a browser with JavaScript disabled. Interactive cases verify the logo, product navigation, bag and checkout entry; blocked cases must display opening instructions.
