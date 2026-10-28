import { orderDisplay } from "../data";
import { Plus } from "lucide-react";

const faqItems = [
  {
    q: "How do I choose the right Ceiling fan?",
    a: "Consider your room, preferred finish and the features you need. Our team can help compare current models, specifications and warranty options. Exact features vary by model.",
  },
  {
    q: "What warranty options are available?",
    a: "Base model has 2-year and 3-year warranty choices. Jumbohead and Nanohead each have 3-year, 5-year and 7-year warranty choices. Their Wood versions are separate products with their own prices. Choose a product and warranty to see the price. Confirm covered parts, exclusions and service arrangements with Bright Copter before purchase.",
  },
  {
    q: "Can you deliver to my location?",
    a: "Share your delivery PIN code with our team. We will confirm current serviceability, delivery charges and estimated timing before accepting an order.",
  },
  {
    q: "Is installation included?",
    a: "Installation is not assumed to be included. Ask our team whether it is available for your location and what charges and arrangements apply.",
  },
  {
    q: "How do I place an order?",
    a: `Add your selection to the bag, enter your delivery address and choose a payment preference. Review the details and select Place order via WhatsApp. A ready-to-send order message opens for ${orderDisplay}. Tap Send in WhatsApp; our staff then confirms the actual product, total, delivery and final payment mode. No payment is collected on the website.`,
  },
  {
    q: "What if my product needs care or repair?",
    a: "Use the service request form with your product and purchase information. The team will assess the issue and applicable warranty terms, then confirm the next step and any charges before paid work.",
  },
];

export function Faq({ count = faqItems.length }: { count?: number }) {
  return (
    <div className="faq-list">
      {faqItems.slice(0, count).map((f) => (
        <details key={f.q} className="faq-item">
          <summary>
            {f.q}
            <Plus size={18} />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
