import { PageIntro } from "../components/PageIntro";
import ProductPhoto from "../components/ProductPhoto";
import { Quantity } from "../components/Quantity";
import { money, products } from "../data";
import { useStore } from "../store/StoreProvider";
import { ArrowLeft, ArrowRight, ArrowUpRight, MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export function Cart() {
  const { cart, update, remove } = useStore();
  const total = cart.reduce(
    (s, i) =>
      s + (products.find((p) => p.id === i.id)?.price || 0) * i.quantity,
    0,
  );
  return (
    <>
      <PageIntro
        eyebrow="YOUR NEXT LITTLE UPGRADE"
        title="A bag full of comfort."
        description="Take a look at your selections. Our team will confirm the details before accepting your order."
      />
      <section className="container cart-layout">
        {cart.length ? (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const p = products.find((p) => p.id === item.id)!;
                return (
                  <article
                    className="cart-item glass"
                    key={item.id + item.finish}
                  >
                    <Link to={`/product/${p.id}?finish=${encodeURIComponent(item.finish)}`} className="cart-item-image">
                      <ProductPhoto product={p} finish={item.finish} />
                    </Link>
                    <div className="cart-item-copy">
                      <span className="product-kicker">CEILING FAN</span>
                      <h2>
                        <Link to={`/product/${p.id}`}>{p.name}</Link>
                      </h2>
                      <p>
                        {item.finish} · {p.warranty}-year warranty option
                      </p>
                      <Quantity
                        quantity={item.quantity}
                        decrease={() => update(item.id, item.finish, -1)}
                        increase={() => update(item.id, item.finish, 1)}
                      />
                    </div>
                    <div className="cart-item-price">
                      <strong>{money(p.price! * item.quantity)}</strong>
                      <button
                        className="text-button"
                        onClick={() => remove(item.id, item.finish)}
                        aria-label={`Remove ${p.name} in ${item.finish}, ${p.warranty}-year warranty`}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
              <Link to="/products" className="text-button">
                <ArrowLeft size={15} /> Keep exploring
              </Link>
            </div>
            <aside className="order-summary glass">
              <h2>Your selection, at a glance.</h2>
              <div>
                <span>
                  Products ({cart.reduce((s, i) => s + i.quantity, 0)})
                </span>
                <strong>{money(total)}</strong>
              </div>
              <div>
                <span>Delivery & taxes</span>
                <span>To be confirmed</span>
              </div>
              <div className="summary-total">
                <span>Indicative subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <p>
                Current model, stock, final price, delivery and warranty terms
                will be confirmed by our team.
              </p>
              <Link className="button" to="/checkout">
                Continue to checkout <ArrowRight size={17} />
              </Link>
              <span className="summary-reassurance">
                <MessageCircle size={15} /> Final details confirmed on WhatsApp.
              </span>
            </aside>
          </>
        ) : (
          <div className="empty-state glass full-width">
            <ShoppingBag size={44} />
            <h2>A little space for something good.</h2>
            <p>Your bag is empty. Let's find your next everyday favourite.</p>
            <Link className="button" to="/products">
              Explore our products <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
