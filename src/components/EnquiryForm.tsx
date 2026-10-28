import { phoneNumber, plainText } from "../../shared/validation";
import { careNumber, createReference, saveRequest } from "../data";
import type { PreparedRequest } from "../data";
import { useFormGuard } from "../hooks/useFormGuard";
import { Field } from "./Field";
import { IconTile } from "./IconTile";
import { ArrowRight, Building2, Phone, Wrench } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function EnquiryForm({ kind }: { kind: "service" | "dealer" }) {
  const navigate = useNavigate();
  const [type, setType] = useState(
    kind === "service" ? "Ceiling fan support" : "Bulk purchase",
  );
  const [consent, setConsent] = useState(false);
  const guard = useFormGuard(kind);
  const isService = kind === "service";
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    guard.setError("");
    if (!consent || !guard.check(e.currentTarget)) return;
    const form = new FormData(e.currentTarget);
    try {
      for (const [key, max] of Object.entries({name:100, phone:18, model:100, purchase:10, business:150, quantity:6, location:150, details:1500}))
        if (form.has(key)) form.set(key, plainText(String(form.get(key) || ""), max, key === "details"));
      form.set("phone", phoneNumber(form.get("phone")));
      if (!form.get("name") || !form.get("location") || !form.get("details")) throw new Error("Please complete your name, location and enquiry details.");
      if (form.get("quantity") && (!/^\d+$/.test(String(form.get("quantity"))) || Number(form.get("quantity")) < 1 || Number(form.get("quantity")) > 100000)) throw new Error("Please enter a quantity between 1 and 100,000.");
    } catch (error) { guard.setError(error instanceof Error ? error.message : "Please check your enquiry details."); return; }
    if (!guard.check(e.currentTarget, true)) return;
    try {
    const ref = createReference(isService ? "SVC" : "BIZ");
    const name = String(form.get("name"));
    const message = `Hello Bright Copter, I would like to make a ${isService ? "service" : "business"} enquiry.\nReference: ${ref}\nName: ${name}\nPhone: ${form.get("phone")}\nEnquiry: ${type}\n${isService ? `Product/model: ${form.get("model") || "Not known"}\nPurchase date: ${form.get("purchase") || "Not available"}` : `Business: ${form.get("business") || "Not specified"}\nApproximate quantity: ${form.get("quantity") || "To discuss"}`}\nLocation: ${form.get("location")}\nDetails: ${form.get("details")}\nPlease confirm the next step${isService ? ", service coverage, warranty eligibility and any applicable charges" : ", availability and quotation"}.`;
    const request: PreparedRequest = {
      reference: ref,
      type: kind,
      name,
      message,
      date: new Date().toISOString(),
    };
    const saved = saveRequest(request);
    navigate("/order/confirmation", {
      state: { reference: ref, request, saved },
    });
    } catch {
      guard.release();
      guard.setError("We could not prepare your enquiry. Please try again or call customer care.");
    }
  }
  return (
    <div className="enquiry-layout">
      <form onSubmit={submit} className="enquiry-form glass">
        {guard.fields}
        <h2>
          {isService
            ? "A little care starts here."
            : "Let’s build something bright."}
        </h2>
        <p className="form-description">
          {isService
            ? "Prepare your details, then share them with customer care on WhatsApp."
            : "Tell us what you have in mind. Prepare an enquiry to share with our team."}
        </p>
        <div className="form-grid">
          <Field
            label={isService ? "What can we help with?" : "I am interested in"}
            className="span-two"
          >
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {(isService
                ? [
                    "Ceiling fan support",
                    "Mixer / grinder support",
                    "Other appliance support",
                    "Local electrical service",
                  ]
                : [
                    "Bulk purchase",
                    "Dealership enquiry",
                    "Product and trade information",
                  ]
              ).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Full name" required>
            <input name="name" autoComplete="name" maxLength={100} required />
          </Field>
          <Field label="Mobile number" required>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              pattern="[+0-9 ()-]{10,18}"
              title="Enter a valid phone number"
              required
            />
          </Field>
          {isService ? (
            <>
              <Field label="Product model / serial (if known)">
                <input name="model" maxLength={100} />
              </Field>
              <Field label="Purchase date (if known)">
                <input
                  name="purchase"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Business name (optional)">
                <input name="business" maxLength={150} />
              </Field>
              <Field label="Approximate quantity (optional)">
                <input name="quantity" type="number" min="1" max="100000" />
              </Field>
            </>
          )}
          <Field label="Town / city and PIN code" required className="span-two">
            <input
              name="location"
              autoComplete="address-level2"
              maxLength={150}
              required
            />
          </Field>
          <Field
            label={
              isService
                ? "Tell us about the issue"
                : "Products, timing and anything else we should know"
            }
            required
            className="span-two"
          >
            <textarea name="details" rows={4} maxLength={1500} required />
          </Field>
        </div>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <span>
            I choose to share these details with Bright Copter on WhatsApp in
            the next step. Preparing this request does not send it or confirm{" "}
            {isService
              ? "a service appointment or warranty eligibility"
              : "an order or dealership approval"}
            .
          </span>
        </label>
        <button className="button" type="submit">
          Prepare {isService ? "service request" : "business enquiry"}{" "}
          <ArrowRight size={17} />
        </button>
      </form>
      <aside className="help-card glass">
        <IconTile icon={isService ? Wrench : Building2} />
        <h2>
          {isService
            ? "What happens next?"
            : "A conversation with possibility."}
        </h2>
        <ol className="process-list">
          <li>
            <span>01</span>
            <div>
              <strong>Share your request</strong>
              <p>Review the prepared message and send it on WhatsApp.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>
                {isService ? "We assess the details" : "We explore the fit"}
              </strong>
              <p>
                {isService
                  ? "Our team confirms coverage, eligibility and the right next step."
                  : "Our team discusses the range, quantity, availability and terms."}
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Agree the next step</strong>
              <p>
                {isService
                  ? "Any visit, work or charges are confirmed with you first."
                  : "Review a quotation before accepting any purchase."}
              </p>
            </div>
          </li>
        </ol>
        <a className="text-button" href={`tel:+${careNumber}`}>
          <Phone size={16} /> Prefer to call?
        </a>
      </aside>
    </div>
  );
}
