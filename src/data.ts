import black from "./assets/products/base/black.png";
import white from "./assets/products/base/white.png";
import brown from "./assets/products/base/brown.png";
import ivory from "./assets/products/base/ivory.png";

import jumboBlack from "./assets/products/jumbohead/black.png";
import jumboWhite from "./assets/products/jumbohead/white.png";
import jumboBrown from "./assets/products/jumbohead/brown.png";
import jumboWood from "./assets/products/jumbohead/wood.png";

import nanoBlack from "./assets/products/nanohead/black.png";
import nanoSilver from "./assets/products/nanohead/silver.png";
import nanoWhite from "./assets/products/nanohead/white.png";
import nanoBrown from "./assets/products/nanohead/brown.png";
import nanoWood from "./assets/products/nanohead/wood.png";

export type Product = {
  id: string;
  modelId: string;
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
  modelId: "base-model",
  name: "Base model",
  category: "Base model" as const,
  finish: "Black",
  colors: ["Black", "White", "Brown", "Ivory"],
  images: { Black: black, White: white, Brown: brown, Ivory: ivory },
  description: "The Bright Copter Base model ceiling fan, available in Black, White, Brown and Ivory. Choose a 2-year or 3-year warranty to suit your home.",
  tag: "Ceiling fan",
  kind: "fan" as const,
};

const jumbohead = {
  modelId: "jumbohead-model",
  name: "Jumbohead model",
  category: "Jumbohead model" as const,
  finish: "Black",
  colors: ["Black", "White", "Brown"],
  images: { Black: jumboBlack, White: jumboWhite, Brown: jumboBrown },
  description: "The Bright Copter Jumbohead model ceiling fan, available in Black, White and Brown. Choose a 3-year, 5-year or 7-year warranty option.",
  tag: "Ceiling fan",
  kind: "fan" as const,
};
const jumboheadWood = {
  modelId: "jumbohead-wood-model",
  name: "Jumbohead Wood model",
  category: "Jumbohead model" as const,
  finish: "Wood",
  colors: ["Wood"],
  images: { Wood: jumboWood },
  description: "The Bright Copter Jumbohead Wood model ceiling fan in a Wood finish. Choose a 3-year, 5-year or 7-year warranty option.",
  tag: "Wood finish",
  kind: "fan" as const,
};

const nanohead = {
  modelId: "nanohead-model",
  name: "Nanohead model",
  category: "Nanohead model" as const,
  finish: "Black",
  colors: ["Black", "Silver", "White", "Brown"],
  images: { Black: nanoBlack, Silver: nanoSilver, White: nanoWhite, Brown: nanoBrown },
  description: "The Bright Copter Nanohead model ceiling fan, available in Black, Silver, White and Brown. Choose a 3-year, 5-year or 7-year warranty option.",
  tag: "Ceiling fan",
  kind: "fan" as const,
};
const nanoheadWood = {
  modelId: "nanohead-wood-model",
  name: "Nanohead Wood model",
  category: "Nanohead model" as const,
  finish: "Wood",
  colors: ["Wood"],
  images: { Wood: nanoWood },
  description: "The Bright Copter Nanohead Wood model ceiling fan in a Wood finish. Choose a 3-year, 5-year or 7-year warranty option.",
  tag: "Wood finish",
  kind: "fan" as const,
};

// Each warranty has a stable variant ID so different warranties remain separate
// bag lines and the chosen price is used throughout checkout and WhatsApp.
export const products: Product[] = [
  { ...base, id: "base-model-2-year", warranty: 2, price: 2350 },
  { ...base, id: "base-model-3-year", warranty: 3, price: 2550 },
  { ...jumbohead, id: "jumbohead-model-3-year", warranty: 3, price: 3550 },
  { ...jumbohead, id: "jumbohead-model-5-year", warranty: 5, price: 3750 },
  { ...jumbohead, id: "jumbohead-model-7-year", warranty: 7, price: 4300 },
  { ...jumboheadWood, id: "jumbohead-wood-model-3-year", warranty: 3, price: 3950 },
  { ...jumboheadWood, id: "jumbohead-wood-model-5-year", warranty: 5, price: 4150 },
  { ...jumboheadWood, id: "jumbohead-wood-model-7-year", warranty: 7, price: 4700 },
  { ...nanohead, id: "nanohead-model-3-year", warranty: 3, price: 3350 },
  { ...nanohead, id: "nanohead-model-5-year", warranty: 5, price: 3650 },
  { ...nanohead, id: "nanohead-model-7-year", warranty: 7, price: 4000 },
  { ...nanoheadWood, id: "nanohead-wood-model-3-year", warranty: 3, price: 3750 },
  { ...nanoheadWood, id: "nanohead-wood-model-5-year", warranty: 5, price: 4050 },
  { ...nanoheadWood, id: "nanohead-wood-model-7-year", warranty: 7, price: 4400 },
];
export const modelProducts = products.filter(
  (product, index) => products.findIndex(p => p.modelId === product.modelId) === index,
);
export const productOptions = (product: Product) =>
  products.filter(p => p.modelId === product.modelId);

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
  Silver: "#b2b6bb",
  Brown: "#80451f",
  Ivory: "#e7dec2",
  Wood: "#ab642c",
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
    return value && value.length <= 1_000_000 ? (JSON.parse(value) as T) : fallback;
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
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  return `BC-${prefix}-${Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function isPreparedRequest(value: unknown): value is PreparedRequest {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<PreparedRequest>;
  return typeof r.reference === "string" && /^BC-(ORD|SVC|BIZ|REG)-[A-Z0-9-]{6,40}$/.test(r.reference)
    && typeof r.name === "string" && r.name.length <= 100
    && typeof r.message === "string" && r.message.length <= 50_000
    && typeof r.date === "string" && Number.isFinite(Date.parse(r.date))
    && Date.parse(r.date) > Date.now() - 7 * 24 * 60 * 60 * 1000 && Date.parse(r.date) <= Date.now() + 300_000
    && typeof r.type === "string" && ["order", "service", "dealer", "registration"].includes(r.type);
}
export function getRequests(): PreparedRequest[] {
  const stored = readStorage<unknown>("bc-requests", []);
  if (!Array.isArray(stored)) return [];
  const valid = stored.filter(isPreparedRequest).slice(0, 30);
  if (valid.length !== stored.length) writeStorage("bc-requests", valid);
  return valid;
}
export function parseCart(stored: unknown): CartItem[] {
  if (!Array.isArray(stored)) return [];
  const valid = new Map<string, CartItem>();
  for (const item of stored.slice(0, 200)) {
    if (!item || typeof item !== "object" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) continue;
    if (!products.some(p => p.id === item.id && p.price && p.colors.includes(item.finish))) continue;
    const key = `${item.id}:${item.finish}`;
    const previous = valid.get(key);
    valid.set(key, {id: item.id, finish: item.finish, quantity: Math.min(20, (previous?.quantity || 0) + item.quantity)});
  }
  return [...valid.values()];
}
