import { Link } from 'react-router-dom';
import { legalPages } from '../policies';
export function LegalPage({ path }: { path: keyof typeof legalPages }) {
  const page = legalPages[path];
  return <article className="container policy-content glass legal-page">
    <header><p className="eyebrow">BRIGHT COPTER · CUSTOMER INFORMATION</p><h1>{page.title}</h1><p>{page.description}</p></header>
    <nav className="policy-contents" aria-label="On this page"><h2>On this page</h2><ol>{page.sections.map(section => <li key={section.id}><a href={`#policy-${section.id}`} onClick={event => { event.preventDefault(); const heading = document.getElementById(`policy-${section.id}`); heading?.focus({preventScroll: true}); heading?.scrollIntoView(); }}>{section.title}</a></li>)}</ol></nav>
    {page.sections.map(section => <section key={section.id} aria-labelledby={`policy-${section.id}`}><h2 id={`policy-${section.id}`} tabIndex={-1}>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
    <footer className="legal-links"><Link to="/return-policy">Returns & refunds</Link><Link to="/terms-and-conditions">Terms & conditions</Link><Link to="/policies/warranty">Warranty guidance</Link><Link to="/policies/privacy">Privacy</Link><Link className="button" to="/contact">Contact Bright Copter</Link></footer>
  </article>;
}
