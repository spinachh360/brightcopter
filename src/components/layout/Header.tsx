import { useStore } from "../../store/StoreProvider";
import { Brand } from "../Brand";
import { LiquidNavbar } from "@/components/ui/liquid-glass-navbar";
import type { LiquidNavItem } from "@/components/ui/liquid-glass-navbar";
import { ArrowRight, ArrowUpRight, Fan, Headphones, Heart, House, MapPin, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const primaryNavigation: LiquidNavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <House size={17} aria-hidden="true" />,
    fx: "glow",
  },
  {
    label: "Our products",
    shortLabel: "Products",
    href: "/products",
    icon: <Fan size={17} aria-hidden="true" />,
    fx: "spin",
  },
  {
    label: "Our story",
    shortLabel: "Story",
    href: "/about",
    icon: <Heart size={17} aria-hidden="true" />,
    fx: "pop",
  },
  {
    label: "Support",
    href: "/support",
    icon: <Headphones size={17} aria-hidden="true" />,
    fx: "wave",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: <MapPin size={17} aria-hidden="true" />,
    fx: "drop",
  },
];

function navigationSection(pathname: string) {
  if (pathname === "/") return 0;
  if (
    [
      "/products",
      "/product/",
      "/compare",
      "/cart",
      "/checkout",
      "/order/",
    ].some((path) => pathname.startsWith(path))
  )
    return 1;
  if (pathname === "/about") return 2;
  if (
    ["/support", "/track", "/policies/"].some((path) =>
      pathname.startsWith(path),
    )
  )
    return 3;
  if (["/contact", "/business"].includes(pathname)) return 4;
  return -1;
}

export function Header() {
  const { cart } = useStore();
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setSearch(false);
  }, [location.pathname, location.search]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      <div className="announcement">
        <span>Ceiling fan service across Kerala.</span>
        <Link to="/support">
          Request service <ArrowUpRight size={12} />
        </Link>
      </div>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && search) {
            setSearch(false);
            (
              event.currentTarget.querySelector(
                ".search-toggle",
              ) as HTMLButtonElement | null
            )?.focus();
          }
        }}
      >
        <div className="nav-shell">
          <Brand />
          <LiquidNavbar
            className="main-nav liquid-main-nav"
            ariaLabel="Main navigation"
            items={primaryNavigation}
            active={navigationSection(location.pathname)}
            tone="light"
            compact={false}
            sound={false}
            renderLink={({ href, ...props }) => (
              <Link {...props} to={href || "/"} />
            )}
          />
          <div className="nav-actions">
            <button
              className="icon-button search-toggle"
              aria-label={search ? "Close search" : "Search products"}
              onClick={() => setSearch(!search)}
              aria-expanded={search}
            >
              <Search size={20} />
            </button>
            <Link
              className="icon-button bag-button"
              to="/cart"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={20} />
              {count > 0 && <span className="bag-count">{count}</span>}
            </Link>
            <Link className="button button-small nav-shop" to="/products">
              Explore products <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        {search && (
          <form
            className="search-panel container"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/products?q=${encodeURIComponent(query)}`);
            }}
          >
            <Search size={20} />
            <input
              autoFocus
              aria-label="Search product catalogue"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Base model, Jumbohead, Nanohead…"
            />
            <button className="button button-small">
              Search <ArrowRight size={16} />
            </button>
          </form>
        )}
      </header>
    </>
  );
}
