import { products } from "../data";
import type { Product } from "../data";

export default function ProductPhoto({ product = products[0], finish, hero = false }: {
  product?: Product;
  finish: string;
  hero?: boolean;
}) {
  return <img
    className={`product-visual product-photo${hero ? " hero-fan" : ""}`}
    src={product.images[finish] || product.images[product.finish]}
    alt={`Bright Copter ${product.name} ceiling fan in ${finish}`}
    loading={hero ? "eager" : "lazy"}
    decoding="async"
  />;
}
