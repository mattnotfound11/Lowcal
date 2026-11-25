import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { formatDate } from '../lib/format.js';
import SplitText from '../components/SplitText.jsx';
import Btn from '../components/Btn.jsx';
import Icon from '../components/Icon.jsx';
import LoadError from '../components/LoadError.jsx';
import NotFound from './NotFound.jsx';

function Stars({ value, onChange }) {
  return (
    <div className="stars" role={onChange ? 'radiogroup' : undefined} aria-label={onChange ? 'Rating' : `${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={n <= value ? 'is-on' : ''} onClick={() => onChange(n)}>
            <Icon name="star" size={18} />
          </button>
        ) : (
          <span key={n} className={n <= value ? 'is-on' : ''}><Icon name="star" size={14} /></span>
        ),
      )}
    </div>
  );
}

export default function Post() {
  const { slug } = useParams();
  const { data: post, error } = useAsync(() => api.post(slug), [slug]);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', text: '', rating: 5 });
  const [status, setStatus] = useState({ busy: false, error: '', done: false });

  useEffect(() => {
    api.comments(slug).then(setComments).catch(() => setComments([]));
  }, [slug]);

  if (error?.status === 404) return <NotFound />;
  if (error) return <div className="page wrap"><LoadError error={error} /></div>;
  if (!post) return <div className="page wrap"><div className="pdp-skeleton" /></div>;

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ busy: true, error: '', done: false });
    try {
      const c = await api.addComment(slug, form);
      setComments((list) => [...list, c]);
      setForm({ name: '', text: '', rating: 5 });
      setStatus({ busy: false, error: '', done: true });
    } catch (err) {
      setStatus({ busy: false, error: err.message, done: false });
    }
  };

  return (
    <article className="page post">
      <header className="wrap post-head">
        <Link to="/journal" className="link-line" data-reveal>← Journal</Link>
        <span className="mono red" data-reveal>{post.tag} · {formatDate(post.date)}</span>
        <h1 className="display post-title"><SplitText text={post.title} /></h1>
      </header>
      <figure className="wrap post-cover" data-reveal="clip"><img src={post.image} alt="" /></figure>
      <div className="wrap post-body">
        {post.body.map((para, i) => (
          <p key={i} data-reveal className={i === 0 ? 'post-first' : ''}>{para}</p>
        ))}
      </div>

      <section className="wrap post-comments">
        <h2 className="display section-title">Reviews <span className="muted">({comments.length})</span></h2>
        <ul className="comment-list">
          {comments.length === 0 && <li className="muted">No reviews yet. Be the first from the crew.</li>}
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment-top">
                <strong>{c.name}</strong>
                {c.rating && <Stars value={c.rating} />}
                <span className="mono muted">{formatDate(c.createdAt)}</span>
              </div>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
        <form className="comment-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="c-name">Name</label>
            <input id="c-name" required maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Rating</label>
            <Stars value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          </div>
          <div className="field comment-text">
            <label htmlFor="c-text">Your review</label>
            <textarea id="c-text" required maxLength={1000} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="How's the fit, the print, the meetup?" />
          </div>
          {status.error && <p className="alert" role="alert">{status.error}</p>}
          {status.done && <p className="mono red" role="status">Posted. Thanks for riding with us.</p>}
          <Btn variant="red" type="submit" disabled={status.busy}>{status.busy ? 'Posting…' : 'Post review'}</Btn>
        </form>
      </section>
    </article>
  );
}
