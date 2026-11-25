import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../lib/cart.jsx';
import { lockScroll } from '../lib/motion.js';
import { money } from '../lib/format.js';
import Icon from './Icon.jsx';
import Btn from './Btn.jsx';

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, savings, setQty, remove, count } = useCart();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <aside className="drawer-panel" role="dialog" aria-label="Your bag" aria-modal="true">
        <header className="drawer-head">
          <div>
            <span className="display drawer-title">Your bag</span>
            <span className="mono muted"> ({count})</span>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close bag" tabIndex={open ? 0 : -1}>
            <Icon name="close" size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p className="display">Nothing in the bag yet.</p>
            <p className="muted">The first drop is live. Pre-order prices while they last.</p>
            <Btn to="/shop" variant="red" tabIndex={open ? 0 : -1}>Shop the drop</Btn>
          </div>
        ) : (
          <>
            <ul className="drawer-items" data-lenis-prevent>
              {items.map((i) => (
                <li key={i.id} className="line">
                  <Link to={`/product/${i.slug}`} className={`line-img ${i.photo ? 'is-photo' : ''}`} tabIndex={open ? 0 : -1}>
                    <img src={i.image} alt={i.name} />
                  </Link>
                  <div className="line-info">
                    <div className="line-top">
                      <strong>{i.name}</strong>
                      <span>{money(i.price * i.qty)}</span>
                    </div>
                    <span className="mono muted">Size {i.size} · Pre-order</span>
                    <div className="line-bottom">
                      <div className="qty">
                        <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease quantity" tabIndex={open ? 0 : -1}>
                          <Icon name="minus" size={14} />
                        </button>
                        <span>{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase quantity" tabIndex={open ? 0 : -1}>
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <button className="link-line line-remove" onClick={() => remove(i.id)} tabIndex={open ? 0 : -1}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="drawer-foot">
              {savings > 0 && (
                <div className="drawer-row red">
                  <span className="mono">Pre-order savings</span>
                  <span>−{money(savings)}</span>
                </div>
              )}
              <div className="drawer-row drawer-total">
                <span className="mono">Subtotal</span>
                <span className="display">{money(subtotal)}</span>
              </div>
              <p className="mono muted small">Meetup in Iloilo City is free. Delivery is calculated at checkout.</p>
              <Btn to="/checkout" variant="red" block tabIndex={open ? 0 : -1}>Checkout</Btn>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
