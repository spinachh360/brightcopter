import { IconTile } from "../components/IconTile";
import { PageIntro } from "../components/PageIntro";
import ProductPhoto from "../components/ProductPhoto";
import { SupportBanner } from "../components/SupportBanner";
import { ArrowUpRight, Heart, MapPin, Wind } from "lucide-react";
import { Link } from "react-router-dom";

export function About() {
  return (
    <>
      <PageIntro
        eyebrow="HELLO, WE’RE BRIGHT COPTER"
        title="From Thrissur. For your home."
        localLine="നമ്മുടെ തൃശൂരിൽ നിന്നൊരു ഫാൻ ബ്രാൻഡ്."
        description="Meet Bright Copter, an appliance brand based in Parappur, Thrissur. Explore our ceiling fan models, warranty options and service across Kerala."
      />
      <section className="container about-feature">
        <div className="about-art glass">
          <ProductPhoto hero finish="Brown" />
          <span>ROOTED IN KERALA. MADE FOR YOUR EVERYDAY.</span>
        </div>
        <div>
          <p className="eyebrow">
            <span />
            OUR STORY
          </p>
          <h2>
            A home is made
            <br />
            of little moments.
          </h2>
          <p>
            A quiet morning. A favourite meal. A room that feels just right. The
            appliances we live with become part of those everyday moments.
          </p>
          <p>
            Bright Copter offers Base model, Jumbohead model and Nanohead model fans,
            with product guidance and local support from
            Parappur in Thrissur.
          </p>
          <p>
            Our identity celebrates the connection between a lion and its cub —
            a reminder of the care, reassurance and lasting bond we want every
            customer relationship to reflect.
          </p>
          <blockquote>“Long lasting bonding like a father.”</blockquote>
          <Link className="button" to="/products">
            See ceiling fans & prices <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="container business-values">
        {[
          {
            icon: Wind,
            title: "Comfort at the centre",
            text: "Explore ceiling fans that fit your everyday needs.",
          },
          {
            icon: Heart,
            title: "Care in the conversation",
            text: "Straightforward guidance from people who listen.",
          },
          {
            icon: MapPin,
            title: "A local connection",
            text: "Based in Parappur, Thrissur, with a real team to speak to.",
          },
        ].map(({ icon, title, text }) => (
          <div className="glass" key={title}>
            <IconTile icon={icon} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
      <SupportBanner />
    </>
  );
}
