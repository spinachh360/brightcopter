import black from "./assets/products/base/black.png";
import white from "./assets/products/base/white.png";
import brown from "./assets/products/base/brown.png";
import ivory from "./assets/products/base/ivory.png";

export type Product = {
  id: string;
  name: string;
  category: "Base model" | "Jumbohead model" | "Nanohead model";
  price?: number;
  warranty?: number;
  finish: string;
  colors: string[];
  images: Record<string, string>;
  description: string;
  tag: string;
  kind: "fan" | "mixer" | "heater" | "light";
};

const base = {
  name: "Base model",
  category: "Base model" as const,
  finish: "Black",
  colors: ["Black", "White", "Brown", "Ivory"],
  images: { Black: black, White: white, Brown: brown, Ivory: ivory },
  description: "The Bright Copter Base model ceiling fan, available in Black, White, Brown and Ivory. Choose a 2-year or 3-year warranty to suit your home.",
  tag: "Ceiling fan",
  kind: "fan" as const,
};

// Each warranty has a stable variant ID so different warranties remain separate
// bag lines and the chosen price is used throughout checkout and WhatsApp.
export const products: Product[] = [
  { ...base, id: "base-model-2-year", warranty: 2, price: 2350 },
  { ...base, id: "base-model-3-year", warranty: 3, price: 2550 },
];
export const modelProducts = products.filter(
  (product, index) => products.findIndex(p => p.category === product.category) === index,
);
export const productOptions = (product: Product) =>
  products.filter(p => p.category === product.category);

export const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
export const careNumber =
  import.meta.env.VITE_CUSTOMER_CARE_WHATSAPP || "919400885633";
export const orderNumber =
  import.meta.env.VITE_ORDER_WHATSAPP || "917907344474";
export const whatsapp = (message: string) =>
  `https://wa.me/${careNumber}?text=${encodeURIComponent(message)}`;
export const orderWhatsapp = (message: string) =>
  `https://wa.me/${orderNumber}?text=${encodeURIComponent(message)}`;
export const mapLink = "https://maps.app.goo.gl/gfDbwVmzi4jWBNxz8";
export const finishes: Record<string, string> = {
  Black: "#242424",
  White: "#f2f2f2",
  Brown: "#80451f",
  Ivory: "#e7dec2",
};
export type CartItem = { id: string; finish: string; quantity: number };
export type PreparedRequest = {
  reference: string;
  type: "order" | "service" | "dealer" | "registration";
  name: string;
  message: string;
  date: string;
  total?: number;
};

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function createReference(prefix: string) {
  return `BC-${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function getRequests(): PreparedRequest[] {
  const stored = readStorage<unknown>("bc-requests", []);
  if (!Array.isArray(stored)) return [];
  return stored.filter(
    (r): r is PreparedRequest =>
      !!r &&
      typeof r === "object" &&
      typeof r.reference === "string" &&
      typeof r.name === "string" &&
      typeof r.message === "string" &&
      typeof r.date === "string" &&
      ["order", "service", "dealer", "registration"].includes(r.type),
  );
}
