import { Link } from 'react-router-dom';
import { money, pad2 } from '../lib/format.js';

export default function ProductCard({ product, index = 0, delay = 0 }) {
  const { slug, name, jp, series, images, price, preorderPrice, badge, photo } = product;
  return (
    <Link
      to={`/product/${slug}`}
      className={`card ${photo ? 'is-photo' : ''}`}
      data-reveal
      data-cursor="View"
      style={{ '--d': delay }}
    >
      <div className="card-media">
        <span className="card-badge mono">{badge}</span>
        <span className="card-num mono">{pad2(index + 1)}</span>
        <span className="card-jp jp">{jp}</span>
        <img className="card-img card-img--a" src={images.back} alt={`${name} back print`} loading="lazy" />
        <img className="card-img card-img--b" src={images.front} alt="" loading="lazy" />
      </div>
      <div className="card-info">
        <div>
          <span className="mono muted">{series} series</span>
          <h3 className="display card-name">{name}</h3>
        </div>
        <div className="card-price">
          <span>{money(preorderPrice)}</span>
          <s className="muted">{money(price)}</s>
        </div>
      </div>
    </Link>
  );
}
