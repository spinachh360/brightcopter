import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { careDisplay } from '../contacts';
import { money } from '../data';
import ProductPhoto from './ProductPhoto';

export function WarrantyServiceSection() {
  return <section className="story-panel container" aria-labelledby="warranty-service-title">
    <figure className="story-art glass">
      <div className="story-image"><ProductPhoto finish="Brown" /></div>
      <figcaption className="story-art-caption">
        <span>BASE MODEL · BROWN</span>
        <dl className="story-price-options">
          <div><dt>2-year warranty</dt><dd>{money(2350)}</dd></div>
          <div><dt>3-year warranty</dt><dd>{money(2550)}</dd></div>
        </dl>
        <p className="story-finishes">Black · White · Brown · Ivory</p>
      </figcaption>
    </figure>
    <div className="story-copy">
      <p className="eyebrow"><span />WARRANTY & SERVICE</p>
      <h2 id="warranty-service-title">2 to 7 years.<br /><span>Service across Kerala.</span></h2>
      <p>Choose the warranty duration shown for your model. Before purchase, our team explains covered parts, exclusions and service arrangements.</p>
      <p>For service across Kerala, share your model, purchase details and location with customer care on {careDisplay}. The team confirms arrangements and any charges.</p>
      <div className="story-actions">
        <Link to="/support?tab=service" className="button button-outline">Request fan service <ArrowUpRight size={17} /></Link>
        <div className="story-signature"><MapPin size={18} /><span>Based in Parappur, Thrissur, Kerala.</span></div>
      </div>
    </div>
  </section>;
}
