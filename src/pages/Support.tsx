import { EnquiryForm } from "../components/EnquiryForm";
import { Faq } from "../components/Faq";
import { IconTile } from "../components/IconTile";
import { PageIntro } from "../components/PageIntro";
import { WarrantyPrices } from "../components/WarrantyChoices";
import { careDisplay, careNumber, whatsapp } from "../data";
import { cx } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, CircleHelp, FileText, Headphones, MessageCircle, Package, Phone, ShieldCheck, Wrench } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export function Support() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "help";
  return (
    <>
      <PageIntro
        eyebrow="BRIGHT COPTER CUSTOMER CARE"
        title="Fan service. Across Kerala."
        localLine="സഹായം വേണോ? ഞങ്ങളോട് ചോദിക്കൂ."
        description="Ask about your fan, check warranty coverage or prepare a service request. Share your model, purchase details and location so our team can guide you."
      />
      <section className="container support-hub">
        <div className="support-tabs">
          {[
            { id: "help", label: "Help & FAQs", icon: CircleHelp },
            { id: "service", label: "Request service", icon: Wrench },
            { id: "warranty", label: "Warranty & care", icon: ShieldCheck },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={cx("category-tab", tab === id && "selected")}
              aria-pressed={tab === id}
              onClick={() => setParams({ tab: id })}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        {tab === "help" ? (
          <div className="support-content-grid">
            <div>
              <h2>Good questions. Clear answers.</h2>
              <Faq />
            </div>
            <aside className="help-card glass">
              <IconTile icon={Headphones} />
              <h2>Prefer a real conversation?</h2>
              <p>
                Tell our customer care team what you need. We'll point you in
                the right direction.
              </p>
              <a
                className="button"
                href={whatsapp(
                  "Hello Bright Copter, I need some product support.",
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} /> Chat on WhatsApp
              </a>
              <a className="text-button" href={`tel:+${careNumber}`}>
                <Phone size={16} /> {careDisplay}
              </a>
              <small>Contact us for current response and opening hours.</small>
            </aside>
          </div>
        ) : tab === "service" ? (
          <EnquiryForm kind="service" />
        ) : (
          <div className="support-content-grid">
            <div className="warranty-guidance glass">
              <IconTile icon={ShieldCheck} />
              <h2>Reassurance starts with clarity.</h2>
              <p>
                Base model offers 2-year and 3-year warranties. Jumbohead, Nanohead and their Wood versions offer 3-year, 5-year and 7-year warranties. Exact coverage and any extension conditions are confirmed at purchase.
              </p>
              <WarrantyPrices />
              <h3>Before you request support</h3>
              <ul>
                <li>
                  Have your product model and serial number ready, if available.
                </li>
                <li>
                  Find your purchase date and invoice or proof of purchase.
                </li>
                <li>Describe the issue and share your service location.</li>
              </ul>
              <p>
                Our team will assess eligibility. A warranty duration does not
                mean all parts and services are covered for that period.
              </p>
              <button
                className="button"
                onClick={() => setParams({ tab: "service" })}
              >
                Prepare a service request <ArrowRight size={17} />
              </button>
              <Link to="/policies/warranty" className="text-button">
                Warranty & returns guidance <ArrowUpRight size={14} />
              </Link>
            </div>
            <aside className="help-card glass">
              <IconTile icon={FileText} />
              <h2>Need a product manual?</h2>
              <p>
                Share your exact model with the team to request the right manual
                and product guidance.
              </p>
              <a
                href={whatsapp(
                  "Hello Bright Copter, I would like the manual for my product. My model is: ",
                )}
                className="button button-outline"
                target="_blank"
                rel="noreferrer"
              >
                Request the right manual <ArrowUpRight size={16} />
              </a>
              <p className="small-note">
                Product registration can be arranged with the team where
                applicable. Do not assume registration is required for warranty
                unless stated in your actual terms.
              </p>
            </aside>
          </div>
        )}
      </section>
      <section className="container business-strip">
        <span>
          <Package size={24} />
          <div>
            <h3>Looking for an order update?</h3>
            <p>
              Find a prepared request or talk to us about your confirmed order.
            </p>
          </div>
        </span>
        <Link className="text-button" to="/track">
          Order enquiries <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}
