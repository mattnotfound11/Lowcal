import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../lib/cart.jsx';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';
import PageHead from '../components/PageHead.jsx';
import Btn from '../components/Btn.jsx';

const DELIVERY_FEE = 100;

export default function Checkout() {
  const { items, subtotal, savings, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [fulfillment, setFulfillment] = useState('meetup');
  const [payment, setPayment] = useState('gcash');
  const [status, setStatus] = useState({ busy: false, error: '' });

  const shipping = fulfillment === 'delivery' ? DELIVERY_FEE : 0;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ busy: true, error: '' });
    try {
      const order = await api.placeOrder({
        customer: { name: form.name, email: form.email, phone: form.phone },
        fulfillment,
        address: form.address,
        payment,
        notes: form.notes,
        items: items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })),
      });
      clear();
      navigate(`/order/${order.id}`, { state: { order } });
    } catch (err) {
      setStatus({ busy: false, error: err.message });
    }
  };

  if (!items.length) {
    return (
      <div className="page">
        <PageHead eyebrow="Checkout" title="Your bag is" accent="empty">
          <p>Nothing to check out yet. The first drop is live.</p>
          <div style={{ marginTop: 28 }}><Btn to="/shop" variant="red">Shop the drop</Btn></div>
        </PageHead>
      </div>
    );
  }

  return (
    <div className="page checkout">
      <PageHead eyebrow="Checkout · Pre-order" title="Lock it" accent="in" />
      <form className="wrap checkout-grid" onSubmit={submit} noValidate={false}>
        <div className="checkout-form">
          <fieldset>
            <legend className="eyebrow">01 · Contact</legend>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required autoComplete="name" value={form.name} onChange={set('name')} placeholder="Juan dela Cruz" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
              </div>
              <div className="field">
                <label htmlFor="phone">Mobile</label>
                <input id="phone" type="tel" required autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" minLength={7} maxLength={20} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow">02 · Fulfillment</legend>
            <div className="choices">
              <label className="choice">
                <input type="radio" name="fulfillment" checked={fulfillment === 'meetup'} onChange={() => setFulfillment('meetup')} />
                <strong>Meetup pickup <span>Free</span></strong>
                <small>Iloilo City. We message you within 24 hours to set a time and spot.</small>
              </label>
              <label className="choice">
                <input type="radio" name="fulfillment" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} />
                <strong>Delivery <span>{money(DELIVERY_FEE)}</span></strong>
                <small>Ships nationwide once the run is produced.</small>
              </label>
            </div>
            {fulfillment === 'delivery' && (
              <div className="field">
                <label htmlFor="address">Delivery address</label>
                <textarea id="address" required rows={3} autoComplete="street-address" value={form.address} onChange={set('address')} placeholder="House no., street, barangay, city, province" />
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="eyebrow">03 · Payment</legend>
            <div className="choices">
              <label className="choice">
                <input type="radio" name="payment" checked={payment === 'gcash'} onChange={() => setPayment('gcash')} />
                <strong>GCash</strong>
                <small>We send payment details when we confirm your order.</small>
              </label>
              <label className="choice">
                <input type="radio" name="payment" checked={payment === 'cash'} onChange={() => setPayment('cash')} />
                <strong>Cash on meetup</strong>
                <small>Pay in person when you pick up.</small>
              </label>
            </div>
            <div className="field">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea id="notes" rows={2} value={form.notes} onChange={set('notes')} placeholder="Preferred meetup spot, time, anything else" />
            </div>
          </fieldset>
        </div>

        <aside className="summary">
          <div className="summary-inner">
            <span className="eyebrow">Order summary</span>
            <ul className="summary-items">
              {items.map((i) => (
                <li key={i.id}>
                  <div className={`line-img ${i.photo ? 'is-photo' : ''}`}><img src={i.image} alt="" /></div>
                  <div>
                    <strong>{i.name}</strong>
                    <span className="mono muted">Size {i.size} × {i.qty}</span>
                  </div>
                  <span>{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="drawer-row"><span className="mono muted">Subtotal</span><span>{money(subtotal)}</span></div>
            {savings > 0 && <div className="drawer-row red"><span className="mono">Pre-order savings</span><span>−{money(savings)}</span></div>}
            <div className="drawer-row"><span className="mono muted">{fulfillment === 'delivery' ? 'Delivery' : 'Meetup'}</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
            <hr className="rule" />
            <div className="drawer-row drawer-total"><span className="mono">Total</span><span className="display">{money(subtotal + shipping)}</span></div>
            {status.error && <p className="alert" role="alert">{status.error}</p>}
            <Btn variant="red" block type="submit" disabled={status.busy} icon="lock">
              {status.busy ? 'Placing pre-order…' : 'Place pre-order'}
            </Btn>
            <p className="mono muted small">
              No payment is taken on this site. By placing a pre-order you agree we may contact you to confirm it.{' '}
              <Link to="/contact" className="red">Questions?</Link>
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
