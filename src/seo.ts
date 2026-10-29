import { products, cataloguePriceRange, catalogueStartingPrice, money } from './data';
import { legalPages } from './policies';
import { careNumber, orderNumber, careDisplay, orderDisplay } from './contacts';
export const siteUrl = __SITE_URL__;
export const publicRoutes = [
  '/', '/products', '/support', '/business', '/about', '/contact',
  '/return-policy', '/terms-and-conditions', '/policies/privacy', '/policies/warranty',
  ...products.map(product => `/product/${product.id}`),
];
export const privateRoutes = ['/cart', '/checkout', '/compare', '/order/confirmation', '/track'];
const pages: Record<string, [string, string]> = {
  '/': [`Ceiling Fans in Kerala from ${money(catalogueStartingPrice)}`, `ചൂടിന് ഇത്ര ജാഡ വേണ്ട. Bright Copter ceiling fans from ${money(catalogueStartingPrice)}. Choose 2–7 year warranty options by model, with service across Kerala. Order via WhatsApp.`],
  '/products': ['Ceiling Fan Prices & Warranty Options in Kerala', `വീടിന് ചേരുന്ന ഫാൻ തിരഞ്ഞെടുക്കൂ. Compare Base, Jumbohead and Nanohead ceiling fans at ${cataloguePriceRange}, colours and warranty options. Order via WhatsApp.`],
  '/support': ['Ceiling Fan Service & Warranty Support in Kerala', 'Bright Copter fan service across Kerala. Ask about repairs and warranty options, or prepare a service request with your model and purchase details.'],
  '/business': ['Ceiling Fan Dealer & Bulk Enquiries in Kerala', 'Buying ceiling fans for a shop or project? Discuss Base, Jumbohead and Nanohead models, quantities, availability and delivery with Bright Copter in Thrissur.'],
  '/about': ['Our Ceiling Fan Brand in Thrissur, Kerala', 'Meet Bright Copter, an appliance brand and electronic goods manufacturer in Parappur, Thrissur. Explore ceiling fans, warranty options and Kerala-wide service.'],
  '/contact': ['Contact & WhatsApp Orders in Thrissur', `Ask Bright Copter about ceiling fans, warranty or delivery. Customer care: ${careDisplay}. WhatsApp orders: ${orderDisplay}. Parappur, Thrissur, Kerala.`],
  '/policies/privacy': ['Privacy & browser storage', 'How Bright Copter handles locally prepared requests, browser storage and WhatsApp handoffs. No optional visitor tracking is currently installed.'],
  '/policies/warranty': ['Warranty information', 'Compare Bright Copter warranty durations and prices and learn how to request warranty or service assistance.'],
  '/cart': ['Your shopping bag', 'Review your selected fans before starting WhatsApp checkout.'],
  '/checkout': ['WhatsApp checkout', 'Review delivery details and a payment preference before preparing your WhatsApp order request.'],
  '/compare': ['Compare fan options', 'Compare your selected Bright Copter fan warranty options.'],
  '/track': ['Saved request lookup', 'Look up a locally saved request or contact the Bright Copter team for an order update.'],
  '/order/confirmation': ['Your request is prepared', 'Send your prepared request in WhatsApp. Staff confirms acceptance, payment instructions and delivery.'],
};
export const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export function pageMetadata(pathname: string, resolveAsset: (src: string) => string = src => src) {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const product = products.find(item => path === `/product/${item.id}`);
  const legal = legalPages[path as keyof typeof legalPages];
  const found = publicRoutes.includes(path) || privateRoutes.includes(path);
  const [label, description] = product
    ? [`${product.name} ceiling fan · ${product.warranty}-year warranty`, `${product.name} ceiling fan with ${product.warranty}-year warranty at ${money(product.price!)}. Compare finishes. Kerala service; confirm availability and delivery on WhatsApp.`]
    : legal ? [legal.title, legal.description]
    : pages[path] || ['404 — Page not found', 'This page could not be found. Explore Bright Copter ceiling fans or contact our team for help.'];
  const canonical = `${siteUrl}${path === '/' ? '/' : path}`;
  const businessId = `${siteUrl}/#business`;
  const business = {
    '@type': ['Organization', 'LocalBusiness'], '@id': businessId, name: 'Bright Copter', url: `${siteUrl}/`,
    description: `Ceiling fans priced ${cataloguePriceRange}, with warranty options by model and service across Kerala. Appliance brand based in Parappur, Thrissur, Kerala, India.`,
    logo: `${siteUrl}/og-image.png`, image: `${siteUrl}/social/base-model.jpg`, telephone: `+${careNumber}`,
    areaServed: { '@type': 'State', name: 'Kerala' },
    address: { '@type': 'PostalAddress', addressLocality: 'Parappur, Thrissur', addressRegion: 'Kerala', addressCountry: 'IN' },
    hasMap: 'https://maps.app.goo.gl/gfDbwVmzi4jWBNxz8',
    sameAs: ['https://www.facebook.com/p/Bright-Copter-61566378232921/', 'https://www.indiamart.com/bright-copter/aboutus.html'],
    contactPoint: [
      { '@type': 'ContactPoint', telephone: `+${orderNumber}`, contactType: 'sales' },
      { '@type': 'ContactPoint', telephone: `+${careNumber}`, contactType: 'customer service' },
    ],
  };
  // Portable previews inline photos; do not duplicate large data URLs in social
  // tags or JSON-LD. Production builds use the real hashed HTTPS asset URLs.
  const productImages = product ? product.colors.map(colour => resolveAsset(product.images[colour]))
    .filter(source => !source.startsWith('data:')).map(source => new URL(source, `${siteUrl}/`).href) : [];
  const image = `${siteUrl}/social/${product?.modelId || 'base-model'}.jpg`;
  const imageAlt = `Bright Copter ${product?.name || 'Base model'} ceiling fan`;
  const inLanguage = ['en-IN', 'ml-IN'];
  const graph: unknown[] = [business, { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: 'Bright Copter', inLanguage, publisher: { '@id': businessId } }];
  if (found && !privateRoutes.includes(path)) graph.push({ '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: label, description, inLanguage: ['/', '/products', '/support', '/business', '/about', '/contact'].includes(path) ? inLanguage : 'en-IN', isPartOf: { '@id': `${siteUrl}/#website` } });
  if (product) {
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ceiling fans', item: `${siteUrl}/products` },
      { '@type': 'ListItem', position: 2, name: product.name, item: canonical },
    ] });
    graph.push({
      '@type': 'Product', '@id': `${canonical}#product`, name: label, description,
      ...(productImages.length ? {image: productImages} : {}),
      brand: { '@type': 'Brand', name: 'Bright Copter' }, category: product.category, color: product.colors.join(', '),
      productID: product.id,
      additionalProperty: { '@type': 'PropertyValue', name: 'Warranty option', value: `${product.warranty} years; coverage confirmed at purchase` },
      offers: { '@type': 'Offer', url: canonical, priceCurrency: 'INR', price: product.price, seller: { '@id': businessId } },
    });
  }
  return { path, label, title: `${label}${product ? ' — ' : ' | '}Bright Copter`, description, canonical, image, imageAlt, product,
    index: __INDEXING_ALLOWED__ && found && !privateRoutes.includes(path), type: 'website', schema: { '@context': 'https://schema.org', '@graph': graph } };
}
