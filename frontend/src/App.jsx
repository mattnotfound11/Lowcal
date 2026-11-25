import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ScrollTrigger, scrollToTop, startReveals, startSmoothScroll } from './lib/motion.js';
import Nav from './components/Nav.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Footer from './components/Footer.jsx';
import Cursor from './components/Cursor.jsx';
import Preloader from './components/Preloader.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmed from './pages/OrderConfirmed.jsx';
import About from './pages/About.jsx';
import Journal from './pages/Journal.jsx';
import Post from './pages/Post.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

function Curtain() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRun((r) => r + 1);
  }, [pathname]);

  if (!run) return null;
  return (
    <div className="curtain is-reveal" key={run} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} style={{ '--i': i }} />
      ))}
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startSmoothScroll();
    return startReveals();
  }, []);

  useEffect(() => {
    scrollToTop();
    // let the new page lay out, then recompute pinned sections
    const id = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div className={`app ${ready ? 'is-ready' : ''}`}>
      <Preloader onDone={() => setReady(true)} />
      <Nav />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Home ready={ready} />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderConfirmed />} />
          <Route path="/about" element={<About />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<Post />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Curtain />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
