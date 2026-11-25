/** Infinite, CSS-driven ticker. Content is doubled so the loop is seamless. */
export default function Marquee({ items, reverse = false, className = '', speed = 40 }) {
  const row = (hidden) => (
    <div className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className="marquee-item">
          {t}
          <i className="marquee-dot" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${reverse ? 'is-reverse' : ''} ${className}`} style={{ '--speed': `${speed}s` }}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
