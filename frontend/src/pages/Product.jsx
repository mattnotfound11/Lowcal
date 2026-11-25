import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { useCart } from '../lib/cart.jsx';
import { money } from '../lib/format.js';
import SplitText from '../components/SplitText.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Btn from '../components/Btn.jsx';
import Icon from '../components/Icon.jsx';
import Barcode from '../components/Barcode.jsx';
import NotFound from './NotFound.jsx';
import LoadError from '../components/LoadError.jsx';

const SIZE_GUIDE = [
  ['S', '52', '70'],
  ['M', '55', '72'],
  ['L', '58', '74'],
  ['XL', '61', '76'],
  ['2XL', '64', '78'],
];

export default function Product() {
  const { slug } = useParams();
  const { data: p, error, loading } = useAsync(() => api.product(slug), [slug]);
  const { data: all } = useAsync(() => api.products(), []);
  const { add } = useCart();
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [nudge, setNudge] = useState(false);
  const [open, setOpen] = useState('details');

  useEffect(() => {
    setSize(null);
    setQty(1);
    setActive(0);
  }, [slug]);

  if (error?.status === 404) return <NotFound />;
  if (error) return <div className="page wrap"><LoadError error={error} /></div>;
  if (loading || !p) return <div className="page wrap"><div className="pdp-skeleton" /></div>;

  const gallery = p.images.gallery;
  const onAdd = () => {
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 700);
      return;
    }
    add(p, size, qty);
  };

  return (
    <div className="page pdp">
      <div className="wrap pdp-grid">
        <div className="pdp-gallery">
          <div className={`pdp-stage ${p.photo ? 'is-photo' : ''}`} data-reveal="clip">
            {gallery.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${p.name}, view ${i + 1}`}
                className={i === active ? 'is-active' : ''}
              />
            ))}
            <span className="pdp-jp jp" aria-hidden="true">{p.jp}</span>
          </div>
          <div className="pdp-thumbs" role="tablist" aria-label="Product images">
            {gallery.map((src, i) => (
              <button
                key={src}
                role="tab"
                aria-selected={i === active}
                aria-label={`Show image ${i + 1}`}
                className={`pdp-thumb ${i === active ? 'is-on' : ''} ${p.photo ? 'is-photo' : ''}`}
                onClick={() => setActive(i)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <nav className="crumbs mono muted" aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link> / <span>{p.series}</span>
          </nav>
          <span className="card-badge mono pdp-badge">{p.badge}</span>
          <h1 className="display pdp-title">
            <SplitText text={p.name} />
          </h1>
          <p className="pdp-tagline">{p.tagline}</p>

          <div className="pdp-price">
            <span className="display">{money(p.preorderPrice)}</span>
            <s className="muted">{money(p.price)}</s>
            <span className="mono red">Save {money(p.price - p.preorderPrice)} on pre-order</span>
          </div>

          <p className="pdp-desc muted">{p.description}</p>

          <div className={`pdp-sizes ${nudge ? 'is-nudge' : ''}`}>
            <div className="pdp-label mono">
              <span>Size {size && <span className="red">· {size}</span>}</span>
              <button className="link-line" onClick={() => setOpen('size')}>Size guide</button>
            </div>
            <div className="size-row" role="radiogroup" aria-label="Choose a size">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={size === s}
                  className={`size ${size === s ? 'is-on' : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {nudge && <span className="mono red">Pick a size first</span>}
          </div>

          <div className="pdp-buy">
            <div className="qty qty--lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity"><Icon name="plus" size={14} /></button>
            </div>
            <Btn variant="red" icon="bag" block onClick={onAdd}>
              Add to bag · {money(p.preorderPrice * qty)}
            </Btn>
          </div>

          <ul className="pdp-perks">
            <li><Icon name="handshake" size={18} /> Free meetup pickup in Iloilo City</li>
            <li><Icon name="lock" size={18} /> Pay by GCash or cash on meetup</li>
            <li><Icon name="truck" size={18} /> Delivery available nationwide</li>
          </ul>

          <div className="accordion">
            {[
              ['details', 'Details', (
                <ul className="pdp-details">
                  {p.details.map((d) => <li key={d}>{d}</li>)}
                  <li>Colorway: {p.colorway}</li>
                </ul>
              )],
              ['size', 'Size guide (cm)', (
                <table className="size-table">
                  <thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead>
                  <tbody>{SIZE_GUIDE.map((r) => <tr key={r[0]}>{r.map((c) => <td key={c}>{c}</td>)}</tr>)}</tbody>
                </table>
              )],
              ['meetup', 'Meetup & delivery', (
                <p className="muted">
                  After you pre-order we message you within 24 hours to confirm. Meetups happen around Iloilo City. You check the fit and
                  we hand it over. Delivery is a flat ₱100 and ships when the run is produced.
                </p>
              )],
            ].map(([key, label, body]) => (
              <div key={key} className={`acc ${open === key ? 'is-open' : ''}`}>
                <button className="acc-head" onClick={() => setOpen(open === key ? '' : key)} aria-expanded={open === key}>
                  <span className="mono">{label}</span>
                  <Icon name="plus" size={16} />
                </button>
                <div className="acc-body"><div>{body}</div></div>
              </div>
            ))}
          </div>

          <div className="pdp-tag">
            <Barcode value={p.slug} width={160} height={30} />
            <span className="mono muted">LowCal Lifestyle · {p.car}</span>
          </div>
        </div>
      </div>

      {all && (
        <section className="section wrap related">
          <div className="section-head">
            <h2 className="display section-title"><SplitText text="Keep it" /> <SplitText text="low" className="red" delay={150} /></h2>
          </div>
          <div className="grid-products grid-products--three">
            {all.filter((x) => x.slug !== p.slug).slice(0, 3).map((x, i) => (
              <ProductCard key={x.slug} product={x} index={i} delay={i * 90} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
