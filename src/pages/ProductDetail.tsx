import { ProductCard } from "../components/ProductCard";
import ProductPhoto from "../components/ProductPhoto";
import { Quantity } from "../components/Quantity";
import { SectionTitle } from "../components/SectionTitle";
import { WarrantyChoices } from "../components/WarrantyChoices";
import { finishes, modelProducts, money, productOptions, products, whatsapp } from "../data";
import { useStore } from "../store/StoreProvider";
import { NotFound } from "./NotFound";
import { cx } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp, GitCompareArrows, MessageCircle, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

export function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = products.find(
    (p) => p.id === location.pathname.split("/").pop(),
  );
  const requestedFinish = new URLSearchParams(location.search).get("finish");
  const { add, compare, toggleCompare } = useStore();
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
