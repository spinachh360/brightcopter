import { ArrowRight, Wind } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="container empty-state glass not-found">
      <Wind size={44} />
      <p className="not-found-code" aria-label="Error 404">404</p>
      <p className="eyebrow">A LITTLE DETOUR</p>
      <h1>Let’s find your way home.</h1>
      <p>We couldn't find that page, but there's plenty more to explore.</p>
      <Link className="button" to="/">
        Back to Bright Copter <ArrowRight size={17} />
      </Link>
      <Link className="button button-outline" to="/products">Explore ceiling fans</Link>
    </section>
  );
}
