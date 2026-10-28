import { useEffect, useId, useRef, useState, createContext, useContext } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCircle2,
  Plus,
  Minus,
  X,
  ShoppingBag,
  LayoutGrid,
  House,
  Search,
  Wind,
  ShieldCheck,
  Headphones,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  SlidersHorizontal,
  GitCompareArrows,
  Timer,
  Fan,
  Heart,
  Package,
  Wrench,
  Building2,
  CircleHelp,
  FileText,
  CheckCheck,
  Mail,
  Send,
  Download,
  RefreshCw,
  ExternalLink,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ProductPhoto from "./ProductPhoto";
import baseThumbnail from "./assets/products/thumbnails/base.webp";
import jumboheadThumbnail from "./assets/products/thumbnails/jumbohead.webp";
import nanoheadThumbnail from "./assets/products/thumbnails/nanohead.webp";
import { LegalPage } from "./LegalPage";
import { Metadata } from "./Metadata";
import { useFormGuard } from "./FormGuard";
import { plainText, phoneNumber, validateOrder } from "../shared/validation";
import { brandLogoUrl } from "./brand";
import { LiquidNavbar } from "@/components/ui/liquid-glass-navbar";
import type { LiquidNavItem } from "@/components/ui/liquid-glass-navbar";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import {
  products,
  modelProducts,
  productOptions,
  money,
  cataloguePriceRange,
  careNumber,
  careDisplay,
  orderDisplay,
  finishes,
  readStorage,
  writeStorage,
  whatsapp,
  orderWhatsapp,
  mapLink,
  createReference,
  getRequests,
  isPreparedRequest,
  parseCart,
} from "./data";
import type { Product, CartItem, PreparedRequest } from "./data";

type Store = {
  cart: CartItem[];
  add: (p: Product, finish: string, quantity?: number) => void;
  update: (id: string, finish: string, delta: number) => void;
  remove: (id: string, finish: string) => void;
  clear: () => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  notify: (message: string) => void;
};
const StoreContext = createContext<Store>(null!);
const useStore = () => useContext(StoreContext);
const categories = [
  { label: "All fans", thumbnail: undefined },
  { label: "Base model", thumbnail: baseThumbnail },
  { label: "Jumbohead model", thumbnail: jumboheadThumbnail },
  { label: "Nanohead model", thumbnail: nanoheadThumbnail },
];
function CategoryThumbnail({ src }: { src?: string }) {
  return <span className="category-thumbnail" aria-hidden="true">
    {src ? <img src={src} width={128} height={96} alt="" decoding="async" /> : <LayoutGrid size={20} />}
  </span>;
}
const cx = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ");

function IconTile({
  icon: Icon,
  tone = "",
}: {
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <span className={`icon-tile ${tone}`}>
      <Icon size={21} strokeWidth={1.6} />
    </span>
  );
}
function Brand({ light = false }: { light?: boolean }) {
  const logo = brandLogoUrl;
  const [failed, setFailed] = useState(false);
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Bright Copter home"
    >
      {logo && !failed ? (
        <img
          className="brand-image"
          src={logo}
          width={1672}
          height={941}
          onError={() => setFailed(true)}
          alt="Bright Copter — Long lasting bonding like a father"
        />
      ) : (
        <span className="brand-wordmark">
          Bright Copter<sup>™</sup>
          <small>LONG LASTING BONDING LIKE A FATHER</small>
        </span>
      )}
    </Link>
  );
}
function SectionTitle({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span />
          {eyebrow}
        </p>
        <h2>{title}</h2>
        {children && <p className="section-description">{children}</p>}
      </div>
      {action}
    </div>
  );
}
function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro container">
      <p className="eyebrow">
        <span />
        {eyebrow}
      </p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

const primaryNavigation: LiquidNavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <House size={17} aria-hidden="true" />,
    fx: "glow",
  },
  {
    label: "Our products",
    shortLabel: "Products",
    href: "/products",
    icon: <Fan size={17} aria-hidden="true" />,
    fx: "spin",
  },
  {
    label: "Our story",
    shortLabel: "Story",
    href: "/about",
    icon: <Heart size={17} aria-hidden="true" />,
    fx: "pop",
  },
  {
    label: "Support",
    href: "/support",
    icon: <Headphones size={17} aria-hidden="true" />,
    fx: "wave",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: <MapPin size={17} aria-hidden="true" />,
    fx: "drop",
  },
];

function navigationSection(pathname: string) {
  if (pathname === "/") return 0;
  if (
    [
      "/products",
      "/product/",
      "/compare",
      "/cart",
      "/checkout",
      "/order/",
    ].some((path) => pathname.startsWith(path))
  )
    return 1;
  if (pathname === "/about") return 2;
  if (
    ["/support", "/track", "/policies/"].some((path) =>
      pathname.startsWith(path),
    )
  )
    return 3;
  if (["/contact", "/business"].includes(pathname)) return 4;
  return -1;
}

function Header() {
  const { cart } = useStore();
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setSearch(false);
  }, [location.pathname, location.search]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      <div className="announcement">
        <span>Ceiling fan service across Kerala.</span>
        <Link to="/support">
          Request service <ArrowUpRight size={12} />
        </Link>
      </div>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && search) {
            setSearch(false);
            (
              event.currentTarget.querySelector(
                ".search-toggle",
              ) as HTMLButtonElement | null
            )?.focus();
          }
        }}
      >
        <div className="nav-shell container">
          <Brand />
          <LiquidNavbar
            className="main-nav liquid-main-nav"
            ariaLabel="Main navigation"
            items={primaryNavigation}
            active={navigationSection(location.pathname)}
            tone="light"
            compact={false}
            sound={false}
            renderLink={({ href, ...props }) => (
              <Link {...props} to={href || "/"} />
            )}
          />
          <div className="nav-actions">
            <button
              className="icon-button search-toggle"
              aria-label={search ? "Close search" : "Search products"}
              onClick={() => setSearch(!search)}
              aria-expanded={search}
            >
              <Search size={20} />
            </button>
            <Link
              className="icon-button bag-button"
              to="/cart"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={20} />
              {count > 0 && <span className="bag-count">{count}</span>}
            </Link>
            <Link className="button button-small nav-shop" to="/products">
              Explore products <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        {search && (
          <form
            className="search-panel container"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/products?q=${encodeURIComponent(query)}`);
            }}
          >
            <Search size={20} />
            <input
              autoFocus
              aria-label="Search product catalogue"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Base model, Jumbohead, Nanohead…"
            />
            <button className="button button-small">
              Search <ArrowRight size={16} />
            </button>
          </form>
        )}
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand light />
            <p>
              Ceiling fans from Parappur, Thrissur.
              <br />Service across Kerala.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link to="/products">Ceiling fans</Link>
            <Link to="/products">All fans</Link>
            <Link to="/compare">Compare fans</Link>
            <Link to="/about">Our story</Link>
          </div>
          <div>
            <h3>We're here to help</h3>
            <Link to="/support">Product support</Link>
            <Link to="/support?tab=warranty">Warranty guidance</Link>
            <Link to="/track">Order enquiries</Link>
            <Link to="/business">Dealer & bulk enquiries</Link>
          </div>
          <div className="footer-contact">
            <h3>Let's stay connected</h3>
            <a href={`tel:+${careNumber}`}>
              <Phone size={15} /> {careDisplay}
            </a>
            <a
              href={whatsapp(
                "Hello Bright Copter! I would like to know more about your products.",
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={15} /> Chat on WhatsApp{" "}
              <ArrowUpRight size={13} />
            </a>
            <a href={mapLink} target="_blank" rel="noreferrer">
              <MapPin size={15} /> Parappur, Thrissur, Kerala
            </a>
            <Link to="/contact" className="footer-directions">
              Find your way to us <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Bright Copter. All rights reserved.
          </span>
          <div>
            <Link to="/policies/privacy">Privacy</Link>
            <Link to="/terms-and-conditions">Terms & conditions</Link>
            <Link to="/return-policy">Returns & refunds</Link>
            <Link to="/policies/warranty">Warranty</Link>
          </div>
          <span>
            Made for the everyday. <Heart size={12} />
          </span>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  const [category, setCategory] = useState("Base model");
  const [heroFinish, setHeroFinish] = useState("Black");
  const homeProducts = modelProducts.filter(p => p.category === category);
  return (
    <>
      <FloatingPathsBackground
        className="floating-paths-home"
        position={-1}
        showControls
      >
        <section className="hero-section container">
          <div className="hero-copy">
            <div className="hero-label">
              <span className="live-dot" /> BASE · JUMBOHEAD · NANOHEAD
            </div>
            <h1>Comfort.<br />Considered.<br /><span>Yours.</span></h1>
            <p>
              Ceiling fans priced {cataloguePriceRange}, with 2-, 3-, 5- or 7-year
              warranty options depending on the model. Service available across Kerala.
            </p>
            <div className="hero-cta">
              <Link className="button" to="/products">
                Find your perfect fan <ArrowUpRight size={18} />
              </Link>
              <Link className="button button-outline" to="/compare">
                Compare fans <GitCompareArrows size={17} />
              </Link>
            </div>
            <div className="hero-reassurance">
              <MessageCircle size={18} />
              <span>Choose here. Confirm with us on WhatsApp.</span>
            </div>
          </div>
          <div className="hero-stage">
            <div className="hero-product-caption">
              <span>THE BASE MODEL</span>
              <b>2- or 3-year warranty</b>
            </div>
            <div className="hero-render" key={heroFinish}>
              <ProductPhoto hero finish={heroFinish} />
            </div>
            <div className="hero-finish-panel">
              <div><span>YOUR FINISH</span><strong>{heroFinish}</strong></div>
              <div className="hero-swatches" role="group" aria-label="Preview a fan finish">
                {["Black", "White", "Brown", "Ivory"].map((color) => (
                  <button
                    type="button"
                    key={color}
                    aria-label={`Preview ${color}`}
                    aria-pressed={heroFinish === color}
                    onClick={() => setHeroFinish(color)}
                    style={{ "--finish": finishes[color] } as React.CSSProperties}
                  ><span />{heroFinish === color && <Check size={12} />}</button>
                ))}
              </div>
            </div>
            <Link to="/products" className="hero-product-link">
              <span>View Base model<small>From {money(2350)} · 2-year warranty</small></span>
              <span className="round-arrow"><ArrowUpRight size={21} /></span>
            </Link>
          </div>
        </section>
      </FloatingPathsBackground>
      <section
        className="benefit-strip container"
        aria-label="Why Bright Copter"
      >
        {[
          {
            icon: ShoppingBag,
            title: cataloguePriceRange,
            sub: "Across the current fan range",
          },
          {
            icon: ShieldCheck,
            title: "2–7 year warranty options",
            sub: "2, 3, 5 or 7 years by model",
          },
          {
            icon: MapPin,
            title: "Service across Kerala",
            sub: "Request help from customer care",
          },
          {
            icon: MessageCircle,
            title: "WhatsApp checkout",
            sub: "Staff confirms payment and delivery",
          },
        ].map((item) => (
          <div className="benefit" key={item.title}>
            <IconTile icon={item.icon} />
            <div>
              <strong>{item.title}</strong>
              <small>{item.sub}</small>
            </div>
          </div>
        ))}
      </section>
      <section className="section container home-products">
        <SectionTitle
          eyebrow="CEILING FAN COLLECTION"
          title="Compare models, colours and warranties."
          action={
            <Link className="text-button" to="/products">
              Explore all products <ArrowUpRight size={17} />
            </Link>
          }
        >
          Base model has 2- and 3-year warranty options. Jumbohead and Nanohead offer 3, 5 or 7 years. Wood finishes are listed separately.
        </SectionTitle>
        <div className="category-tabs model-category-tabs" aria-label="Product categories">
          {categories
            .filter((c) => c.label !== "All fans")
            .map(({ label, thumbnail }) => (
              <button
                key={label}
                onClick={() => setCategory(label)}
                aria-pressed={category === label}
                className={cx("category-tab", category === label && "selected")}
              >
                <CategoryThumbnail src={thumbnail} />
                <span>{label}</span>
              </button>
            ))}
        </div>
        <div className="product-grid">
          {homeProducts.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
        {!homeProducts.length && <div className="empty-state glass"><Fan size={32} /><h2>{category}</h2><p>Photos and pricing will be added soon.</p></div>}
        <p className="catalogue-note">Choose your model and warranty to see its price. Our team confirms availability, delivery and complete warranty terms on WhatsApp.</p>
      </section>
      <section className="story-panel container">
        <div className="story-art">
          <div className="story-square" />
          <ProductPhoto finish="Brown" />
          <div className="story-art-caption">
            <span>BASE MODEL · BROWN</span>
            <strong>
              2-year: {money(2350)}
              <br />
              3-year: {money(2550)}
            </strong>
          </div>
          <span className="story-art-number">BLACK · WHITE · BROWN · IVORY</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">
            <span />
            WARRANTY & SERVICE
          </p>
          <h2>
            2 to 7 years.
            <br />
            <span>Service across Kerala.</span>
          </h2>
          <p>
            Choose the warranty duration shown for your model. Before purchase,
            our team explains covered parts, exclusions and service arrangements.
          </p>
          <p>
            For service anywhere in Kerala, share your model, purchase details
            and location with customer care on {careDisplay}. The team will
            confirm the next step, appointment arrangements and any charges.
          </p>
          <Link to="/support?tab=service" className="button button-outline">
            Request fan service <ArrowUpRight size={17} />
          </Link>
          <div className="story-signature">
            <MapPin size={18} />
            <span>Based in Parappur, Thrissur, Kerala.</span>
          </div>
        </div>
      </section>
      <section className="section container steps-section">
        <SectionTitle
          eyebrow="ORDER IN THREE STEPS"
          title="How WhatsApp checkout works."
        >
          Review your selection and address before sending your order. Staff confirms the final total, delivery and payment method on WhatsApp.
        </SectionTitle>
        <div className="home-steps">
          {[
            {
              n: "01",
              icon: Search,
              title: "Find your favourite",
              text: "Explore our range and compare the options that matter to you.",
            },
            {
              n: "02",
              icon: SlidersHorizontal,
              title: "Add your details",
              text: "Share your address and preferred way to pay. Review everything before continuing.",
            },
            {
              n: "03",
              icon: MessageCircle,
              title: "Finish on WhatsApp",
              text: "Send your prepared order. Our staff confirms availability, delivery, total and payment.",
            },
          ].map((s) => (
            <div className="home-step" key={s.n}>
              <span className="step-number">{s.n}</span>
              <IconTile icon={s.icon} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <SupportBanner />
      <section className="container business-strip">
        <span>
          <Building2 size={24} />
          <div>
            <h3>Dealer & bulk orders.</h3>
            <p>Exploring bulk orders or becoming a dealer? Let's talk.</p>
          </div>
        </span>
        <Link className="text-button" to="/business">
          Connect with our team <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}

function SupportBanner() {
  return (
    <section className="support-banner container">
      <div className="support-banner-icon">
        <Headphones size={42} strokeWidth={1.3} />
        <span className="support-dot" />
      </div>
      <div>
        <p className="eyebrow">BRIGHT COPTER CUSTOMER CARE</p>
        <h2>Fan service across Kerala.</h2>
        <p>
          Call {careDisplay} for warranty questions or prepare a service request with your model and purchase details.
        </p>
      </div>
      <Link className="button button-white" to="/support">
        Get product support <ArrowUpRight size={18} />
      </Link>
      <div className="support-decoration" aria-hidden="true" />
    </section>
  );
}

function ProductCard({ product: initialProduct }: { product: Product }) {
  const [variant, setVariant] = useState(initialProduct.id);
  const product = products.find(p => p.id === variant) || initialProduct;
  const { compare, toggleCompare, add } = useStore();
  const [finish, setFinish] = useState(product.finish);
  const detailUrl = `/product/${product.id}?finish=${encodeURIComponent(finish)}`;
  return (
    <article className="product-card glass">
      <div className="product-image">
        <span className="product-tag">
          {product.warranty ? <ShieldCheck size={12} /> : <Package size={12} />}{" "}
          {product.warranty
            ? `${product.warranty}-year warranty option`
            : product.tag}
        </span>
        {product.kind === "fan" && (
          <button
            onClick={() => toggleCompare(product.id)}
            className={cx(
              "compare-toggle",
              compare.includes(product.id) && "selected",
            )}
            aria-label={`${compare.includes(product.id) ? "Remove" : "Add"} ${product.name} ${compare.includes(product.id) ? "from" : "to"} comparison`}
            aria-pressed={compare.includes(product.id)}
          >
            <GitCompareArrows size={17} />
          </button>
        )}
        <Link to={detailUrl} aria-label={`View ${product.name}`}>
          <ProductPhoto product={product} finish={finish} />
        </Link>
        {product.colors.length > 1 && <div className="finish-dots" aria-label={`${product.name} finish`}>
          {product.colors.map((color) => (
            <button
              key={color}
              title={color}
              aria-label={`${product.name}, ${color}`}
              aria-pressed={finish === color}
              className={cx(finish === color && "active")}
              onClick={() => setFinish(color)}
              style={{ "--finish": finishes[color] } as React.CSSProperties}
            />
          ))}
        </div>}
      </div>
      <div className="product-card-info">
        <div>
          <span className="product-kicker">
            CEILING FAN / {product.warranty}-YEAR WARRANTY
          </span>
          <h3>
            <Link to={detailUrl}>{product.name}</Link>
          </h3>
          <p>
            {finish}
            {" · "}{product.warranty}-year warranty
          </p>
        </div>
        <WarrantyChoices product={product} onChange={p => setVariant(p.id)} />
        <div className="product-card-bottom">
          <div>
            {product.price ? (
              <>
                <strong>{money(product.price)}</strong>
                <small>{product.warranty}-year warranty</small>
              </>
            ) : (
              <strong className="enquiry-price">Let's find your fit</strong>
            )}
          </div>
          {product.price ? (
            <button
              className="add-product"
              aria-label={`Add ${product.name} to bag`}
              onClick={() => add(product, finish)}
            >
              <Plus size={17} /><span>Add to bag</span>
            </button>
          ) : (
            <Link
              className="add-product"
              aria-label={`Enquire about ${product.name}`}
              to={`/product/${product.id}`}
            >
              <span>Explore</span><ArrowUpRight size={17} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All fans";
  const query = params.get("q") || "";
  const [sort, setSort] = useState("featured");
  let shown = modelProducts.filter(
    (p) =>
      (category === "All fans" || category === "Fans" || p.category === category) &&
      `${p.name} ${p.category} ${p.tag} ${p.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === "low")
    shown = [...shown].sort(
      (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    );
  if (sort === "high")
    shown = [...shown].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  return (
    <>
      <PageIntro
        eyebrow="THE BRIGHT COPTER COLLECTION"
        title="Your home. Your kind of comfort."
        description="Explore Base model, Jumbohead model and Nanohead model ceiling fans. Choose your colour and warranty, then confirm your order on WhatsApp."
      />
      <section className="container catalog-layout">
        <aside className="catalog-sidebar">
          <h2>Our collections</h2>
          {categories.map(({ label, thumbnail }) => (
            <button
              key={label}
              className={cx(category === label && "active")}
              aria-pressed={category === label}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("category", label);
                setParams(next);
              }}
            >
              <CategoryThumbnail src={thumbnail} />
              <span>{label}</span>
              <ChevronRight size={14} />
            </button>
          ))}
          <div className="sidebar-help">
            <Headphones size={27} />
            <h3>A hand choosing?</h3>
            <p>Tell us about your space. We'll help you find a fit.</p>
            <Link to="/contact">
              Let's talk <ArrowUpRight size={14} />
            </Link>
          </div>
        </aside>
        <div className="catalog-main">
          <div className="catalog-toolbar">
            <label className="search-field">
              <Search size={17} />
              <input
                aria-label="Filter products"
                placeholder="Find your next favourite…"
                value={query}
                onChange={(e) => {
                  const next = new URLSearchParams(params);
                  next.set("q", e.target.value);
                  setParams(next, { replace: true });
                }}
              />
            </label>
            <label className="sort-field">
              <span className="sr-only">Sort products</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured first</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
          <div className="catalog-result">
            <span>
              {shown.length} {shown.length === 1 ? "model" : "models"}{" "}
              to explore
            </span>
            <Link to="/compare">
              <GitCompareArrows size={16} /> Compare fans
            </Link>
          </div>
          <div className="product-grid catalog-grid">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {!shown.length && (
            <div className="empty-state glass">
              <Search size={36} />
              <h2>No matches just yet.</h2>
              <p>Try another search or explore all fans.</p>
              <button className="button" onClick={() => setParams({})}>
                Show all products
              </button>
            </div>
          )}
          <p className="catalogue-note">
            Product photos, colours and warranty prices are supplied by Bright Copter. Availability, delivery and complete warranty terms are confirmed by our team before an order is accepted.
          </p>
        </div>
      </section>
      <SupportBanner />
    </>
  );
}

function WarrantyChoices({ product, onChange }: { product: Product; onChange: (product: Product) => void }) {
  return <fieldset className="warranty-picker" aria-label={`${product.name} warranty options`}>
    <legend>Choose your warranty</legend>
    <div>{productOptions(product).map(option => <button type="button" key={option.id}
      aria-label={`Choose ${option.warranty}-year warranty`} aria-pressed={option.id === product.id}
      onClick={() => onChange(option)}>
      <span><ShieldCheck size={15} /> {option.warranty} years</span><strong>{money(option.price!)}</strong>
    </button>)}</div>
  </fieldset>;
}

function WarrantyPrices() {
  return <div className="warranty-prices">{modelProducts.map(model => <section key={model.modelId}>
    <h3>{model.name}</h3>
    <p>{productOptions(model).map(option => `${option.warranty}-year warranty: ${money(option.price!)}`).join(" · ")}</p>
  </section>)}</div>;
}

function moveTabFocus(event: KeyboardEvent<HTMLDivElement>) {
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const current = tabs.indexOf(event.target as HTMLButtonElement);
  if (current < 0) return;
  const index = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
    : event.key === "ArrowRight" ? (current + 1) % tabs.length
    : event.key === "ArrowLeft" ? (current - 1 + tabs.length) % tabs.length : -1;
  if (index < 0) return;
  event.preventDefault();
  tabs[index].focus();
  tabs[index].click();
}

function Detail() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = products.find(
    (p) => p.id === location.pathname.split("/").pop(),
  );
  const requestedFinish = new URLSearchParams(location.search).get("finish");
  const { add, compare, toggleCompare, notify } = useStore();
  const [finish, setFinish] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("Overview");
  const [pin, setPin] = useState("");
  const [pinStatus, setPinStatus] = useState("");
  useEffect(() => {
    setFinish(
      requestedFinish && product?.colors.includes(requestedFinish)
        ? requestedFinish
        : product?.finish || "Black",
    );
    const requestedQuantity = Number(new URLSearchParams(location.search).get("quantity"));
    setQuantity(Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 20 ? requestedQuantity : 1);
    setTab("Overview");
    setPin("");
    setPinStatus("");
  }, [product?.id, requestedFinish]);
  if (!product) return <NotFound />;
  const selectedFinish = finish || product.finish;
  return (
    <>
      <div className="container breadcrumbs">
        <Link to="/products">Our products</Link>
        <ChevronRight size={13} />
        <span>{product.name}</span>
      </div>
      <section className="container detail-layout">
        <div className="detail-image glass">
          <span className="product-tag">{product.tag}</span>
          <ProductPhoto product={product} finish={selectedFinish} />
          <span className="visual-label">
            {product.name} · {selectedFinish}
          </span>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            <span />
            {product.category.toUpperCase()} / BRIGHT COPTER
          </p>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          {product.price ? (
            <div className="detail-price">
              {money(product.price)}
              <span>{product.warranty}-year warranty · delivery and final total confirmed by staff</span>
            </div>
          ) : (
            <div className="detail-price enquiry-price">
              Find your perfect fit
              <span>Ask our team about current models and pricing.</span>
            </div>
          )}
          <WarrantyChoices product={product} onChange={option => navigate(`/product/${option.id}?finish=${encodeURIComponent(selectedFinish)}&quantity=${quantity}`)} />
          {product.warranty && (
            <div className="warranty-chip">
              <ShieldCheck size={18} />
              {product.warranty}-year warranty option{" "}
              <Link to="/policies/warranty">
                View guidance <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
          {product.colors.length > 1 ? <fieldset className="finish-picker">
            <legend>
              Choose your finish <span>{selectedFinish}</span>
            </legend>
            <div>
              {product.colors.map((c) => (
                <button
                  key={c}
                  aria-label={`Choose ${c}`}
                  aria-pressed={selectedFinish === c}
                  className={cx(
                    "finish-option",
                    selectedFinish === c && "active",
                  )}
                  onClick={() => setFinish(c)}
                >
                  <span style={{ background: finishes[c] }} />
                  {c}
                  {selectedFinish === c && <Check size={13} />}
                </button>
              ))}
            </div>
          </fieldset> : <p className="fixed-finish">Finish: <strong>{selectedFinish}</strong></p>}
          {product.price && (
            <div className="purchase-row">
              <Quantity
                quantity={quantity}
                decrease={() => setQuantity(Math.max(1, quantity - 1))}
                increase={() => setQuantity(Math.min(20, quantity + 1))}
              />
              <button
                className="button"
                onClick={() => add(product, selectedFinish, quantity)}
              >
                <ShoppingBag size={18} /> Add to bag <ArrowUpRight size={17} />
              </button>
            </div>
          )}
          {!product.price && (
            <a
              className="button"
              href={whatsapp(
                `Hello Bright Copter, I am interested in ${product.name}. Please share current models, specifications and pricing.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> Enquire on WhatsApp{" "}
              <ArrowUpRight size={16} />
            </a>
          )}
          <form
            className="pin-check"
            onSubmit={(e) => {
              e.preventDefault();
              setPinStatus(
                /^\d{6}$/.test(pin)
                  ? `PIN ${pin} noted. Our team will confirm delivery availability, charges and timing before accepting your order.`
                  : "Enter a valid 6-digit Indian PIN code.",
              );
            }}
          >
            <label htmlFor="delivery-pin">
              <Truck size={17} /> Let's talk delivery
            </label>
            <div>
              <input
                id="delivery-pin"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Your delivery PIN code"
                required
              />
              <button type="submit">
                Check <ArrowRight size={14} />
              </button>
            </div>
            {pinStatus && <p role="status">{pinStatus}</p>}
          </form>
          <div className="detail-links">
            {product.kind === "fan" && (
              <button onClick={() => toggleCompare(product.id)}>
                <GitCompareArrows size={16} />
                {compare.includes(product.id)
                  ? "Added to comparison"
                  : "Add to comparison"}
              </button>
            )}
            <Link to="/support">
              <CircleHelp size={16} /> Ask a product question
            </Link>
          </div>
        </div>
      </section>
      <section className="container detail-tabs-section">
        <div
          className="detail-tabs"
          role="tablist"
          aria-label="Product information"
          onKeyDown={moveTabFocus}
        >
          {[
            "Overview",
            "Specifications",
            "Warranty",
            "Delivery & installation",
          ].map((t) => (
            <button
              key={t}
              id={`tab-${t.replace(/\W/g, "")}`}
              role="tab"
              aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1}
              aria-controls="product-panel"
              className={cx(tab === t && "active")}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div
          className="detail-tab-content glass"
          role="tabpanel"
          id="product-panel"
          aria-labelledby={`tab-${tab.replace(/\W/g, "")}`}
          tabIndex={0}
        >
          {tab === "Overview" ? (
            <>
              <h2>Make room for everyday comfort.</h2>
              <p>{product.description}</p>
              <p>
                {product.colors.length > 1 ? `Choose from ${product.colors.join(", ")}. ` : `This product has a ${product.finish} finish. `}Warranty options: {productOptions(product).map(option => `${option.warranty} years`).join(", ")}. Our team can confirm specifications, availability and delivery for your location.
              </p>
            </>
          ) : tab === "Specifications" ? (
            <>
              <h2>The details make the difference.</h2>
              <div className="spec-list">
                <p>
                  <span>Category</span>
                  <b>{product.category}</b>
                </p>
                <p>
                  <span>Selected finish</span>
                  <b>{selectedFinish}</b>
                </p>
                <p><span>Selected warranty</span><b>{product.warranty} years</b></p>
                <p>
                  <span>Exact model, dimensions & ratings</span>
                  <b>Confirm with our team</b>
                </p>
                <p>
                  <span>Available features</span>
                  <b>Model-dependent; request a specification sheet</b>
                </p>
              </div>
            </>
          ) : tab === "Warranty" ? (
            <>
              <h2>A little more reassurance.</h2>
              <p>
                {product.warranty
                  ? `This collection represents the business's ${product.warranty}-year warranty option.`
                  : "Warranty details depend on the selected model."}{" "}
                Confirm the exact model, covered parts, service arrangements and
                exclusions before ordering.
              </p>
              <Link to="/support?tab=warranty" className="text-button">
                Explore warranty guidance <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <h2>A clear plan for getting it home.</h2>
              <p>
                Delivery areas, charges, installation availability and timing
                are confirmed by Bright Copter for your location. Share your PIN
                code and requirements before your order is accepted.
              </p>
              <p>
                Installation is a separate service where offered. Do not assume
                it is included in the displayed product price.
              </p>
              <a
                className="text-button"
                href={whatsapp(
                  `Hello Bright Copter, please help with delivery and installation for ${product.name}.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Ask about your location <ArrowUpRight size={15} />
              </a>
            </>
          )}
        </div>
      </section>
      {modelProducts.some(p => p.modelId !== product.modelId) && <section className="section container">
        <SectionTitle
          eyebrow="KEEP EXPLORING"
          title="There’s more to feel at home with."
        />
        <div className="product-grid">
          {modelProducts
            .filter((p) => p.modelId !== product.modelId)
            .slice(0, 3)
            .map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
        </div>
      </section>}
    </>
  );
}

function Quantity({
  quantity,
  decrease,
  increase,
}: {
  quantity: number;
  decrease: () => void;
  increase: () => void;
}) {
  return (
    <div className="quantity-control">
      <button
        aria-label="Decrease quantity"
        onClick={decrease}
        disabled={quantity <= 1}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        aria-label="Increase quantity"
        onClick={increase}
        disabled={quantity >= 20}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function Compare() {
  const { compare, toggleCompare } = useStore();
  const selected = products.filter((p) => compare.includes(p.id));
  const fans = products.filter((p) => p.kind === "fan");
  return (
    <>
      <PageIntro
        eyebrow="A CLOSER LOOK"
        title="Find the one for you."
        description="Compare Base model, Jumbohead, Nanohead and their Wood versions, with warranty options and prices side by side."
      />
      <section className="container compare-section">
        <div className="compare-selection glass">
          <GitCompareArrows size={21} />
          <span>Choose up to three warranty options to compare</span>
          {fans.map((p) => (
            <button
              key={p.id}
              className={cx("chip", compare.includes(p.id) && "selected")}
              aria-pressed={compare.includes(p.id)}
              onClick={() => toggleCompare(p.id)}
            >
              {compare.includes(p.id) ? (
                <Check size={14} />
              ) : (
                <Plus size={14} />
              )}{" "}
              {p.name} · {p.warranty}-year warranty
            </button>
          ))}
        </div>
        {selected.length ? (
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">The little details</th>
                  {selected.map((p) => (
                    <th scope="col" key={p.id}>
                      <ProductPhoto product={p} finish={p.finish} />
                      <h2>{p.name} · {p.warranty} years</h2>
                      <Link to={`/product/${p.id}`} className="text-button">
                        Explore collection <ArrowUpRight size={14} />
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Indicative price",
                    value: (p: Product) => money(p.price!),
                  },
                  {
                    label: "Warranty option",
                    value: (p: Product) =>
                      `${p.warranty} years · terms to confirm`,
                  },

                  {
                    label: "Finishes to explore",
                    value: (p: Product) => p.colors.join(", "),
                  },
                  {
                    label: "Remote / light / timer / speeds",
                    value: () => "Confirm features for the actual model",
                  },
                  {
                    label: "Delivery & installation",
                    value: () => "Confirmed for your location by our team",
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {selected.map((p) => (
                      <td key={p.id}>{row.value(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state glass">
            <GitCompareArrows size={40} />
            <h2>A little perspective helps.</h2>
            <p>Select a collection above to start comparing.</p>
          </div>
        )}
        <p className="catalogue-note">
          These fan options use the supplied prices and photographs. Confirm complete warranty coverage, specifications and delivery with our team.
        </p>
      </section>
    </>
  );
}

function Cart() {
  const { cart, update, remove } = useStore();
  const total = cart.reduce(
    (s, i) =>
      s + (products.find((p) => p.id === i.id)?.price || 0) * i.quantity,
    0,
  );
  return (
    <>
      <PageIntro
        eyebrow="YOUR NEXT LITTLE UPGRADE"
        title="A bag full of comfort."
        description="Take a look at your selections. Our team will confirm the details before accepting your order."
      />
      <section className="container cart-layout">
        {cart.length ? (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const p = products.find((p) => p.id === item.id)!;
                return (
                  <article
                    className="cart-item glass"
                    key={item.id + item.finish}
                  >
                    <Link to={`/product/${p.id}?finish=${encodeURIComponent(item.finish)}`} className="cart-item-image">
                      <ProductPhoto product={p} finish={item.finish} />
                    </Link>
                    <div className="cart-item-copy">
                      <span className="product-kicker">CEILING FAN</span>
                      <h2>
                        <Link to={`/product/${p.id}`}>{p.name}</Link>
                      </h2>
                      <p>
                        {item.finish} · {p.warranty}-year warranty option
                      </p>
                      <Quantity
                        quantity={item.quantity}
                        decrease={() => update(item.id, item.finish, -1)}
                        increase={() => update(item.id, item.finish, 1)}
                      />
                    </div>
                    <div className="cart-item-price">
                      <strong>{money(p.price! * item.quantity)}</strong>
                      <button
                        className="text-button"
                        onClick={() => remove(item.id, item.finish)}
                        aria-label={`Remove ${p.name} in ${item.finish}, ${p.warranty}-year warranty`}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
              <Link to="/products" className="text-button">
                <ArrowLeft size={15} /> Keep exploring
              </Link>
            </div>
            <aside className="order-summary glass">
              <h2>Your selection, at a glance.</h2>
              <div>
                <span>
                  Products ({cart.reduce((s, i) => s + i.quantity, 0)})
                </span>
                <strong>{money(total)}</strong>
              </div>
              <div>
                <span>Delivery & taxes</span>
                <span>To be confirmed</span>
              </div>
              <div className="summary-total">
                <span>Indicative subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <p>
                Current model, stock, final price, delivery and warranty terms
                will be confirmed by our team.
              </p>
              <Link className="button" to="/checkout">
                Continue to checkout <ArrowRight size={17} />
              </Link>
              <span className="summary-reassurance">
                <MessageCircle size={15} /> Final details confirmed on WhatsApp.
              </span>
            </aside>
          </>
        ) : (
          <div className="empty-state glass full-width">
            <ShoppingBag size={44} />
            <h2>A little space for something good.</h2>
            <p>Your bag is empty. Let's find your next everyday favourite.</p>
            <Link className="button" to="/products">
              Explore our products <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

function saveRequest(request: PreparedRequest) {
  const existing = getRequests();
  return writeStorage("bc-requests", [request, ...existing].slice(0, 30));
}
function DownloadRequest({ request }: { request: PreparedRequest }) {
  return (
    <button
      className="button button-outline"
      onClick={() => {
        const blob = new Blob([request.message], {
          type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${request.reference}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download size={16} /> Save a copy
    </button>
  );
}

function Checkout() {
  const { cart, clear } = useStore();
  const navigate = useNavigate();
  const guard = useFormGuard("order");
  const [step, setStep] = useState(1);
  const previousStep = useRef(step);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    city: "",
    state: "Kerala",
    pin: "",
    note: "",
  });
  const [payment, setPayment] = useState("Discuss with staff");
  const total = cart.reduce(
    (sum, item) =>
      sum +
      (products.find((p) => p.id === item.id)?.price || 0) * item.quantity,
    0,
  );
  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [name]: e.target.value }),
  });
  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      document
        .getElementById("checkout-heading")
        ?.focus({ preventScroll: true });
      document.getElementById("checkout-heading")?.scrollIntoView({
        block: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [step]);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    guard.setError("");
    if (!guard.check(e.currentTarget)) return;
    let details;
    try { details = validateOrder(form); }
    catch (error) { guard.setError(error instanceof Error ? error.message : "Please check your delivery details."); return; }
    setForm(details);
    if (step === 1) { setStep(2); return; }
    if (!guard.check(e.currentTarget, true)) return;
    try {
    const ref = createReference("ORD");
    const message = `Hello Bright Copter! I would like to place an order.\n\nORDER REQUEST: ${ref}\n\nCUSTOMER DETAILS\nName: ${details.name.trim()}\nPhone: ${details.phone.trim()}${details.email ? `\nEmail: ${details.email.trim()}` : ""}\n\nMY SELECTION\n${cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id)!;
        return `• ${product.name} — ${item.finish}\n  ${product.warranty}-year warranty option × ${item.quantity}\n  Unit price: ${money(product.price!)}\n  Indicative line total: ${money(product.price! * item.quantity)}`;
      })
      .join(
        "\n",
      )}\n\nIndicative product subtotal: ${money(total)}\n(Taxes, delivery, stock and actual model to be confirmed.)\n\nDELIVERY ADDRESS\n${details.address.trim()}${details.landmark ? `\nLandmark: ${details.landmark.trim()}` : ""}\n${details.city.trim()}, ${details.state.trim()} — ${details.pin}\n\nPAYMENT PREFERENCE\n${payment}\nI understand your staff will confirm the available payment method and payment instructions on WhatsApp. No payment has been made through the website.${details.note ? `\n\nADDITIONAL NOTES\n${details.note.trim()}` : ""}\n\nPlease confirm the actual model, finish, warranty terms, availability, final total and delivery arrangements. Thank you!`;
    const request: PreparedRequest = {
      reference: ref,
      type: "order",
      name: details.name.trim(),
      message,
      date: new Date().toISOString(),
      total,
    };
    const saved = saveRequest(request);
    // A blocked app handoff still leaves the saved request and fallback link.
    try { window.open(orderWhatsapp(message), "_blank", "noopener,noreferrer"); } catch { /* Confirmation provides the handoff link. */ }
    clear();
    navigate("/order/confirmation", {
      state: { reference: ref, request, saved, whatsappOpened: true },
    });
    } catch {
      guard.release();
      guard.setError("We could not prepare your order. Please try again or contact customer care.");
    }
  }
  if (!cart.length)
    return (
      <>
        <PageIntro
          eyebrow="LET’S GET STARTED"
          title="First, find your favourite."
          description="Add a fan to your bag before starting WhatsApp checkout."
        />
        <div className="container empty-state glass">
          <ShoppingBag size={40} />
          <Link className="button" to="/products">
            Explore products <ArrowRight size={16} />
          </Link>
        </div>
      </>
    );
  return (
    <>
      <PageIntro
        eyebrow="ONE STEP CLOSER"
        title="Let’s make it yours."
        description="Add your address, choose a payment preference and review. Then continue to our order team on WhatsApp."
      />
      <section className="container checkout-layout">
        <form className="checkout-form glass" onSubmit={submit}>
          {guard.fields}
          <ol className="checkout-progress" aria-label="Order progress">
            <li className={cx(step === 1 && "active", step > 1 && "complete")} aria-current={step === 1 ? "step" : undefined}>
              <span>{step > 1 ? <Check size={14} /> : "01"}</span><div>Details<small>Address & payment</small></div>
            </li>
            <li className={cx(step === 2 && "active")} aria-current={step === 2 ? "step" : undefined}>
              <span>02</span><div>Review<small>Check your selection</small></div>
            </li>
            <li><span><MessageCircle size={16} /></span><div>WhatsApp<small>Confirm with our team</small></div></li>
          </ol>
          <div className="checkout-stage" key={step}>
            {step === 1 ? (
              <>
                <h2 id="checkout-heading" tabIndex={-1}>
                  Your delivery details
                </h2>
                <p className="form-description">
                  Your details stay here until you choose to share the order on
                  WhatsApp.
                </p>
                <div className="form-grid">
                  <Field label="Full name" required>
                    <input
                      autoComplete="name"
                      required
                      {...field("name")}
                      maxLength={100}
                    />
                  </Field>
                  <Field label="Mobile number" required>
                    <input
                      type="tel"
                      autoComplete="tel"
                      required
                      pattern="[+0-9 ()-]{10,18}"
                      title="Enter a mobile number with at least 10 digits"
                      {...field("phone")}
                    />
                  </Field>
                  <Field label="Email (optional)" className="span-two">
                    <input
                      type="email"
                      autoComplete="email"
                      {...field("email")}
                    />
                  </Field>
                  <Field
                    label="House / building, street and locality"
                    required
                    className="span-two"
                  >
                    <textarea
                      autoComplete="street-address"
                      required
                      rows={3}
                      {...field("address")}
                      maxLength={400}
                    />
                  </Field>
                  <Field label="Landmark (optional)" className="span-two">
                    <input {...field("landmark")} maxLength={150} />
                  </Field>
                  <Field label="Town / city" required>
                    <input
                      autoComplete="address-level2"
                      required
                      {...field("city")}
                    />
                  </Field>
                  <Field label="State" required>
                    <input
                      autoComplete="address-level1"
                      required
                      {...field("state")}
                    />
                  </Field>
                  <Field label="PIN code" required>
                    <input
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      title="Enter a 6-digit Indian PIN code"
                      required
                      {...field("pin")}
                    />
                  </Field>
                  <Field
                    label="Anything we should know? (optional)"
                    className="span-two"
                  >
                    <textarea
                      placeholder="Delivery questions, installation requirements…"
                      rows={3}
                      {...field("note")}
                      maxLength={500}
                    />
                  </Field>
                </div>
                <fieldset className="payment-options">
                  <legend>Your preferred way to pay</legend>
                  <p>
                    This is a preference, not a payment. Our staff will confirm
                    the final method and instructions on WhatsApp.
                  </p>
                  <div className="payment-grid">
                    {[
                      "UPI",
                      "Bank transfer",
                      "Pay on delivery",
                      "Discuss with staff",
                    ].map((option) => (
                      <label className="payment-choice" key={option}>
                        <input
                          type="radio"
                          name="payment"
                          value={option}
                          checked={payment === option}
                          onChange={() => setPayment(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button className="button" type="submit">
                  Review your order <ArrowRight size={17} />
                </button>
              </>
            ) : (
              <>
                <h2 id="checkout-heading" tabIndex={-1}>
                  Everything look right?
                </h2>
                <p className="form-description">
                  Check the details. We'll open a ready-to-send message to the
                  Bright Copter order team.
                </p>
                <div className="review-card">
                  <h3>
                    Delivery & contact{" "}
                    <button type="button" onClick={() => setStep(1)}>
                      Edit details
                    </button>
                  </h3>
                  <p>
                    {form.name} · {form.phone}
                  </p>
                  {form.email && <p>{form.email}</p>}
                  <p>
                    {form.address}
                    {form.landmark ? `, near ${form.landmark}` : ""}
                  </p>
                  <p>
                    {form.city}, {form.state} — {form.pin}
                  </p>
                  {form.note && <p>Note: {form.note}</p>}
                </div>
                <div className="review-card">
                  <h3>
                    Payment preference{" "}
                    <button type="button" onClick={() => setStep(1)}>
                      Change
                    </button>
                  </h3>
                  <p>{payment}</p>
                  <p>
                    Final payment mode and instructions are confirmed by staff.
                  </p>
                </div>
                <div className="notice">
                  <MessageCircle size={19} />
                  <p>
                    Your order details will open in WhatsApp for{" "}
                    <strong>{orderDisplay}</strong>. Tap Send there to share
                    your request. Staff will confirm availability, final total,
                    delivery and payment. No payment is collected here.
                  </p>
                </div>
                <button className="button" type="submit">
                  <MessageCircle size={18} /> Place order via WhatsApp{" "}
                  <ArrowUpRight size={17} />
                </button>
                <p className="form-description">
                  By continuing, you choose to share the details above with
                  Bright Copter through WhatsApp. Your request is accepted only
                  after staff confirms it.
                </p>
                <button
                  className="text-button back-button"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={14} />
                  Back to details
                </button>
              </>
            )}
          </div>
        </form>
        <aside className="order-summary glass">
          <h2>Your order summary</h2>
          <Link className="text-button summary-edit" to="/cart">Edit bag <ArrowUpRight size={14} /></Link>
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.id)!;
            return (
              <div className="checkout-item" key={item.id + item.finish}>
                <div>
                  <strong>
                    {product.name} × {item.quantity}
                  </strong>
                  <small>{item.finish} · {product.warranty}-year warranty</small>
                </div>
                <b>{money(product.price! * item.quantity)}</b>
              </div>
            );
          })}
          <div className="summary-total">
            <span>Indicative subtotal</span>
            <strong>{money(total)}</strong>
          </div>
          <p>
            Actual model, warranty terms, tax, stock and delivery charges are
            confirmed by our team.
          </p>
          <span className="summary-reassurance">
            <MessageCircle size={16} /> WhatsApp orders: {orderDisplay}
          </span>
          <div className="checkout-promise">
            <ShieldCheck size={17} />
            <span>
              No online payment. A real person confirms the next step.
            </span>
          </div>
        </aside>
      </section>
    </>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <label className={`field ${className}`} id={id}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
    </label>
  );
}

function Confirmation() {
  const location = useLocation();
  const [params] = useSearchParams();
  const ref = location.state?.reference || params.get("ref");
  const request: PreparedRequest | undefined =
    (isPreparedRequest(location.state?.request) ? location.state.request : undefined) || getRequests().find((r) => r.reference === ref);
  return (
    <section className="container confirmation-section">
      <div className="confirmation-card glass">
        <span className="confirmation-icon">
          <CheckCheck size={35} />
        </span>
        <p className="eyebrow">THE NEXT STEP IS A CONVERSATION</p>
        <h1>
          {request
            ? request.type === "order"
              ? "Finish your order on WhatsApp."
              : "Your request is ready."
            : "Let’s find your request."}
        </h1>
        {request ? (
          <>
            <p>
              Thanks, {request.name.split(" ")[0]}. Your details are ready.{" "}
              <strong>
                Tap Send in WhatsApp to share them with Bright Copter.
              </strong>
            </p>
            <div className="reference-box">
              <span>YOUR REQUEST REFERENCE</span>
              <strong>{request.reference}</strong>
              <small>
                {location.state?.saved === false
                  ? "Local saving unavailable · save a copy below"
                  : "Prepared on this device · no payment collected"}
              </small>
            </div>
            <p>
              If WhatsApp did not open, use the button below. Review the message
              and tap Send. Our team will confirm the final payment method,
              total and delivery arrangements.
            </p>
            <a
              className="button"
              href={
                request.type === "order"
                  ? orderWhatsapp(request.message)
                  : whatsapp(request.message)
              }
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> Open WhatsApp & send{" "}
              <ArrowUpRight size={17} />
            </a>
            <DownloadRequest request={request} />
            <details className="request-preview">
              <summary>Preview the message you'll share</summary>
              <pre>{request.message}</pre>
            </details>
            <Link to="/track" className="text-button">
              Find a saved request <ArrowRight size={15} />
            </Link>
          </>
        ) : (
          <>
            <p>
              Use your reference on the same device where you prepared the
              request, or contact our team for a confirmed order update.
            </p>
            <Link className="button" to="/track">
              Find your request <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

const faqItems = [
  {
    q: "How do I choose the right Ceiling fan?",
    a: "Consider your room, preferred finish and the features you need. Our team can help compare current models, specifications and warranty options. Exact features vary by model.",
  },
  {
    q: "What warranty options are available?",
    a: "Base model has 2-year and 3-year warranty choices. Jumbohead and Nanohead each have 3-year, 5-year and 7-year warranty choices. Their Wood versions are separate products with their own prices. Choose a product and warranty to see the price. Confirm covered parts, exclusions and service arrangements with Bright Copter before purchase.",
  },
  {
    q: "Can you deliver to my location?",
    a: "Share your delivery PIN code with our team. We will confirm current serviceability, delivery charges and estimated timing before accepting an order.",
  },
  {
    q: "Is installation included?",
    a: "Installation is not assumed to be included. Ask our team whether it is available for your location and what charges and arrangements apply.",
  },
  {
    q: "How do I place an order?",
    a: `Add your selection to the bag, enter your delivery address and choose a payment preference. Review the details and select Place order via WhatsApp. A ready-to-send order message opens for ${orderDisplay}. Tap Send in WhatsApp; our staff then confirms the actual product, total, delivery and final payment mode. No payment is collected on the website.`,
  },
  {
    q: "What if my product needs care or repair?",
    a: "Use the service request form with your product and purchase information. The team will assess the issue and applicable warranty terms, then confirm the next step and any charges before paid work.",
  },
];
function Faq({ count = faqItems.length }: { count?: number }) {
  return (
    <div className="faq-list">
      {faqItems.slice(0, count).map((f) => (
        <details key={f.q} className="faq-item">
          <summary>
            {f.q}
            <Plus size={18} />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function Support() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "help";
  return (
    <>
      <PageIntro
        eyebrow="CARE, WITHOUT THE COMPLICATION"
        title="We've got your everyday."
        description="A product question, a little troubleshooting or a service request — let's find the right next step."
      />
      <section className="container support-hub">
        <div className="support-tabs">
          {[
            { id: "help", label: "Help & FAQs", icon: CircleHelp },
            { id: "service", label: "Request service", icon: Wrench },
            { id: "warranty", label: "Warranty & care", icon: ShieldCheck },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={cx("category-tab", tab === id && "selected")}
              aria-pressed={tab === id}
              onClick={() => setParams({ tab: id })}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        {tab === "help" ? (
          <div className="support-content-grid">
            <div>
              <h2>Good questions. Clear answers.</h2>
              <Faq />
            </div>
            <aside className="help-card glass">
              <IconTile icon={Headphones} />
              <h2>Prefer a real conversation?</h2>
              <p>
                Tell our customer care team what you need. We'll point you in
                the right direction.
              </p>
              <a
                className="button"
                href={whatsapp(
                  "Hello Bright Copter, I need some product support.",
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} /> Chat on WhatsApp
              </a>
              <a className="text-button" href={`tel:+${careNumber}`}>
                <Phone size={16} /> {careDisplay}
              </a>
              <small>Contact us for current response and opening hours.</small>
            </aside>
          </div>
        ) : tab === "service" ? (
          <EnquiryForm kind="service" />
        ) : (
          <div className="support-content-grid">
            <div className="warranty-guidance glass">
              <IconTile icon={ShieldCheck} />
              <h2>Reassurance starts with clarity.</h2>
              <p>
                Base model offers 2-year and 3-year warranties. Jumbohead, Nanohead and their Wood versions offer 3-year, 5-year and 7-year warranties. Exact coverage and any extension conditions are confirmed at purchase.
              </p>
              <WarrantyPrices />
              <h3>Before you request support</h3>
              <ul>
                <li>
                  Have your product model and serial number ready, if available.
                </li>
                <li>
                  Find your purchase date and invoice or proof of purchase.
                </li>
                <li>Describe the issue and share your service location.</li>
              </ul>
              <p>
                Our team will assess eligibility. A warranty duration does not
                mean all parts and services are covered for that period.
              </p>
              <button
                className="button"
                onClick={() => setParams({ tab: "service" })}
              >
                Prepare a service request <ArrowRight size={17} />
              </button>
              <Link to="/policies/warranty" className="text-button">
                Warranty & returns guidance <ArrowUpRight size={14} />
              </Link>
            </div>
            <aside className="help-card glass">
              <IconTile icon={FileText} />
              <h2>Need a product manual?</h2>
              <p>
                Share your exact model with the team to request the right manual
                and product guidance.
              </p>
              <a
                href={whatsapp(
                  "Hello Bright Copter, I would like the manual for my product. My model is: ",
                )}
                className="button button-outline"
                target="_blank"
                rel="noreferrer"
              >
                Request the right manual <ArrowUpRight size={16} />
              </a>
              <p className="small-note">
                Product registration can be arranged with the team where
                applicable. Do not assume registration is required for warranty
                unless stated in your actual terms.
              </p>
            </aside>
          </div>
        )}
      </section>
      <section className="container business-strip">
        <span>
          <Package size={24} />
          <div>
            <h3>Looking for an order update?</h3>
            <p>
              Find a prepared request or talk to us about your confirmed order.
            </p>
          </div>
        </span>
        <Link className="text-button" to="/track">
          Order enquiries <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}

function EnquiryForm({ kind }: { kind: "service" | "dealer" }) {
  const navigate = useNavigate();
  const { notify } = useStore();
  const [type, setType] = useState(
    kind === "service" ? "Ceiling fan support" : "Bulk purchase",
  );
  const [consent, setConsent] = useState(false);
  const guard = useFormGuard(kind);
  const isService = kind === "service";
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    guard.setError("");
    if (!consent || !guard.check(e.currentTarget)) return;
    const form = new FormData(e.currentTarget);
    try {
      for (const [key, max] of Object.entries({name:100, phone:18, model:100, purchase:10, business:150, quantity:6, location:150, details:1500}))
        if (form.has(key)) form.set(key, plainText(String(form.get(key) || ""), max, key === "details"));
      form.set("phone", phoneNumber(form.get("phone")));
      if (!form.get("name") || !form.get("location") || !form.get("details")) throw new Error("Please complete your name, location and enquiry details.");
      if (form.get("quantity") && (!/^\d+$/.test(String(form.get("quantity"))) || Number(form.get("quantity")) < 1 || Number(form.get("quantity")) > 100000)) throw new Error("Please enter a quantity between 1 and 100,000.");
    } catch (error) { guard.setError(error instanceof Error ? error.message : "Please check your enquiry details."); return; }
    if (!guard.check(e.currentTarget, true)) return;
    try {
    const ref = createReference(isService ? "SVC" : "BIZ");
    const name = String(form.get("name"));
    const message = `Hello Bright Copter, I would like to make a ${isService ? "service" : "business"} enquiry.\nReference: ${ref}\nName: ${name}\nPhone: ${form.get("phone")}\nEnquiry: ${type}\n${isService ? `Product/model: ${form.get("model") || "Not known"}\nPurchase date: ${form.get("purchase") || "Not available"}` : `Business: ${form.get("business") || "Not specified"}\nApproximate quantity: ${form.get("quantity") || "To discuss"}`}\nLocation: ${form.get("location")}\nDetails: ${form.get("details")}\nPlease confirm the next step${isService ? ", service coverage, warranty eligibility and any applicable charges" : ", availability and quotation"}.`;
    const request: PreparedRequest = {
      reference: ref,
      type: kind,
      name,
      message,
      date: new Date().toISOString(),
    };
    const saved = saveRequest(request);
    navigate("/order/confirmation", {
      state: { reference: ref, request, saved },
    });
    } catch {
      guard.release();
      guard.setError("We could not prepare your enquiry. Please try again or call customer care.");
    }
  }
  return (
    <div className="enquiry-layout">
      <form onSubmit={submit} className="enquiry-form glass">
        {guard.fields}
        <h2>
          {isService
            ? "A little care starts here."
            : "Let’s build something bright."}
        </h2>
        <p className="form-description">
          {isService
            ? "Prepare your details, then share them with customer care on WhatsApp."
            : "Tell us what you have in mind. Prepare an enquiry to share with our team."}
        </p>
        <div className="form-grid">
          <Field
            label={isService ? "What can we help with?" : "I am interested in"}
            className="span-two"
          >
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {(isService
                ? [
                    "Ceiling fan support",
                    "Mixer / grinder support",
                    "Other appliance support",
                    "Local electrical service",
                  ]
                : [
                    "Bulk purchase",
                    "Dealership enquiry",
                    "Product and trade information",
                  ]
              ).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Full name" required>
            <input name="name" autoComplete="name" maxLength={100} required />
          </Field>
          <Field label="Mobile number" required>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              pattern="[+0-9 ()-]{10,18}"
              title="Enter a valid phone number"
              required
            />
          </Field>
          {isService ? (
            <>
              <Field label="Product model / serial (if known)">
                <input name="model" maxLength={100} />
              </Field>
              <Field label="Purchase date (if known)">
                <input
                  name="purchase"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Business name (optional)">
                <input name="business" maxLength={150} />
              </Field>
              <Field label="Approximate quantity (optional)">
                <input name="quantity" type="number" min="1" max="100000" />
              </Field>
            </>
          )}
          <Field label="Town / city and PIN code" required className="span-two">
            <input
              name="location"
              autoComplete="address-level2"
              maxLength={150}
              required
            />
          </Field>
          <Field
            label={
              isService
                ? "Tell us about the issue"
                : "Products, timing and anything else we should know"
            }
            required
            className="span-two"
          >
            <textarea name="details" rows={4} maxLength={1500} required />
          </Field>
        </div>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <span>
            I choose to share these details with Bright Copter on WhatsApp in
            the next step. Preparing this request does not send it or confirm{" "}
            {isService
              ? "a service appointment or warranty eligibility"
              : "an order or dealership approval"}
            .
          </span>
        </label>
        <button className="button" type="submit">
          Prepare {isService ? "service request" : "business enquiry"}{" "}
          <ArrowRight size={17} />
        </button>
      </form>
      <aside className="help-card glass">
        <IconTile icon={isService ? Wrench : Building2} />
        <h2>
          {isService
            ? "What happens next?"
            : "A conversation with possibility."}
        </h2>
        <ol className="process-list">
          <li>
            <span>01</span>
            <div>
              <strong>Share your request</strong>
              <p>Review the prepared message and send it on WhatsApp.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>
                {isService ? "We assess the details" : "We explore the fit"}
              </strong>
              <p>
                {isService
                  ? "Our team confirms coverage, eligibility and the right next step."
                  : "Our team discusses the range, quantity, availability and terms."}
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Agree the next step</strong>
              <p>
                {isService
                  ? "Any visit, work or charges are confirmed with you first."
                  : "Review a quotation before accepting any purchase."}
              </p>
            </div>
          </li>
        </ol>
        <a className="text-button" href={`tel:+${careNumber}`}>
          <Phone size={16} /> Prefer to call?
        </a>
      </aside>
    </div>
  );
}

function Business() {
  return (
    <>
      <PageIntro
        eyebrow="GROW WITH BRIGHT COPTER"
        title="Good connections. Bright possibilities."
        description="From a bulk order to a business partnership, let's explore what we can do together."
      />
      <section className="container">
        <EnquiryForm kind="dealer" />
      </section>
      <section className="container business-values">
        {[
          {
            icon: Fan,
            title: "A range to explore",
            text: "Base model, Jumbohead model and Nanohead model fans.",
          },
          {
            icon: MessageCircle,
            title: "A clear conversation",
            text: "Discuss quantity, availability, delivery and pricing.",
          },
          {
            icon: Heart,
            title: "A lasting connection",
            text: "A real team to help you plan the next step.",
          },
        ].map(({ icon, title, text }) => (
          <div className="glass" key={title}>
            <IconTile icon={icon} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </>
  );
}

function Track() {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<PreparedRequest | null>(null);
  const [searched, setSearched] = useState(false);
  function find(e: FormEvent) {
    e.preventDefault();
    setSearched(true);
    setResult(
      getRequests().find(
        (r) => r.reference.toUpperCase() === reference.trim().toUpperCase(),
      ) || null,
    );
  }
  return (
    <>
      <PageIntro
        eyebrow="KEEP THE CONVERSATION GOING"
        title="A little clarity on your request."
        description="Find a request prepared on this device, or contact our team for confirmed order and delivery updates."
      />
      <section className="container track-layout">
        <div className="glass track-card">
          <IconTile icon={Package} />
          <h2>Find your saved request.</h2>
          <p>
            Use the reference created on this device. Saved requests are not
            live order-tracking records.
          </p>
          <form onSubmit={find}>
            <Field label="Request reference" required>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="BC-ORD-XXXXXXXX"
                required
                autoCapitalize="characters"
              />
            </Field>
            <button className="button" type="submit">
              Find request <Search size={16} />
            </button>
          </form>
          {searched &&
            (result ? (
              <div className="track-result" role="status">
                <span className="status-pill">Prepared locally</span>
                <h3>{result.reference}</h3>
                <p>
                  Prepared {new Date(result.date).toLocaleDateString("en-IN")}.
                  We cannot determine whether this message has been sent or
                  accepted by Bright Copter.
                </p>
                <Link
                  className="text-button"
                  to={`/order/confirmation?ref=${encodeURIComponent(result.reference)}`}
                >
                  View prepared request <ArrowRight size={15} />
                </Link>
                <DownloadRequest request={result} />
              </div>
            ) : (
              <div className="notice" role="status">
                <CircleHelp size={19} />
                <p>
                  No matching request was found on this device. A different
                  browser or cleared storage will not have the saved copy.
                  Contact our team for help.
                </p>
              </div>
            ))}
        </div>
        <aside className="help-card glass">
          <IconTile icon={Headphones} />
          <h2>Already placed an order?</h2>
          <p>
            Our team can help with the status of an accepted order, payment or
            delivery. Share your actual order reference and contact details.
          </p>
          <a
            className="button"
            href={whatsapp(
              "Hello Bright Copter, I would like an update on my confirmed order. My reference is: ",
            )}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} /> Ask for an order update
          </a>
          <a className="text-button" href={`tel:+${careNumber}`}>
            <Phone size={16} /> {careDisplay}
          </a>
        </aside>
      </section>
    </>
  );
}

function About() {
  return (
    <>
      <PageIntro
        eyebrow="HELLO, WE’RE BRIGHT COPTER"
        title="Everyday comfort. Lasting connections."
        description="Ceiling fans and a little more care, from Parappur, Thrissur, Kerala."
      />
      <section className="container about-feature">
        <div className="about-art glass">
          <ProductPhoto hero finish="Brown" />
          <span>ROOTED IN KERALA. MADE FOR YOUR EVERYDAY.</span>
        </div>
        <div>
          <p className="eyebrow">
            <span />
            OUR STORY
          </p>
          <h2>
            A home is made
            <br />
            of little moments.
          </h2>
          <p>
            A quiet morning. A favourite meal. A room that feels just right. The
            appliances we live with become part of those everyday moments.
          </p>
          <p>
            Bright Copter offers Base model, Jumbohead model and Nanohead model fans,
            with product guidance and local support from
            Parappur in Thrissur.
          </p>
          <p>
            Our identity celebrates the connection between a lion and its cub —
            a reminder of the care, reassurance and lasting bond we want every
            customer relationship to reflect.
          </p>
          <blockquote>“Long lasting bonding like a father.”</blockquote>
          <Link className="button" to="/products">
            Find your everyday favourite <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="container business-values">
        {[
          {
            icon: Wind,
            title: "Comfort at the centre",
            text: "Explore ceiling fans that fit your everyday needs.",
          },
          {
            icon: Heart,
            title: "Care in the conversation",
            text: "Straightforward guidance from people who listen.",
          },
          {
            icon: MapPin,
            title: "A local connection",
            text: "Based in Parappur, Thrissur, with a real team to speak to.",
          },
        ].map(({ icon, title, text }) => (
          <div className="glass" key={title}>
            <IconTile icon={icon} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
      <SupportBanner />
    </>
  );
}

function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="A CONVERSATION STARTS HERE"
        title="Let’s connect."
        description="Choosing a product, checking delivery or looking for a little care? We'd love to help."
      />
      <section className="container contact-grid">
        <a
          className="contact-card glass"
          href={whatsapp("Hello Bright Copter! I would like some help.")}
          target="_blank"
          rel="noreferrer"
        >
          <IconTile icon={MessageCircle} />
          <h2>A message away.</h2>
          <p>
            Product questions, availability or help choosing. Start a
            conversation on WhatsApp.
          </p>
          <strong>
            {careDisplay} <ArrowUpRight size={17} />
          </strong>
        </a>
        <a className="contact-card glass" href={`tel:+${careNumber}`}>
          <IconTile icon={Phone} />
          <h2>Hear a friendly voice.</h2>
          <p>
            Prefer a phone call? Reach customer care for the right next step.
          </p>
          <strong>
            Call customer care <ArrowUpRight size={17} />
          </strong>
        </a>
        <a
          className="contact-card glass"
          href={mapLink}
          target="_blank"
          rel="noreferrer"
        >
          <IconTile icon={MapPin} />
          <h2>Find us in Kerala.</h2>
          <p>
            Parappur, Thrissur, Kerala, India. Contact us for current opening
            hours and visit arrangements.
          </p>
          <strong>
            Open Google Maps <ArrowUpRight size={17} />
          </strong>
        </a>
      </section>
      <section className="container contact-help glass">
        <div>
          <p className="eyebrow">
            <span />
            LET’S FIND THE RIGHT TEAM
          </p>
          <h2>A little direction helps.</h2>
          <p>
            For product faults, use a service request so the team has the
            details. For quantity purchases and partnerships, start a business
            enquiry.
          </p>
        </div>
        <div>
          <Link className="button" to="/support?tab=service">
            <Wrench size={17} /> Product support <ArrowUpRight size={16} />
          </Link>
          <Link className="button button-outline" to="/business">
            <Building2 size={17} /> Business enquiries{" "}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

function Policies() {
  const location = useLocation();
  const kind = location.pathname.split("/").pop();
  if (!["privacy", "warranty"].includes(kind || "")) return <NotFound />;
  const title =
    kind === "privacy"
      ? "Your information, with care."
      : kind === "warranty"
        ? "Clarity before commitment."
        : "A straightforward way to connect.";
  return (
    <>
      <PageIntro
        eyebrow="THE USEFUL DETAILS"
        title={title}
        description="Practical guidance for this catalogue and enquiry experience."
      />
      <article className="container policy-content glass">
        {kind === "privacy" ? (
          <>
            <h2>What happens to your information</h2>
            <p>
              Your bag and prepared requests are stored in this browser using
              local storage. Up to 30 prepared requests are kept; requests older than seven days are removed when saved requests are next accessed. They may remain in browser storage until then or until you clear them. Request details can include your name, contact
              information, delivery address and the message you enter.
            </p>
            <p>
              Preparing a request does not send that information to Bright Copter. Choosing the WhatsApp handoff transfers the prepared message to WhatsApp. Tapping Send there shares it with the business, subject to WhatsApp’s applicable terms and privacy practices.
            </p>
            <p>
              There is no payment collection or customer account on this
              website. Do not enter card numbers, bank credentials or sensitive
              documents in enquiry messages.
            </p>
            <h3>Website hosting</h3><p>The hosting provider may process routine request information, such as IP address, browser information and requested pages, for website delivery and security. This website does not submit your form details to an application backend.</p>
            <h3>Cookies and visitor analytics</h3>
            <p>No optional analytics, advertising pixels or tracking cookies are installed. Essential browser storage supports the bag, comparison choices and saved requests. Session storage is used for basic repeat-submission controls. No optional tracking starts without a separate consent-based integration.</p>
            <h3>Your local saved data</h3>
            <p>
              You can remove saved requests from this device using the action
              below. Clearing browser site data also removes saved requests and
              the shopping bag. Anyone with access to this browser may be able to read these locally saved details.
            </p>
            <ClearData />
          </>
        ) : kind === "warranty" ? (
          <>
            <h2>Confirm the details for your actual product</h2>
            <p>
              Bright Copter supplies Base model, Jumbohead model and Nanohead model. Jumbohead Wood and Nanohead Wood are separate products with their own warranty prices. Product photographs and these warranty prices are supplied by the business.
            </p>
            <p>
              Confirm the current model, features, finish, stock, full price
              including applicable taxes and delivery, warranty coverage and
              exclusions, returns eligibility, cancellation rules and service
              arrangements with Bright Copter before accepting a quotation or
              paying.
            </p>
            <WarrantyPrices />
            <h3>Delivery and installation</h3>
            <p>
              Serviceability, charges and timing depend on your location and are
              confirmed by the team. Installation is not presumed to be
              included.
            </p>
            <h3>Need service?</h3>
            <p>
              Share your model and purchase information. Warranty eligibility
              and any work or charges require assessment and confirmation.
            </p>
            <Link className="button" to="/support?tab=service">
              Prepare a service request <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <h2>A catalogue and a conversation</h2>
            <p>
              This website helps you explore product collections and prepare
              enquiries. A prepared request is not an accepted order, a paid
              transaction, a confirmed appointment or a dealership approval.
            </p>
            <p>
              No online payment is processed here. The business must confirm the
              actual product, commercial terms, delivery and payment
              arrangements directly with you.
            </p>
            <p>
              Product photographs and pricing are supplied by Bright Copter. Confirm specifications, warranty coverage and complete terms before making a purchasing decision.
            </p>
            <p>
              For confirmed orders, enquiries, changes or concerns, contact
              Bright Copter customer care directly.
            </p>
          </>
        )}
        <a
          href={whatsapp(
            "Hello Bright Copter, I have a question about product or order terms.",
          )}
          target="_blank"
          rel="noreferrer"
          className="text-button"
        >
          Ask our team <ArrowUpRight size={15} />
        </a>
      </article>
    </>
  );
}

function ClearData() {
  const { notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <div className="inline-actions">
      <button
        className="button"
        onClick={() => {
          try {
            localStorage.removeItem("bc-requests");
            notify("Saved requests have been removed from this device.");
            setConfirm(false);
          } catch {
            notify(
              "The browser could not clear saved requests. Use browser site settings.",
            );
          }
        }}
      >
        Confirm: remove saved requests
      </button>
      <button
        className="button button-outline"
        onClick={() => setConfirm(false)}
      >
        Keep them
      </button>
    </div>
  ) : (
    <button className="button button-outline" onClick={() => setConfirm(true)}>
      Remove saved requests from this device
    </button>
  );
}

function NotFound() {
  return (
    <section className="container empty-state glass not-found">
      <Wind size={44} />
      <p className="not-found-code" aria-label="Error 404">404</p>
      <p className="eyebrow">A LITTLE DETOUR</p>
      <h1>Let’s find your way home.</h1>
      <p>We couldn't find that page, but there's plenty more to explore.</p>
      <Link className="button" to="/">
        Back to Bright Copter <ArrowRight size={17} />
      </Link>
      <Link className="button button-outline" to="/products">Explore ceiling fans</Link>
    </section>
  );
}

function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return null;
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    return parseCart(readStorage<unknown>("bc-cart", []));
  });
  const [compare, setCompare] = useState<string[]>(() => {
    const raw = readStorage<unknown>("bc-compare", []);
    return Array.isArray(raw)
      ? raw
          .filter(
            (i): i is string =>
              typeof i === "string" &&
              products.some((p) => p.id === i && p.kind === "fan"),
          )
          .slice(0, 3)
      : [];
  });
  const [toast, setToast] = useState("");
  const location = useLocation();
  useEffect(() => {
    writeStorage("bc-cart", cart);
  }, [cart]);
  useEffect(() => {
    writeStorage("bc-compare", compare);
  }, [compare]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  const store: Store = {
    cart,
    compare,
    notify: setToast,
    add: (p, finish, quantity = 1) => {
      setCart((current) => {
        const match = current.find((i) => i.id === p.id && i.finish === finish);
        return match
          ? current.map((i) =>
              i === match
                ? { ...i, quantity: Math.min(20, i.quantity + quantity) }
                : i,
            )
          : [
              ...current,
              { id: p.id, finish, quantity: Math.min(20, quantity) },
            ];
      });
      setToast(`${p.name}, ${p.warranty}-year warranty, in ${finish.toLowerCase()} added to your bag.`);
    },
    update: (id, finish, delta) =>
      setCart((current) =>
        current.map((i) =>
          i.id === id && i.finish === finish
            ? { ...i, quantity: Math.max(1, Math.min(20, i.quantity + delta)) }
            : i,
        ),
      ),
    remove: (id, finish) =>
      setCart((current) =>
        current.filter((i) => !(i.id === id && i.finish === finish)),
      ),
    clear: () => setCart([]),
    toggleCompare: (id) =>
      setCompare((current) =>
        current.includes(id)
          ? current.filter((i) => i !== id)
          : current.length < 3
            ? [...current, id]
            : current,
      ),
  };
  return (
    <StoreContext.Provider value={store}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Metadata />
      <RouteEffects />
      <Header />
      <main id="main-content" className="route-content" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<Detail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/confirmation" element={<Confirmation />} />
          <Route path="/support" element={<Support />} />
          <Route path="/business" element={<Business />} />
          <Route path="/track" element={<Track />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/return-policy" element={<LegalPage path="/return-policy" />} />
          <Route path="/terms-and-conditions" element={<LegalPage path="/terms-and-conditions" />} />
          <Route path="/policies/terms" element={<Navigate to="/terms-and-conditions" replace />} />
          <Route path="/policies/returns" element={<Navigate to="/return-policy" replace />} />
          <Route path="/policies/:kind" element={<Policies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {compare.length > 0 && location.pathname !== "/compare" && (
        <Link className="compare-floating" to="/compare">
          <GitCompareArrows size={17} />
          Compare fans <span>{compare.length}</span>
          <ArrowRight size={15} />
        </Link>
      )}
      {toast && (
        <div className="toast glass" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <Link to="/cart">
            View bag <ArrowRight size={14} />
          </Link>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </StoreContext.Provider>
  );
}
