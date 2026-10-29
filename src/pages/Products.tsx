import { categories } from "../categories";
import { CategoryIcon } from "../components/CategoryIcon";
import { PageIntro } from "../components/PageIntro";
import { ProductCard } from "../components/ProductCard";
import { SupportBanner } from "../components/SupportBanner";
import { modelProducts } from "../data";
import { cx } from "@/lib/utils";
import { ArrowUpRight, ChevronRight, GitCompareArrows, Headphones, Search } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export function Products() {
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
        <aside className="catalog-sidebar" aria-label="Product categories">
          <h2>Our collections</h2>
          {categories.map(({ label, icon }) => (
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
              <CategoryIcon src={icon} />
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
