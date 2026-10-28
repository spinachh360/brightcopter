import { modelProducts, money, productOptions } from "../data";
import type { Product } from "../data";
import { ShieldCheck } from "lucide-react";

export function WarrantyChoices({ product, onChange }: { product: Product; onChange: (product: Product) => void }) {
  return <fieldset className="warranty-picker" aria-label={`${product.name} warranty options`}>
    <legend>Choose your warranty</legend>
    <div>{productOptions(product).map(option => <button type="button" key={option.id}
      aria-label={`Choose ${option.warranty}-year warranty`} aria-pressed={option.id === product.id}
      onClick={() => onChange(option)}>
      <span><ShieldCheck size={15} /> {option.warranty} years</span><strong>{money(option.price!)}</strong>
    </button>)}</div>
  </fieldset>;
}

export function WarrantyPrices() {
  return <div className="warranty-prices">{modelProducts.map(model => <section key={model.modelId}>
    <h3>{model.name}</h3>
    <p>{productOptions(model).map(option => `${option.warranty}-year warranty: ${money(option.price!)}`).join(" · ")}</p>
  </section>)}</div>;
}
