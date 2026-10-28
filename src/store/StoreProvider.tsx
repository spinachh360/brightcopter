import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GitCompareArrows, X } from 'lucide-react';
import { parseCart, products, readStorage, writeStorage } from '../data';
import type { CartItem, Product } from '../data';

type Store = {
  cart: CartItem[];
  add: (p: Product, finish: string, quantity?: number) => void;
  update: (id: string, finish: string, delta: number) => void;
  remove: (id: string, finish: string) => void;
  clear: () => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  notify: (message: string) => void;
};

const StoreContext = createContext<Store>(null!);

export const useStore = () => useContext(StoreContext);

export function StoreProvider({children}: {children: ReactNode}) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    return parseCart(readStorage<unknown>("bc-cart", []));
  });
  const [compare, setCompare] = useState<string[]>(() => {
    const raw = readStorage<unknown>("bc-compare", []);
    return Array.isArray(raw)
      ? raw
          .filter(
            (i): i is string =>
              typeof i === "string" &&
              products.some((p) => p.id === i && p.kind === "fan"),
          )
          .slice(0, 3)
      : [];
  });
  const [toast, setToast] = useState("");
  const location = useLocation();
  useEffect(() => {
    writeStorage("bc-cart", cart);
  }, [cart]);
  useEffect(() => {
    writeStorage("bc-compare", compare);
  }, [compare]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  const store: Store = {
    cart,
    compare,
    notify: setToast,
    add: (p, finish, quantity = 1) => {
      setCart((current) => {
        const match = current.find((i) => i.id === p.id && i.finish === finish);
        return match
          ? current.map((i) =>
              i === match
                ? { ...i, quantity: Math.min(20, i.quantity + quantity) }
                : i,
            )
          : [
              ...current,
              { id: p.id, finish, quantity: Math.min(20, quantity) },
            ];
      });
      setToast(`${p.name}, ${p.warranty}-year warranty, in ${finish.toLowerCase()} added to your bag.`);
    },
    update: (id, finish, delta) =>
      setCart((current) =>
        current.map((i) =>
          i.id === id && i.finish === finish
            ? { ...i, quantity: Math.max(1, Math.min(20, i.quantity + delta)) }
            : i,
        ),
      ),
    remove: (id, finish) =>
      setCart((current) =>
        current.filter((i) => !(i.id === id && i.finish === finish)),
      ),
    clear: () => setCart([]),
    toggleCompare: (id) =>
      setCompare((current) =>
        current.includes(id)
          ? current.filter((i) => i !== id)
          : current.length < 3
            ? [...current, id]
            : current,
      ),
  };
  return <StoreContext.Provider value={store}>
    {children}
      {compare.length > 0 && location.pathname !== "/compare" && (
        <Link className="compare-floating" to="/compare">
          <GitCompareArrows size={17} />
          Compare fans <span>{compare.length}</span>
          <ArrowRight size={15} />
        </Link>
      )}
      {toast && (
        <div className="toast glass" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <Link to="/cart">
            View bag <ArrowRight size={14} />
          </Link>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
  </StoreContext.Provider>;
}
