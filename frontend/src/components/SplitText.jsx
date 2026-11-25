/**
 * Splits text into masked characters that rise in when an ancestor
 * (or the element itself) gains `.is-in`. Screen readers get the plain text.
 */
export default function SplitText({ text, as: Tag = 'span', className = '', delay = 0, reveal = true, ...rest }) {
  let i = 0;
  const words = text.split(' ');
  return (
    <Tag
      className={`split ${className}`}
      aria-label={text}
      data-reveal={reveal ? 'split' : undefined}
      style={{ '--d': delay }}
      {...rest}
    >
      {words.map((word, wi) => (
        <span className="w" aria-hidden="true" key={wi}>
          {[...word].map((ch) => (
            <span className="c-mask" key={i}>
              <span className="c" style={{ '--i': i++ }}>
                {ch}
              </span>
            </span>
          ))}
          {wi < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
