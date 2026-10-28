import { categories } from "../categories";
import { CategoryThumbnail } from "../components/CategoryThumbnail";
import { IconTile } from "../components/IconTile";
import { ProductCard } from "../components/ProductCard";
import ProductPhoto from "../components/ProductPhoto";
import { SectionTitle } from "../components/SectionTitle";
import { SupportBanner } from "../components/SupportBanner";
import { WarrantyServiceSection } from "../components/WarrantyServiceSection";
import { cataloguePriceRange, finishes, modelProducts, money } from "../data";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { cx } from "@/lib/utils";
import { ArrowUpRight, Building2, Check, Fan, GitCompareArrows, MapPin, MessageCircle, Search, ShieldCheck, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Home() {
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
      <WarrantyServiceSection />
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
