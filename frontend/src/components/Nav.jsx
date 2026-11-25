import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../lib/cart.jsx';
import { lockScroll } from '../lib/motion.js';
import { BRAND, NAV } from '../lib/brand.js';
import Icon from './Icon.jsx';

export default function Nav() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    lockScroll(menu);
    if (!menu) return;
    const onKey = (e) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !menu ? 'is-hidden' : ''} ${menu ? 'is-menu' : ''}`}>
        <div className="nav-bar">
          <Link to="/" className="nav-logo" aria-label="Lowcal home">
            <span className="display">Lowcal</span>
            <span className="jp">ローカル</span>
          </Link>

          <nav className="nav-links" aria-label="Main">
            {NAV.map((l) => (
              <NavLink key={l.to} to={l.to} className="nav-link">
                <span data-jp={l.jp}>{l.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button className="nav-bag" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} items`}>
              <Icon name="bag" size={20} />
              <span className="mono">Bag</span>
              <span className={`nav-count ${count ? 'has' : ''}`}>{count}</span>
            </button>
            <button
              className={`burger ${menu ? 'is-open' : ''}`}
              onClick={() => setMenu((m) => !m)}
              aria-label={menu ? 'Close menu' : 'Open menu'}
              aria-expanded={menu}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu ${menu ? 'is-open' : ''}`} aria-hidden={!menu}>
        <div className="menu-inner wrap">
          <ul>
            {[{ to: '/', label: 'Home', jp: 'ホーム' }, ...NAV].map((l, i) => (
              <li key={l.to} style={{ '--i': i }}>
                <Link to={l.to} tabIndex={menu ? 0 : -1}>
                  <span className="menu-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="display">{l.label}</span>
                  <span className="jp menu-jp">{l.jp}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu-foot">
            <span className="mono muted">{BRAND.address}</span>
            <div className="menu-social">
              {BRAND.socials.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer" tabIndex={menu ? 0 : -1} aria-label={s.name}>
                  <Icon name={s.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
