import { brandLogoUrl } from "../brand";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Brand({ light = false }: { light?: boolean }) {
  const logo = brandLogoUrl;
  const [failed, setFailed] = useState(false);
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Bright Copter home"
    >
      {logo && !failed ? (
        <img
          className="brand-image"
          src={logo}
          width={1672}
          height={941}
          onError={() => setFailed(true)}
          alt="Bright Copter — Long lasting bonding like a father"
        />
      ) : (
        <span className="brand-wordmark">
          Bright Copter<sup>™</sup>
          <small>LONG LASTING BONDING LIKE A FATHER</small>
        </span>
      )}
    </Link>
  );
}
