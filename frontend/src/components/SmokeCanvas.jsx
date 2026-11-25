import { useEffect, useRef, useState } from 'react';
import { createSmoke } from '../lib/smoke.js';

export default function SmokeCanvas({ className = '' }) {
  const ref = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const smoke = createSmoke(ref.current, { scale: window.innerWidth < 768 ? 0.4 : 0.55 });
    if (!smoke) setFallback(true);
    return () => smoke?.destroy();
  }, []);

  return (
    <div className={`smoke ${fallback ? 'smoke--fallback' : ''} ${className}`} aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
