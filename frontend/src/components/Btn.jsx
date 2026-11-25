import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/** Pill-free, hard-edged CTA with a nested icon block that shifts on hover. */
export default function Btn({ to, href, variant = '', icon = 'arrow', block, children, className = '', ...rest }) {
  const cls = `btn ${variant ? `btn--${variant}` : ''} ${block ? 'btn--block' : ''} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span className="btn-ico">
        <Icon name={icon} size={16} />
      </span>
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} target="_blank" rel="noreferrer" {...rest}>{inner}</a>;
  return <button className={cls} {...rest}>{inner}</button>;
}
