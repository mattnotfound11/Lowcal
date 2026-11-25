import { useEffect, useState } from 'react';
import { reducedMotion } from '../lib/motion.js';

const KEY = 'lowcal.loaded';
const seen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

/** Counts 0 → 100 while the LOWCAL mark fills in, then lifts away. Once per session. */
export default function Preloader({ onDone }) {
  const [skip] = useState(() => seen() || reducedMotion());
  const [n, setN] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(skip);

  useEffect(() => {
    if (skip) {
      onDone?.();
      return;
    }
    const start = performance.now();
    const dur = 1700;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setLeaving(true);
        onDone?.();
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {
          /* ignore */
        }
        setTimeout(() => setGone(true), 1100);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;
  return (
    <div className={`loader ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <div className="loader-mark">
        <span className="display loader-word">Lowcal</span>
        <span className="display loader-word loader-word--fill" style={{ clipPath: `inset(${100 - n}% 0 0 0)` }}>
          Lowcal
        </span>
      </div>
      <div className="loader-meta wrap">
        <span className="jp">ローカル</span>
        <span className="mono">Warming up the engine</span>
        <span className="display loader-num">{String(n).padStart(3, '0')}</span>
      </div>
    </div>
  );
}
