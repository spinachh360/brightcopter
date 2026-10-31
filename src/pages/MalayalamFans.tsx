import { Faq } from "../components/Faq";
import { PageIntro } from "../components/PageIntro";
import { ProductCard } from "../components/ProductCard";
import { SectionTitle } from "../components/SectionTitle";
import { SupportBanner } from "../components/SupportBanner";
import { cataloguePriceRange, mapLink, products } from "../data";
import { careDisplay, careNumber, orderDisplay, orderWhatsapp } from "../contacts";
import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

// Malayalam landing page: every Malayalam block is paired with its English
// translation on the page, so the copy can be vetted without reading script.
// Facts only: published prices, warranties, address and phone numbers.
const showcaseIds = ["base-model-2-year", "jumbohead-model-3-year", "nanohead-model-3-year"];
const showcase = showcaseIds
  .map((id) => products.find((product) => product.id === id))
  .filter((product): product is NonNullable<typeof product> => product !== undefined);

export function MalayalamFans() {
  return (
    <>
      <PageIntro
        eyebrow="BRIGHT COPTER · മലയാളം"
        title="BLDC സീലിംഗ് ഫാൻ — കുറഞ്ഞ വൈദ്യുതി, താങ്ങാവുന്ന വില"
        localLine="ചൂടിന് ഇത്ര ജാഡ വേണ്ട. തൃശൂരിൽ നിന്ന്, കേരളത്തിലുടനീളം."
        description={`Bright Copter BLDC ceiling fans at ${cataloguePriceRange}, with 2–7 year warranty options by model. Based in Parappur, Thrissur — order on WhatsApp, with service technicians across Kerala.`}
      />
      <section className="section container">
        <SectionTitle
          eyebrow="മോഡലുകൾ · MODELS"
          title="Base, Jumbohead, Nanohead — നിങ്ങളുടെ ഫാൻ തിരഞ്ഞെടുക്കൂ"
          action={
            <Link className="text-button" to="/products">
              Compare all fans & prices <ArrowUpRight size={17} />
            </Link>
          }
        >
          Choose your model and warranty to see its price. Our team confirms availability, delivery and complete warranty terms on WhatsApp.
          <span className="local-support-copy" lang="ml">മോഡലും വാറന്റിയും തിരഞ്ഞെടുത്താൽ വില കാണാം. ലഭ്യതയും ഡെലിവറിയും WhatsApp-ൽ സ്ഥിരീകരിക്കും.</span>
        </SectionTitle>
        <div className="product-grid">
          {showcase.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        <p className="catalogue-note">Base model has 2- and 3-year warranty options. Jumbohead and Nanohead offer 3, 5 or 7 years. Wood finishes are listed separately.</p>
      </section>
      <section className="section container">
        <SectionTitle
          eyebrow="BLDC · വൈദ്യുതി ലാഭം"
          title="എന്തുകൊണ്ട് BLDC ഫാൻ വൈദ്യുതി ലാഭിക്കുന്നു?"
        >
          A BLDC motor is more efficient than a conventional induction motor. It turns more of the electricity it draws into motion and wastes less as heat, so the fan needs less power to move the same air.
          <span className="local-support-copy" lang="ml">BLDC മോട്ടോർ സാധാരണ ഇൻഡക്ഷൻ മോട്ടോറിനേക്കാൾ കാര്യക്ഷമമാണ്. വൈദ്യുതിയുടെ കൂടുതൽ ഭാഗം ചലനമാക്കി മാറ്റുകയും ചൂടായി പാഴാക്കുന്നത് കുറയ്ക്കുകയും ചെയ്യുന്നു — അതുകൊണ്ട് അതേ കാറ്റിന് ഫാനിന് കുറഞ്ഞ വൈദ്യുതി മതി.</span>
        </SectionTitle>
      </section>
      <section className="section container">
        <SectionTitle
          eyebrow="തൃശൂർ · THRISSUR, KERALA"
          title="തൃശൂരിൽ നിന്ന്, കേരളത്തിലുടനീളം"
        >
          From Parappur, Thrissur — for homes across Kerala.
          <span className="local-support-copy" lang="ml">പറപ്പൂർ, തൃശൂരിൽ നിന്ന് — കേരളത്തിലെ വീടുകൾക്കായി.</span>
        </SectionTitle>
        <p>
          <strong>Bright Copter</strong>
          <br />
          ST.JOHN&apos;S BUILDING, Parappur, Thrissur, Keralam 680552, India
          <br />
          Customer care: <a href={`tel:+${careNumber}`}>{careDisplay}</a>
          <br />
          WhatsApp orders: <a href={orderWhatsapp("Hello Bright Copter, please help me choose a ceiling fan and warranty option.")}>{orderDisplay}</a>
        </p>
        <div className="hero-cta">
          <a className="button" href={orderWhatsapp("Hello Bright Copter, please help me choose a ceiling fan and warranty option.")} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /><span lang="ml">WhatsApp-ൽ ചോദിക്കൂ</span>
          </a>
          <a className="button button-outline" href={mapLink} target="_blank" rel="noreferrer">
            <MapPin size={15} /> Find the store <ArrowUpRight size={15} />
          </a>
          <a className="button button-outline" href={`tel:+${careNumber}`}>
            <Phone size={16} /> {careDisplay}
          </a>
        </div>
      </section>
      <section className="section container">
        <SectionTitle
          eyebrow="ചോദ്യോത്തരങ്ങൾ · FAQ"
          title="ചോദ്യങ്ങൾ, വ്യക്തമായ ഉത്തരങ്ങൾ"
          action={
            <Link className="text-button" to="/support">
              More help on the support page <ArrowUpRight size={17} />
            </Link>
          }
        >
          Questions and clear answers — in English and Malayalam.
        </SectionTitle>
        <Faq />
      </section>
      <SupportBanner />
    </>
  );
}
