import { useMemo } from 'react';

/** Deterministic barcode from a string, echoing the Lowcal deck and tee tags. */
export default function Barcode({ value = 'LOWCAL', width = 180, height = 36, color = 'currentColor', className }) {
  const bars = useMemo(() => {
    let seed = [...value].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const out = [];
    let x = 0;
    while (x < width) {
      const w = 1 + Math.floor(rand() * 3.2);
      if (rand() > 0.38) out.push([x, w]);
      x += w + 1 + Math.floor(rand() * 2);
    }
    return out;
  }, [value, width]);

  return (
    <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {bars.map(([x, w]) => (
        <rect key={x} x={x} y="0" width={w} height={height} fill={color} />
      ))}
    </svg>
  );
}
