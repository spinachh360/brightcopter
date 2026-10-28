import { finishes, money, products } from "../data";
import type { Product } from "../data";
import { useStore } from "../store/StoreProvider";
import ProductPhoto from "./ProductPhoto";
import { WarrantyChoices } from "./WarrantyChoices";
import { cx } from "@/lib/utils";
import { ArrowUpRight, GitCompareArrows, Package, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function ProductCard({ product: initialProduct }: { product: Product }) {
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
