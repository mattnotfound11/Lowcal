import { Link } from 'react-router-dom';
import { BRAND, NAV } from '../lib/brand.js';
import Icon from './Icon.jsx';
import Barcode from './Barcode.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-quote" data-reveal>
            <p className="display">“{BRAND.quote.text}”</p>
            <span className="mono muted">— {BRAND.quote.by}</span>
          </div>
          <div className="footer-meta" data-reveal style={{ '--d': 120 }}>
            <Barcode value="LOWCAL-LIFESTYLE" width={200} height={44} />
            <span className="mono muted">LowCal Lifestyle</span>
            <span className="mono muted">{BRAND.coords.join(' · ')}</span>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <span className="eyebrow">Navigate</span>
            <ul className="footer-nav">
              <li><Link to="/">Home</Link></li>
              {NAV.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <span className="eyebrow">Reach us</span>
            <ul>
              <li><a href={BRAND.phoneHref}>{BRAND.phone}</a></li>
              <li><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
              <li className="muted">{BRAND.address}</li>
            </ul>
          </div>
          <div className="footer-col">
            <span className="eyebrow">Follow the crew</span>
            <ul>
              {BRAND.socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="footer-social">
                    <Icon name={s.icon} size={18} />
                    {s.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-mark" aria-hidden="true">
        <span className="display">Lowcal</span>
        <span className="jp footer-mark-jp">ローカル</span>
      </div>

      <div className="wrap footer-base">
        <span className="mono muted">© 2026 Lowcal · ローカル</span>
        <span className="mono muted">Pre-orders only · Meetups in Iloilo City</span>
      </div>
    </footer>
  );
}
