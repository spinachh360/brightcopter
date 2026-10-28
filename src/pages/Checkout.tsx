import { validateOrder } from "../../shared/validation";
import { Field } from "../components/Field";
import { PageIntro } from "../components/PageIntro";
import { createReference, money, orderDisplay, orderWhatsapp, products, saveRequest } from "../data";
import type { PreparedRequest } from "../data";
import { useFormGuard } from "../hooks/useFormGuard";
import { useStore } from "../store/StoreProvider";
import { cx } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Checkout() {
  const { cart, clear } = useStore();
  const navigate = useNavigate();
  const guard = useFormGuard("order");
  const [step, setStep] = useState(1);
  const previousStep = useRef(step);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    city: "",
    state: "Kerala",
    pin: "",
    note: "",
  });
  const [payment, setPayment] = useState("Discuss with staff");
  const total = cart.reduce(
    (sum, item) =>
      sum +
      (products.find((p) => p.id === item.id)?.price || 0) * item.quantity,
    0,
  );
  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [name]: e.target.value }),
  });
  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      document
        .getElementById("checkout-heading")
        ?.focus({ preventScroll: true });
      document.getElementById("checkout-heading")?.scrollIntoView({
        block: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [step]);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    guard.setError("");
    if (!guard.check(e.currentTarget)) return;
    let details;
    try { details = validateOrder(form); }
    catch (error) { guard.setError(error instanceof Error ? error.message : "Please check your delivery details."); return; }
    setForm(details);
    if (step === 1) { setStep(2); return; }
    if (!guard.check(e.currentTarget, true)) return;
    try {
    const ref = createReference("ORD");
    const message = `Hello Bright Copter! I would like to place an order.\n\nORDER REQUEST: ${ref}\n\nCUSTOMER DETAILS\nName: ${details.name.trim()}\nPhone: ${details.phone.trim()}${details.email ? `\nEmail: ${details.email.trim()}` : ""}\n\nMY SELECTION\n${cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id)!;
        return `• ${product.name} — ${item.finish}\n  ${product.warranty}-year warranty option × ${item.quantity}\n  Unit price: ${money(product.price!)}\n  Indicative line total: ${money(product.price! * item.quantity)}`;
      })
      .join(
        "\n",
      )}\n\nIndicative product subtotal: ${money(total)}\n(Taxes, delivery, stock and actual model to be confirmed.)\n\nDELIVERY ADDRESS\n${details.address.trim()}${details.landmark ? `\nLandmark: ${details.landmark.trim()}` : ""}\n${details.city.trim()}, ${details.state.trim()} — ${details.pin}\n\nPAYMENT PREFERENCE\n${payment}\nI understand your staff will confirm the available payment method and payment instructions on WhatsApp. No payment has been made through the website.${details.note ? `\n\nADDITIONAL NOTES\n${details.note.trim()}` : ""}\n\nPlease confirm the actual model, finish, warranty terms, availability, final total and delivery arrangements. Thank you!`;
    const request: PreparedRequest = {
      reference: ref,
      type: "order",
      name: details.name.trim(),
      message,
      date: new Date().toISOString(),
      total,
    };
    const saved = saveRequest(request);
    // A blocked app handoff still leaves the saved request and fallback link.
    try { window.open(orderWhatsapp(message), "_blank", "noopener,noreferrer"); } catch { /* Confirmation provides the handoff link. */ }
    clear();
    navigate("/order/confirmation", {
      state: { reference: ref, request, saved, whatsappOpened: true },
    });
    } catch {
      guard.release();
      guard.setError("We could not prepare your order. Please try again or contact customer care.");
    }
  }
  if (!cart.length)
    return (
      <>
        <PageIntro
          eyebrow="LET’S GET STARTED"
          title="First, find your favourite."
          description="Add a fan to your bag before starting WhatsApp checkout."
        />
        <div className="container empty-state glass">
          <ShoppingBag size={40} />
          <Link className="button" to="/products">
            Explore products <ArrowRight size={16} />
          </Link>
        </div>
      </>
    );
  return (
    <>
      <PageIntro
        eyebrow="ONE STEP CLOSER"
        title="Let’s make it yours."
        description="Add your address, choose a payment preference and review. Then continue to our order team on WhatsApp."
      />
      <section className="container checkout-layout">
        <form className="checkout-form glass" onSubmit={submit}>
          {guard.fields}
          <ol className="checkout-progress" aria-label="Order progress">
            <li className={cx(step === 1 && "active", step > 1 && "complete")} aria-current={step === 1 ? "step" : undefined}>
              <span>{step > 1 ? <Check size={14} /> : "01"}</span><div>Details<small>Address & payment</small></div>
            </li>
            <li className={cx(step === 2 && "active")} aria-current={step === 2 ? "step" : undefined}>
              <span>02</span><div>Review<small>Check your selection</small></div>
            </li>
            <li><span><MessageCircle size={16} /></span><div>WhatsApp<small>Confirm with our team</small></div></li>
          </ol>
          <div className="checkout-stage" key={step}>
            {step === 1 ? (
              <>
                <h2 id="checkout-heading" tabIndex={-1}>
                  Your delivery details
                </h2>
                <p className="form-description">
                  Your details stay here until you choose to share the order on
                  WhatsApp.
                </p>
                <div className="form-grid">
                  <Field label="Full name" required>
                    <input
                      autoComplete="name"
                      required
                      {...field("name")}
                      maxLength={100}
                    />
                  </Field>
                  <Field label="Mobile number" required>
                    <input
                      type="tel"
                      autoComplete="tel"
                      required
                      pattern="[+0-9 ()-]{10,18}"
                      title="Enter a mobile number with at least 10 digits"
                      {...field("phone")}
                    />
                  </Field>
                  <Field label="Email (optional)" className="span-two">
                    <input
                      type="email"
                      autoComplete="email"
                      {...field("email")}
                    />
                  </Field>
                  <Field
                    label="House / building, street and locality"
                    required
                    className="span-two"
                  >
                    <textarea
                      autoComplete="street-address"
                      required
                      rows={3}
                      {...field("address")}
                      maxLength={400}
                    />
                  </Field>
                  <Field label="Landmark (optional)" className="span-two">
                    <input {...field("landmark")} maxLength={150} />
                  </Field>
                  <Field label="Town / city" required>
                    <input
                      autoComplete="address-level2"
                      required
                      {...field("city")}
                    />
                  </Field>
                  <Field label="State" required>
                    <input
                      autoComplete="address-level1"
                      required
                      {...field("state")}
                    />
                  </Field>
                  <Field label="PIN code" required>
                    <input
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      title="Enter a 6-digit Indian PIN code"
                      required
                      {...field("pin")}
                    />
                  </Field>
                  <Field
                    label="Anything we should know? (optional)"
                    className="span-two"
                  >
                    <textarea
                      placeholder="Delivery questions, installation requirements…"
                      rows={3}
                      {...field("note")}
                      maxLength={500}
                    />
                  </Field>
                </div>
                <fieldset className="payment-options">
                  <legend>Your preferred way to pay</legend>
                  <p>
                    This is a preference, not a payment. Our staff will confirm
                    the final method and instructions on WhatsApp.
                  </p>
                  <div className="payment-grid">
                    {[
                      "UPI",
                      "Bank transfer",
                      "Pay on delivery",
                      "Discuss with staff",
                    ].map((option) => (
                      <label className="payment-choice" key={option}>
                        <input
                          type="radio"
                          name="payment"
                          value={option}
                          checked={payment === option}
                          onChange={() => setPayment(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button className="button" type="submit">
                  Review your order <ArrowRight size={17} />
                </button>
              </>
            ) : (
              <>
                <h2 id="checkout-heading" tabIndex={-1}>
                  Everything look right?
                </h2>
                <p className="form-description">
                  Check the details. We'll open a ready-to-send message to the
                  Bright Copter order team.
                </p>
                <div className="review-card">
                  <h3>
                    Delivery & contact{" "}
                    <button type="button" onClick={() => setStep(1)}>
                      Edit details
                    </button>
                  </h3>
                  <p>
                    {form.name} · {form.phone}
                  </p>
                  {form.email && <p>{form.email}</p>}
                  <p>
                    {form.address}
                    {form.landmark ? `, near ${form.landmark}` : ""}
                  </p>
                  <p>
                    {form.city}, {form.state} — {form.pin}
                  </p>
                  {form.note && <p>Note: {form.note}</p>}
                </div>
                <div className="review-card">
                  <h3>
                    Payment preference{" "}
                    <button type="button" onClick={() => setStep(1)}>
                      Change
                    </button>
                  </h3>
                  <p>{payment}</p>
                  <p>
                    Final payment mode and instructions are confirmed by staff.
                  </p>
                </div>
                <div className="notice">
                  <MessageCircle size={19} />
                  <p>
                    Your order details will open in WhatsApp for{" "}
                    <strong>{orderDisplay}</strong>. Tap Send there to share
                    your request. Staff will confirm availability, final total,
                    delivery and payment. No payment is collected here.
                  </p>
                </div>
                <button className="button" type="submit">
                  <MessageCircle size={18} /> Place order via WhatsApp{" "}
                  <ArrowUpRight size={17} />
                </button>
                <p className="form-description">
                  By continuing, you choose to share the details above with
                  Bright Copter through WhatsApp. Your request is accepted only
                  after staff confirms it.
                </p>
                <button
                  className="text-button back-button"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={14} />
                  Back to details
                </button>
              </>
            )}
          </div>
        </form>
        <aside className="order-summary glass">
          <h2>Your order summary</h2>
          <Link className="text-button summary-edit" to="/cart">Edit bag <ArrowUpRight size={14} /></Link>
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.id)!;
            return (
              <div className="checkout-item" key={item.id + item.finish}>
                <div>
                  <strong>
                    {product.name} × {item.quantity}
                  </strong>
                  <small>{item.finish} · {product.warranty}-year warranty</small>
                </div>
                <b>{money(product.price! * item.quantity)}</b>
              </div>
            );
          })}
          <div className="summary-total">
            <span>Indicative subtotal</span>
            <strong>{money(total)}</strong>
          </div>
          <p>
            Actual model, warranty terms, tax, stock and delivery charges are
            confirmed by our team.
          </p>
          <span className="summary-reassurance">
            <MessageCircle size={16} /> WhatsApp orders: {orderDisplay}
          </span>
          <div className="checkout-promise">
            <ShieldCheck size={17} />
            <span>
              No online payment. A real person confirms the next step.
            </span>
          </div>
        </aside>
      </section>
    </>
  );
}
