import { products } from "./data";
import type { Product } from "./data";

const widths = [400, 640, 960, 1280];

// Only the deployed site has /.netlify/images. Plain `vite` dev and the
// portable preview (which inlines images as data: URLs) use the original file.
const cdn = (src: string, w: number) =>
  `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&fm=webp&q=75`;
const canOptimise = (src: string) => import.meta.env.PROD && src.startsWith("/");

export default function ProductPhoto({ product = products[0], finish, hero = false, sizes }: {
  product?: Product;
  finish: string;
  hero?: boolean;
  sizes?: string;
}) {
  const src = product.images[finish] || product.images[product.finish];
  const optimised = canOptimise(src);
  return <img
    className={`product-visual product-photo${hero ? " hero-fan" : ""}`}
    src={optimised ? cdn(src, 960) : src}
    srcSet={optimised ? widths.map(w => `${cdn(src, w)} ${w}w`).join(", ") : undefined}
    sizes={sizes ?? (hero
      ? "(max-width: 640px) 100vw, 50vw"
      : "(max-width: 640px) 90vw, (max-width: 1200px) 45vw, 30vw")}
    width={1448}
    height={1086}
    alt={`Bright Copter ${product.name} ceiling fan in ${finish}`}
    loading={hero ? "eager" : "lazy"}
    fetchPriority={hero ? "high" : undefined}
    decoding="async"
  />;
}
