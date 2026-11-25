import SplitText from './SplitText.jsx';

/** Shared page header: eyebrow, giant split title, optional vertical katakana. */
export default function PageHead({ eyebrow, title, accent, jp, children }) {
  return (
    <header className="page-head wrap">
      <span className="eyebrow" data-reveal>{eyebrow}</span>
      <h1 className="display page-title">
        <SplitText text={title} />
        {accent && (
          <>
            {' '}
            <SplitText text={accent} className="red" delay={180} />
          </>
        )}
      </h1>
      {children && <div className="page-lede" data-reveal style={{ '--d': 300 }}>{children}</div>}
      {jp && <span className="page-jp jp" aria-hidden="true">{jp}</span>}
    </header>
  );
}
