export type Product = {
  id: string;
  name: string;
  category: "Fans" | "Kitchen" | "Water heating" | "Lighting";
  price?: number;
  warranty?: number;
  finish: string;
  colors: string[];
  description: string;
  tag: string;
  kind: "fan" | "mixer" | "heater" | "light";
};

export const products: Product[] = [
  {
    id: "bldc-essential",
    name: "BLDC Essential",
    category: "Fans",
    price: 3350,
    warranty: 3,
    finish: "Pearl white",
    colors: ["Pearl white", "Earth brown", "Silver"],
    description:
      "Everyday comfort, with the simplicity of remote control. Explore our three-year warranty option.",
    tag: "Everyday favourite",
    kind: "fan",
  },
  {
    id: "bldc-plus",
    name: "BLDC Plus",
    category: "Fans",
    price: 3650,
    warranty: 5,
    finish: "Earth brown",
    colors: ["Earth brown", "Pearl white", "Silver"],
    description:
      "A considered addition to your favourite space. Explore our five-year warranty option.",
    tag: "A little more reassurance",
    kind: "fan",
  },
  {
    id: "bldc-signature",
    name: "BLDC Signature",
    category: "Fans",
    price: 4000,
    warranty: 7,
    finish: "Silver",
    colors: ["Silver", "Earth brown", "Pearl white"],
    description:
      "Comfort for the long run. Explore our seven-year warranty option and available finishes.",
    tag: "Extended warranty option",
    kind: "fan",
  },
  {
    id: "kitchen-mixer",
    name: "Kitchen essentials",
    category: "Kitchen",
    finish: "Classic white",
    colors: ["Classic white"],
    description:
      "Discover mixers and grinders for the moments that bring everyone to the table. Ask our team about available models.",
    tag: "Mixers & grinders",
    kind: "mixer",
  },
  {
    id: "water-heating",
    name: "A warmer everyday",
    category: "Water heating",
    finish: "Classic white",
    colors: ["Classic white"],
    description:
      "Find a water heater for your home. Our team can help you explore current models, capacities, and prices.",
    tag: "Water heaters",
    kind: "heater",
  },
  {
    id: "home-lighting",
    name: "Light up your space",
    category: "Lighting",
    finish: "Classic white",
    colors: ["Classic white"],
    description:
      "Explore LED tube lights and lighting accessories. Get in touch for the current range and specifications.",
    tag: "LED lighting",
    kind: "light",
  },
];

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
  "Pearl white": "#eeeae1",
  "Earth brown": "#695145",
  Silver: "#afb7ba",
  "Classic white": "#eeeae1",
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
