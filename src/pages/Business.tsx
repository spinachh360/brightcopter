import { EnquiryForm } from "../components/EnquiryForm";
import { IconTile } from "../components/IconTile";
import { PageIntro } from "../components/PageIntro";
import { Fan, Heart, MessageCircle } from "lucide-react";

export function Business() {
  return (
    <>
      <PageIntro
        eyebrow="GROW WITH BRIGHT COPTER"
        title="Good connections. Bright possibilities."
        description="From a bulk order to a business partnership, let's explore what we can do together."
      />
      <section className="container">
        <EnquiryForm kind="dealer" />
      </section>
      <section className="container business-values">
        {[
          {
            icon: Fan,
            title: "A range to explore",
            text: "Base model, Jumbohead model and Nanohead model fans.",
          },
          {
            icon: MessageCircle,
            title: "A clear conversation",
            text: "Discuss quantity, availability, delivery and pricing.",
          },
          {
            icon: Heart,
            title: "A lasting connection",
            text: "A real team to help you plan the next step.",
          },
        ].map(({ icon, title, text }) => (
          <div className="glass" key={title}>
            <IconTile icon={icon} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
