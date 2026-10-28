import { PageIntro } from "../components/PageIntro";
import { WarrantyPrices } from "../components/WarrantyChoices";
import { whatsapp } from "../data";
import { useStore } from "../store/StoreProvider";
import { NotFound } from "./NotFound";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Policies() {
  const location = useLocation();
  const kind = location.pathname.split("/").pop();
  if (!["privacy", "warranty"].includes(kind || "")) return <NotFound />;
  const title =
    kind === "privacy"
      ? "Your information, with care."
      : kind === "warranty"
        ? "Clarity before commitment."
        : "A straightforward way to connect.";
  return (
    <>
      <PageIntro
        eyebrow="THE USEFUL DETAILS"
        title={title}
        description="Practical guidance for this catalogue and enquiry experience."
      />
      <article className="container policy-content glass">
        {kind === "privacy" ? (
          <>
            <h2>What happens to your information</h2>
            <p>
              Your bag and prepared requests are stored in this browser using
              local storage. Up to 30 prepared requests are kept; requests older than seven days are removed when saved requests are next accessed. They may remain in browser storage until then or until you clear them. Request details can include your name, contact
              information, delivery address and the message you enter.
            </p>
            <p>
              Preparing a request does not send that information to Bright Copter. Choosing the WhatsApp handoff transfers the prepared message to WhatsApp. Tapping Send there shares it with the business, subject to WhatsApp’s applicable terms and privacy practices.
            </p>
            <p>
              There is no payment collection or customer account on this
              website. Do not enter card numbers, bank credentials or sensitive
              documents in enquiry messages.
            </p>
            <h3>Website hosting</h3><p>The hosting provider may process routine request information, such as IP address, browser information and requested pages, for website delivery and security. This website does not submit your form details to an application backend.</p>
            <h3>Cookies and visitor analytics</h3>
            <p>No optional analytics, advertising pixels or tracking cookies are installed. Essential browser storage supports the bag, comparison choices and saved requests. Session storage is used for basic repeat-submission controls. No optional tracking starts without a separate consent-based integration.</p>
            <h3>Your local saved data</h3>
            <p>
              You can remove saved requests from this device using the action
              below. Clearing browser site data also removes saved requests and
              the shopping bag. Anyone with access to this browser may be able to read these locally saved details.
            </p>
            <ClearData />
          </>
        ) : kind === "warranty" ? (
          <>
            <h2>Confirm the details for your actual product</h2>
            <p>
              Bright Copter supplies Base model, Jumbohead model and Nanohead model. Jumbohead Wood and Nanohead Wood are separate products with their own warranty prices. Product photographs and these warranty prices are supplied by the business.
            </p>
            <p>
              Confirm the current model, features, finish, stock, full price
              including applicable taxes and delivery, warranty coverage and
              exclusions, returns eligibility, cancellation rules and service
              arrangements with Bright Copter before accepting a quotation or
              paying.
            </p>
            <WarrantyPrices />
            <h3>Delivery and installation</h3>
            <p>
              Serviceability, charges and timing depend on your location and are
              confirmed by the team. Installation is not presumed to be
              included.
            </p>
            <h3>Need service?</h3>
            <p>
              Share your model and purchase information. Warranty eligibility
              and any work or charges require assessment and confirmation.
            </p>
            <Link className="button" to="/support?tab=service">
              Prepare a service request <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <h2>A catalogue and a conversation</h2>
            <p>
              This website helps you explore product collections and prepare
              enquiries. A prepared request is not an accepted order, a paid
              transaction, a confirmed appointment or a dealership approval.
            </p>
            <p>
              No online payment is processed here. The business must confirm the
              actual product, commercial terms, delivery and payment
              arrangements directly with you.
            </p>
            <p>
              Product photographs and pricing are supplied by Bright Copter. Confirm specifications, warranty coverage and complete terms before making a purchasing decision.
            </p>
            <p>
              For confirmed orders, enquiries, changes or concerns, contact
              Bright Copter customer care directly.
            </p>
          </>
        )}
        <a
          href={whatsapp(
            "Hello Bright Copter, I have a question about product or order terms.",
          )}
          target="_blank"
          rel="noreferrer"
          className="text-button"
        >
          Ask our team <ArrowUpRight size={15} />
        </a>
      </article>
    </>
  );
}

function ClearData() {
  const { notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <div className="inline-actions">
      <button
        className="button"
        onClick={() => {
          try {
            localStorage.removeItem("bc-requests");
            notify("Saved requests have been removed from this device.");
            setConfirm(false);
          } catch {
            notify(
              "The browser could not clear saved requests. Use browser site settings.",
            );
          }
        }}
      >
        Confirm: remove saved requests
      </button>
      <button
        className="button button-outline"
        onClick={() => setConfirm(false)}
      >
        Keep them
      </button>
    </div>
  ) : (
    <button className="button button-outline" onClick={() => setConfirm(true)}>
      Remove saved requests from this device
    </button>
  );
}
