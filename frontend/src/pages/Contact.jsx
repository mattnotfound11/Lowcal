import { useState } from 'react';
import { api } from '../lib/api.js';
import { BRAND } from '../lib/brand.js';
import PageHead from '../components/PageHead.jsx';
import Btn from '../components/Btn.jsx';
import Icon from '../components/Icon.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ busy: false, error: '', done: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ busy: true, error: '', done: false });
    try {
      await api.contact(form);
      setForm({ name: '', email: '', message: '' });
      setStatus({ busy: false, error: '', done: true });
    } catch (err) {
      setStatus({ busy: false, error: err.message, done: false });
    }
  };

  return (
    <div className="page contact">
      <PageHead eyebrow="Contact" title="Hit us" accent="up" jp="コンタクト">
        <p>Sizing, meetups, collabs. We reply fast.</p>
      </PageHead>

      <div className="wrap contact-grid">
        <div className="contact-channels">
          <a href={BRAND.phoneHref} className="channel" data-reveal>
            <Icon name="phone" size={22} />
            <span className="mono muted">Phone</span>
            <strong className="display">{BRAND.phone}</strong>
          </a>
          <a href={`mailto:${BRAND.email}`} className="channel" data-reveal style={{ '--d': 100 }}>
            <Icon name="mail" size={22} />
            <span className="mono muted">Email</span>
            <strong className="display">{BRAND.email}</strong>
          </a>
          <div className="channel" data-reveal style={{ '--d': 200 }}>
            <Icon name="pin" size={22} />
            <span className="mono muted">Based in</span>
            <strong className="display">Iloilo City</strong>
            <span className="muted">{BRAND.address}</span>
          </div>
          <div className="channel-socials" data-reveal style={{ '--d': 300 }}>
            {BRAND.socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="social-row">
                <Icon name={s.icon} size={20} />
                <span><strong>{s.name}</strong><span className="mono muted">{s.handle}</span></span>
                <Icon name="arrow" size={16} />
              </a>
            ))}
          </div>
        </div>

        <form className="contact-form" onSubmit={submit} data-reveal style={{ '--d': 150 }}>
          <span className="eyebrow">Send a message</span>
          <div className="field">
            <label htmlFor="ct-name">Name</label>
            <input id="ct-name" required autoComplete="name" value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="ct-email">Email</label>
            <input id="ct-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label htmlFor="ct-msg">Message</label>
            <textarea id="ct-msg" required rows={5} value={form.message} onChange={set('message')} placeholder="Sizing, meetups, collabs, anything" />
          </div>
          {status.error && <p className="alert" role="alert">{status.error}</p>}
          {status.done && <p className="mono red" role="status">Message sent. We'll get back to you soon.</p>}
          <Btn variant="red" type="submit" disabled={status.busy}>{status.busy ? 'Sending…' : 'Send message'}</Btn>
        </form>
      </div>
    </div>
  );
}
