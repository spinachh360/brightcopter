import { ArrowUpRight, Star } from "lucide-react";
import { reviewsLink } from "../data";
import { SectionTitle } from "./SectionTitle";

// Verbatim Google reviews for Bright Copter (4.9 stars from 118 reviews),
// collected 2026-10-30. shankarji's review was written in Malayalam; the
// text below is a faithful English rendering, marked as translated on his card.
const testimonials = [
  {
    name: "shankarji",
    text: "The remote fan I bought online developed a small fault. I called the company, and a mechanic came the same evening and fixed it. Mechanic Basheer is very experienced and well-mannered. I wish this venture complete success.",
    translated: true,
  },
  {
    name: "Jayasree Sadan",
    text: "I have ordered 5 nos of fan from this company, the product is excellent and delivery was on time. Totally it's good experience",
  },
  {
    name: "Sirajudheen Siraj",
    text: "Nice product. I like it. Good customer care service.",
  },
  {
    name: "sairaj tm",
    text: "Very good experience. The service was nice and everything was well managed. I really liked it.",
  },
  {
    name: "RAHUL VR",
    text: "Best bldc fan ever i bought. They provide 3 year warranty also in affordable",
  },
  {
    name: "Sreeraj Kandappath",
    text: "Nice product. Good service.",
  },
];

export function Testimonials() {
  return (
    <section className="section container" aria-label="Customer reviews">
      <SectionTitle
        eyebrow="CUSTOMER REVIEWS"
        title="Loved across Kerala."
        action={
          <a className="text-button" href={reviewsLink} target="_blank" rel="noreferrer">
            Read all reviews on Google <ArrowUpRight size={17} />
          </a>
        }
      >
        Rated 4.9 out of 5 from 118 Google reviews.
      </SectionTitle>
      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <figure className="testimonial-card" key={t.name}>
            <div className="testimonial-stars" role="img" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <blockquote>{t.text}</blockquote>
            <figcaption>
              <strong>{t.name}</strong>
              <span>Google review{t.translated ? " · Translated from Malayalam" : ""}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
