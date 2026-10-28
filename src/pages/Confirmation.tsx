import { DownloadRequest } from "../components/DownloadRequest";
import { getRequests, isPreparedRequest, orderWhatsapp, whatsapp } from "../data";
import type { PreparedRequest } from "../data";
import { ArrowRight, ArrowUpRight, CheckCheck, MessageCircle } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

export function Confirmation() {
  const location = useLocation();
  const [params] = useSearchParams();
  const ref = location.state?.reference || params.get("ref");
  const request: PreparedRequest | undefined =
    (isPreparedRequest(location.state?.request) ? location.state.request : undefined) || getRequests().find((r) => r.reference === ref);
  return (
    <section className="container confirmation-section">
      <div className="confirmation-card glass">
        <span className="confirmation-icon">
          <CheckCheck size={35} />
        </span>
        <p className="eyebrow">THE NEXT STEP IS A CONVERSATION</p>
        <h1>
          {request
            ? request.type === "order"
              ? "Finish your order on WhatsApp."
              : "Your request is ready."
            : "Let’s find your request."}
        </h1>
        {request ? (
          <>
            <p>
              Thanks, {request.name.split(" ")[0]}. Your details are ready.{" "}
              <strong>
                Tap Send in WhatsApp to share them with Bright Copter.
              </strong>
            </p>
            <div className="reference-box">
              <span>YOUR REQUEST REFERENCE</span>
              <strong>{request.reference}</strong>
              <small>
                {location.state?.saved === false
                  ? "Local saving unavailable · save a copy below"
                  : "Prepared on this device · no payment collected"}
              </small>
            </div>
            <p>
              If WhatsApp did not open, use the button below. Review the message
              and tap Send. Our team will confirm the final payment method,
              total and delivery arrangements.
            </p>
            <a
              className="button"
              href={
                request.type === "order"
                  ? orderWhatsapp(request.message)
                  : whatsapp(request.message)
              }
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> Open WhatsApp & send{" "}
              <ArrowUpRight size={17} />
            </a>
            <DownloadRequest request={request} />
            <details className="request-preview">
              <summary>Preview the message you'll share</summary>
              <pre>{request.message}</pre>
            </details>
            <Link to="/track" className="text-button">
              Find a saved request <ArrowRight size={15} />
            </Link>
          </>
        ) : (
          <>
            <p>
              Use your reference on the same device where you prepared the
              request, or contact our team for a confirmed order update.
            </p>
            <Link className="button" to="/track">
              Find your request <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
