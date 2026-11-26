import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { gsap, reducedMotion } from '../lib/motion.js';
import { money } from '../lib/format.js';
import { BRAND } from '../lib/brand.js';
import SmokeCanvas from '../components/SmokeCanvas.jsx';
import SplitText from '../components/SplitText.jsx';
import Marquee from '../components/Marquee.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Btn from '../components/Btn.jsx';
import Icon from '../components/Icon.jsx';

const MISSION = 'Clean Japanese design. Raw car culture. Gear that drives your style forward.';

const PILLARS = [
  { icon: 'handshake', title: 'Meetup pickup', note: 'Free in Iloilo City' },
  { icon: 'lock', title: 'Secure checkout', note: 'GCash or cash' },
  { icon: 'truck', title: 'Limited runs', note: 'No restocks' },
];

export default function Home({ ready }) {
  const root = useRef(null);
  const { data: products } = useAsync(() => api.products(), []);
  const featured = products?.find((p) => p.slug === 'shiro-grs');
  const collection = products?.filter((p) => p.slug !== 'shiro-grs');

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      // Hero: the wordmark sinks and fades as you leave the fold
      gsap.to('.hero-mark', {
        yPercent: 22,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // Feature: the frame opens from an inset window to full bleed
      gsap.fromTo(
        '.feature-frame',
        { clipPath: 'inset(14% 16% 14% 16%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: '.feature', start: 'top 90%', end: 'top 10%', scrub: true },
        },
      );
      gsap.fromTo(
        '.feature-frame img',
        { scale: 1.25 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: '.feature', start: 'top bottom', end: 'bottom top', scrub: true } },
      );

      // Mission: words light up as they pass the reading line
      gsap.fromTo(
        '.manifesto-word',
        { opacity: 0.25 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: '.manifesto-text', start: 'top 80%', end: 'bottom 55%', scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [!!products]);

  return (
    <div ref={root} className="home">
      {/* ───────────── HERO ───────────── */}
      <section className={`hero ${ready ? 'is-in' : ''}`}>
        <SmokeCanvas />
        <div className="hero-frame" aria-hidden="true">
          <i /><i /><i /><i />
          <span className="mono hero-frame-tag hero-frame-tag--tl">REC <b className="rec-dot">●</b> Drop 01</span>
          <span className="mono hero-frame-tag hero-frame-tag--tr">ISO 800 · 1/8s</span>
        </div>
        <div className="hero-mark">
          <span className="jp hero-jp">ローカル</span>
          <h1 className="hero-word" aria-label="Lowcal">
            <SplitText text="LOWCAL" className="display" reveal={false} delay={250} />
          </h1>
          <p className="hero-line">Japanese aesthetic. Automotive soul.</p>
          <div className="hero-ctas">
            <Btn to="/shop" variant="red">Shop the drop</Btn>
          </div>
        </div>

        <div className="hero-bar wrap">
          <span className="mono">Drop 01 <span className="muted">· Pre-orders open</span></span>
          <span className="hero-scroll" aria-hidden="true"><i /></span>
          <span className="mono muted">{BRAND.coords.join('  ')}</span>
        </div>
      </section>

      <Marquee items={['Lowcal', 'ローカル', 'Drop 01', 'スロットル', 'Street-ready threads']} speed={60} />

      {/* ───────────── DROP 01 FEATURE ───────────── */}
      <section className="feature">
        <div className="feature-frame">
          <img src="/images/lookbook/hilux-day.jpg" alt="The white Toyota Hilux GR Sport that inspired Shiro.GRS" />
          <div className="feature-shade" />
          <div className="feature-copy wrap">
            <span className="eyebrow" data-reveal>Drop 01 · Limited run</span>
            <h2 className="display feature-title">
              <SplitText text="Shiro" />
              <SplitText text=".GRS" className="red" delay={140} />
            </h2>
            <p className="feature-line" data-reveal style={{ '--d': 200 }}>A tribute to the GRS Hilux.</p>
            <div className="feature-buy" data-reveal style={{ '--d': 320 }}>
              {featured && (
                <span className="feature-price">
                  <span className="display">{money(featured.preorderPrice)}</span>
                  <s className="mono muted">{money(featured.price)}</s>
                </span>
              )}
              <Btn to="/product/shiro-grs" variant="red">Pre-order</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── COLLECTION ───────────── */}
      <section className="section collection">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display section-title">
              <SplitText text="The" /> <SplitText text="Collection" delay={120} />
            </h2>
            <Link to="/shop" className="link-line" data-reveal>
              View all <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <div className="grid-products grid-products--three">
            {(collection || Array.from({ length: 3 })).map((p, i) =>
              p ? <ProductCard key={p.slug} product={p} index={i} delay={i * 110} /> : <div key={i} className="card-skeleton" />,
            )}
          </div>
        </div>
      </section>

      {/* ───────────── MANIFESTO ───────────── */}
      <section className="section manifesto">
        <div className="wrap">
          <p className="manifesto-text">
            {MISSION.split(' ').map((w, i) => (
              <span key={i} className="manifesto-word">{w} </span>
            ))}
          </p>
          <Link to="/about" className="link-line" data-reveal>
            Our story <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </section>

      {/* ───────────── PILLARS ───────────── */}
      <section className="pillars wrap">
        <div className="pillars-grid">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="pillar" data-reveal style={{ '--d': i * 110 }}>
              <Icon name={p.icon} size={28} stroke={1} />
              <strong className="display">{p.title}</strong>
              <span className="mono muted">{p.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── JOIN ───────────── */}
      <section className="join">
        <SmokeCanvas className="join-smoke" />
        <div className="wrap join-inner">
          <h2 className="display join-title">
            <SplitText text="Stay" /> <SplitText text="low." className="red" delay={140} />
          </h2>
          <div className="join-links" data-reveal style={{ '--d': 260 }}>
            {BRAND.socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="join-link" aria-label={s.name}>
                <Icon name={s.icon} size={20} />
                <span className="mono">{s.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
