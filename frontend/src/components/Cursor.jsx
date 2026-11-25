import { useEffect, useRef, useState } from 'react';

/** Red dot cursor that grows into a "VIEW" lens over [data-cursor="view"]. */
export default function Cursor() {
  const ref = useRef(null);
  const [mode, setMode] = useState('');
  const [label, setLabel] = useState('View');

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = ref.current;
    let x = -100, y = -100, cx = -100, cy = -100, raf;

    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target.closest?.('[data-cursor], a, button, label, input, textarea');
      if (t?.dataset.cursor) {
        setMode('is-view');
        setLabel(t.dataset.cursor);
      } else setMode(t ? 'is-link' : '');
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`cursor ${mode}`} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}
