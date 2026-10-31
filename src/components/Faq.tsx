import { Plus } from "lucide-react";
import { faqItems } from "../faqData";

// Questions and answers live in src/faqData.ts — the same data builds the
// FAQPage JSON-LD in src/seo.ts, so schema and visible copy cannot drift.
// Each answer is followed by its Malayalam translation.
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
          <p lang="ml">
            <strong>{f.qMl}</strong>
            <br />
            {f.aMl}
          </p>
        </details>
      ))}
    </div>
  );
}
