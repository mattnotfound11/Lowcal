import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { formatDate } from '../lib/format.js';
import PageHead from '../components/PageHead.jsx';
import LoadError from '../components/LoadError.jsx';
import Icon from '../components/Icon.jsx';

export default function Journal() {
  const { data: posts, error } = useAsync(() => api.posts(), []);
  const [lead, ...rest] = posts || [];

  return (
    <div className="page journal">
      <PageHead eyebrow="Journal · Latest news" title="Notes from" accent="the meet" jp="ブログ">
        <p>Drops, stories and reviews from the crew.</p>
      </PageHead>
      <div className="wrap">
        {error && <LoadError error={error} />}
        {lead && (
          <Link to={`/journal/${lead.slug}`} className="post-lead" data-reveal data-cursor="Read">
            <div className="post-lead-img"><img src={lead.image} alt="" /></div>
            <div className="post-lead-body">
              <span className="mono red">{lead.tag} · {formatDate(lead.date)}</span>
              <h2 className="display">{lead.title}</h2>
              <p className="muted">{lead.excerpt}</p>
              <span className="link-line">Read the story <Icon name="arrowRight" size={14} /></span>
            </div>
          </Link>
        )}
        <div className="post-list">
          {rest.map((p, i) => (
            <Link key={p.slug} to={`/journal/${p.slug}`} className="post-row" data-reveal style={{ '--d': i * 100 }} data-cursor="Read">
              <span className="mono muted">{formatDate(p.date)}</span>
              <h3 className="display">{p.title}</h3>
              <span className="mono red">{p.tag}</span>
              <div className="post-row-img"><img src={p.image} alt="" loading="lazy" /></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
