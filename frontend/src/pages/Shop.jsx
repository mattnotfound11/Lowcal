import { useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import PageHead from '../components/PageHead.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadError from '../components/LoadError.jsx';

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => Number(b.featured) - Number(a.featured) },
  az: { label: 'A → Z', fn: (a, b) => a.name.localeCompare(b.name) },
  price: { label: 'Price', fn: (a, b) => a.preorderPrice - b.preorderPrice },
};

export default function Shop() {
  const { data, error } = useAsync(() => api.products(), []);
  const [series, setSeries] = useState('All');
  const [sort, setSort] = useState('featured');

  const seriesList = useMemo(() => ['All', ...new Set((data || []).map((p) => p.series))], [data]);
  const list = useMemo(
    () => (data || []).filter((p) => series === 'All' || p.series === series).sort(SORTS[sort].fn),
    [data, series, sort],
  );

  return (
    <div className="page shop">
      <PageHead eyebrow="Shop · Drop 01" title="The" accent="Collection" jp="ショップ">
        <p>Oversized heavyweight tees. Pre-order pricing while Drop 01 is live.</p>
      </PageHead>

      <div className="wrap">
        <div className="filters" data-reveal>
          <div className="chips" role="group" aria-label="Filter by series">
            {seriesList.map((s) => (
              <button key={s} className={`chip ${series === s ? 'is-on' : ''}`} onClick={() => setSeries(s)} aria-pressed={series === s}>
                {s}
                <span className="chip-count">
                  {s === 'All' ? data?.length ?? 0 : data?.filter((p) => p.series === s).length}
                </span>
              </button>
            ))}
          </div>
          <label className="sort mono">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <LoadError error={error} />}
        <div className="grid-products grid-products--shop">
          {!data && !error && Array.from({ length: 4 }).map((_, i) => <div key={i} className="card-skeleton" />)}
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} delay={(i % 3) * 90} />
          ))}
        </div>
      </div>
    </div>
  );
}
