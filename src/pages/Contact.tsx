import { IconTile } from "../components/IconTile";
import { PageIntro } from "../components/PageIntro";
import { careDisplay, careNumber, mapLink, whatsapp } from "../data";
import { ArrowUpRight, Building2, MapPin, MessageCircle, Phone, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

export function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="A CONVERSATION STARTS HERE"
        title="Let’s connect."
        description="Choosing a product, checking delivery or looking for a little care? We'd love to help."
      />
      <section className="container contact-grid">
        <a
          className="contact-card glass"
          href={whatsapp("Hello Bright Copter! I would like some help.")}
          target="_blank"
          rel="noreferrer"
        >
          <IconTile icon={MessageCircle} />
          <h2>A message away.</h2>
          <p>
            Product questions, availability or help choosing. Start a
            conversation on WhatsApp.
          </p>
          <strong>
            {careDisplay} <ArrowUpRight size={17} />
          </strong>
        </a>
        <a className="contact-card glass" href={`tel:+${careNumber}`}>
          <IconTile icon={Phone} />
          <h2>Hear a friendly voice.</h2>
          <p>
            Prefer a phone call? Reach customer care for the right next step.
          </p>
          <strong>
            Call customer care <ArrowUpRight size={17} />
          </strong>
        </a>
        <a
          className="contact-card glass"
          href={mapLink}
          target="_blank"
          rel="noreferrer"
        >
          <IconTile icon={MapPin} />
          <h2>Find us in Kerala.</h2>
          <p>
            Parappur, Thrissur, Kerala, India. Contact us for current opening
            hours and visit arrangements.
          </p>
          <strong>
            Open Google Maps <ArrowUpRight size={17} />
          </strong>
        </a>
      </section>
      <section className="container contact-help glass">
        <div>
          <p className="eyebrow">
            <span />
            LET’S FIND THE RIGHT TEAM
          </p>
          <h2>A little direction helps.</h2>
          <p>
            For product faults, use a service request so the team has the
            details. For quantity purchases and partnerships, start a business
            enquiry.
          </p>
        </div>
        <div>
          <Link className="button" to="/support?tab=service">
            <Wrench size={17} /> Product support <ArrowUpRight size={16} />
          </Link>
          <Link className="button button-outline" to="/business">
            <Building2 size={17} /> Business enquiries{" "}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
