import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { Metadata } from './components/Metadata';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { RouteEffects } from './components/layout/RouteEffects';
import { Home } from './pages/Home';
import { MalayalamFans } from './pages/MalayalamFans';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Compare } from './pages/Compare';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Confirmation } from './pages/Confirmation';
import { Support } from './pages/Support';
import { Business } from './pages/Business';
import { Track } from './pages/Track';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Policies } from './pages/Policies';
import { NotFound } from './pages/NotFound';
import { LegalPage } from './pages/LegalPage';

export default function App() {
  const location = useLocation();
  return <StoreProvider>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Metadata />
    <RouteEffects />
    <Header />
    <main id="main-content" className="route-content" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/malayalam-ceiling-fans" element={<MalayalamFans />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/confirmation" element={<Confirmation />} />
          <Route path="/support" element={<Support />} />
          <Route path="/business" element={<Business />} />
          <Route path="/track" element={<Track />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/return-policy" element={<LegalPage path="/return-policy" />} />
          <Route path="/terms-and-conditions" element={<LegalPage path="/terms-and-conditions" />} />
          <Route path="/policies/terms" element={<Navigate to="/terms-and-conditions" replace />} />
          <Route path="/policies/returns" element={<Navigate to="/return-policy" replace />} />
          <Route path="/policies/:kind" element={<Policies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
    </main>
    <Footer />
  </StoreProvider>;
}
