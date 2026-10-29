import { careDisplay } from "../data";
import { ArrowUpRight, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

export function SupportBanner() {
  return (
    <section className="support-banner container">
      <div className="support-banner-icon">
        <Headphones size={42} strokeWidth={1.3} />
        <span className="support-dot" />
      </div>
      <div>
        <p className="eyebrow">BRIGHT COPTER CUSTOMER CARE</p>
        <h2>Fan service across Kerala.</h2>
        <p className="support-local-line" lang="ml">സഹായം വേണോ? ഞങ്ങളോട് ചോദിക്കൂ.</p>
        <p>
          Call {careDisplay} for warranty questions or prepare a service request with your model and purchase details.
        </p>
      </div>
      <Link className="button button-white" to="/support?tab=service">
        Request fan service <ArrowUpRight size={18} />
      </Link>
      <div className="support-decoration" aria-hidden="true" />
    </section>
  );
}
