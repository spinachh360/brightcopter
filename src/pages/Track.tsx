import { DownloadRequest } from "../components/DownloadRequest";
import { Field } from "../components/Field";
import { IconTile } from "../components/IconTile";
import { PageIntro } from "../components/PageIntro";
import { careDisplay, careNumber, getRequests, whatsapp } from "../data";
import type { PreparedRequest } from "../data";
import { ArrowRight, CircleHelp, Headphones, MessageCircle, Package, Phone, Search } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

export function Track() {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<PreparedRequest | null>(null);
  const [searched, setSearched] = useState(false);
  function find(e: FormEvent) {
    e.preventDefault();
    setSearched(true);
    setResult(
      getRequests().find(
        (r) => r.reference.toUpperCase() === reference.trim().toUpperCase(),
      ) || null,
    );
  }
  return (
    <>
      <PageIntro
        eyebrow="KEEP THE CONVERSATION GOING"
        title="A little clarity on your request."
        description="Find a request prepared on this device, or contact our team for confirmed order and delivery updates."
      />
      <section className="container track-layout">
        <div className="glass track-card">
          <IconTile icon={Package} />
          <h2>Find your saved request.</h2>
          <p>
            Use the reference created on this device. Saved requests are not
            live order-tracking records.
          </p>
          <form onSubmit={find}>
            <Field label="Request reference" required>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="BC-ORD-XXXXXXXX"
                required
                autoCapitalize="characters"
              />
            </Field>
            <button className="button" type="submit">
              Find request <Search size={16} />
            </button>
          </form>
          {searched &&
            (result ? (
              <div className="track-result" role="status">
                <span className="status-pill">Prepared locally</span>
                <h3>{result.reference}</h3>
                <p>
                  Prepared {new Date(result.date).toLocaleDateString("en-IN")}.
                  We cannot determine whether this message has been sent or
                  accepted by Bright Copter.
                </p>
                <Link
                  className="text-button"
                  to={`/order/confirmation?ref=${encodeURIComponent(result.reference)}`}
                >
                  View prepared request <ArrowRight size={15} />
                </Link>
                <DownloadRequest request={result} />
              </div>
            ) : (
              <div className="notice" role="status">
                <CircleHelp size={19} />
                <p>
                  No matching request was found on this device. A different
                  browser or cleared storage will not have the saved copy.
                  Contact our team for help.
                </p>
              </div>
            ))}
        </div>
        <aside className="help-card glass">
          <IconTile icon={Headphones} />
          <h2>Already placed an order?</h2>
          <p>
            Our team can help with the status of an accepted order, payment or
            delivery. Share your actual order reference and contact details.
          </p>
          <a
            className="button"
            href={whatsapp(
              "Hello Bright Copter, I would like an update on my confirmed order. My reference is: ",
            )}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} /> Ask for an order update
          </a>
          <a className="text-button" href={`tel:+${careNumber}`}>
            <Phone size={16} /> {careDisplay}
          </a>
        </aside>
      </section>
    </>
  );
}
