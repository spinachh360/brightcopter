import { careDisplay, careNumber, mapLink, orderDisplay, orderWhatsapp } from "../../data";
import { Brand } from "../Brand";
import { ArrowRight, ArrowUpRight, Heart, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand light />
            <p>
              Ceiling fans from Parappur, Thrissur.
              <br />Service across Kerala.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link to="/products">Ceiling fans</Link>
            <Link to="/products">All fans</Link>
            <Link to="/compare">Compare fans</Link>
            <Link to="/about">Our story</Link>
            <Link to="/malayalam-ceiling-fans">മലയാളം · Fans in Malayalam</Link>
          </div>
          <div>
            <h3>We're here to help</h3>
            <Link to="/support">Product support</Link>
            <Link to="/support?tab=warranty">Warranty guidance</Link>
            <Link to="/track">Order enquiries</Link>
            <Link to="/business">Dealer & bulk enquiries</Link>
          </div>
          <div className="footer-contact">
            <h3>Let's stay connected</h3>
            <a href={`tel:+${careNumber}`}>
              <Phone size={15} /> {careDisplay}
            </a>
            <a
              href={orderWhatsapp(
                "Hello Bright Copter! I would like to order a ceiling fan.",
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={15} /> WhatsApp orders: {orderDisplay}{" "}
              <ArrowUpRight size={13} />
            </a>
            <a href={mapLink} target="_blank" rel="noreferrer">
              <MapPin size={15} /> ST.JOHN&apos;S BUILDING, Parappur, Thrissur, Keralam 680552
            </a>
            <Link to="/contact" className="footer-directions">
              Find your way to us <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Bright Copter. All rights reserved.
          </span>
          <div>
            <Link to="/policies/privacy">Privacy</Link>
            <Link to="/terms-and-conditions">Terms & conditions</Link>
            <Link to="/return-policy">Returns & refunds</Link>
            <Link to="/policies/warranty">Warranty</Link>
          </div>
          <span>
            Made for the everyday. <Heart size={12} />
          </span>
        </div>
      </div>
    </footer>
  );
}
