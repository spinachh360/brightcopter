import { products, cataloguePriceRange } from './data';
import { legalPages } from './policies';
export const siteUrl = __SITE_URL__;
export const publicRoutes = [
  '/', '/products', '/support', '/business', '/about', '/contact',
  '/return-policy', '/terms-and-conditions', '/policies/privacy', '/policies/warranty',
  ...products.map(product => `/product/${product.id}`),
];
export const privateRoutes = ['/cart', '/checkout', '/compare', '/order/confirmation', '/track'];
const pages: Record<string, [string, string]> = {
  '/': ['Ceiling fans for everyday comfort', `Bright Copter ceiling fans priced ${cataloguePriceRange}, with 2-, 3-, 5- or 7-year warranty options by model. Service across Kerala. Order on WhatsApp.`],
  '/products': ['Ceiling fan collection', 'Compare Bright Copter ceiling fans, colours, warranty options and prices. Wood versions are listed separately.'],
  '/support': ['Product support & warranty guidance', 'Get help with Bright Copter ceiling fans, warranty questions and service requests from our team in Kerala.'],
  '/business': ['Dealer & bulk enquiries', 'Discuss Bright Copter fan quantities, availability, delivery and trade enquiries with our team.'],
  '/about': ['About Bright Copter', 'Bright Copter is an appliance brand and electronic goods manufacturer based in Parappur, Thrissur, Kerala, India.'],
  '/contact': ['Contact Bright Copter', 'Contact Bright Copter customer care on +91 94008 85633 or the WhatsApp order team on +91 79073 44474. Based in Parappur, Thrissur, Kerala.'],
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
    ? [`${product.name} · ${product.warranty}-year warranty`, product.description]
    : legal ? [legal.title, legal.description]
    : pages[path] || ['404 — Page not found', 'This page could not be found. Explore Bright Copter ceiling fans or contact our team for help.'];
  const canonical = `${siteUrl}${path === '/' ? '/' : path}`;
  const businessId = `${siteUrl}/#business`;
  const business = {
    '@type': ['Organization', 'LocalBusiness'], '@id': businessId, name: 'Bright Copter', url: `${siteUrl}/`,
    description: 'Appliance brand and electronic goods manufacturer based in Parappur, Thrissur, Kerala, India.',
    logo: `${siteUrl}/og-image.png`, image: `${siteUrl}/og-image.png`, telephone: '+919400885633',
    address: { '@type': 'PostalAddress', addressLocality: 'Parappur, Thrissur', addressRegion: 'Kerala', addressCountry: 'IN' },
    hasMap: 'https://maps.app.goo.gl/gfDbwVmzi4jWBNxz8',
    sameAs: ['https://www.facebook.com/p/Bright-Copter-61566378232921/', 'https://www.indiamart.com/bright-copter/aboutus.html'],
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+917907344474', contactType: 'sales' },
      { '@type': 'ContactPoint', telephone: '+919400885633', contactType: 'customer service' },
    ],
  };
  // Portable previews inline photos; do not duplicate large data URLs in social
  // tags or JSON-LD. Production builds use the real hashed HTTPS asset URLs.
  const productImages = product ? product.colors.map(colour => resolveAsset(product.images[colour]))
    .filter(source => !source.startsWith('data:')).map(source => new URL(source, `${siteUrl}/`).href) : [];
  const image = productImages[0] || `${siteUrl}/og-image.png`;
  const imageAlt = productImages.length ? `${product!.name} ceiling fan` : 'Bright Copter lion-and-cub logo';
  const graph: unknown[] = [business, { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: 'Bright Copter', publisher: { '@id': businessId } }];
  if (found && !privateRoutes.includes(path)) graph.push({ '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: label, description, isPartOf: { '@id': `${siteUrl}/#website` } });
  if (product) {
    graph.push({
      '@type': 'Product', '@id': `${canonical}#product`, name: label, description,
      ...(productImages.length ? {image: productImages} : {}),
      brand: { '@type': 'Brand', name: 'Bright Copter' }, category: product.category, color: product.colors.join(', '),
      productID: product.id,
      additionalProperty: { '@type': 'PropertyValue', name: 'Warranty option', value: `${product.warranty} years; coverage confirmed at purchase` },
      offers: { '@type': 'Offer', url: canonical, priceCurrency: 'INR', price: product.price, seller: { '@id': businessId } },
    });
  }
  return { path, label, title: `${label} | Bright Copter`, description, canonical, image, imageAlt, product,
    index: __INDEXING_ALLOWED__ && found && !privateRoutes.includes(path), type: 'website', schema: { '@context': 'https://schema.org', '@graph': graph } };
}
