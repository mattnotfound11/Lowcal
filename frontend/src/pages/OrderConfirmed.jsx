import { useLocation, useParams } from 'react-router-dom';
import { money } from '../lib/format.js';
import { BRAND } from '../lib/brand.js';
import PageHead from '../components/PageHead.jsx';
import Btn from '../components/Btn.jsx';
import Barcode from '../components/Barcode.jsx';

export default function OrderConfirmed() {
  const { id } = useParams();
  const order = useLocation().state?.order;

  return (
    <div className="page confirm">
      <PageHead eyebrow={`Order ${id}`} title="You're in" accent="the crew" jp="ありがとう">
        <p>
          Your pre-order is placed. We'll message you within 24 hours at {order?.customer.phone || 'your number'} to confirm
          {order?.fulfillment === 'delivery' ? ' payment and delivery.' : ' payment and set up your meetup.'}
        </p>
      </PageHead>
      <div className="wrap">
        <div className="ticket" data-reveal>
          <div className="ticket-row">
            <span className="mono muted">Order no.</span>
            <span className="display ticket-id">{id}</span>
          </div>
          {order && (
            <>
              <ul className="ticket-items">
                {order.items.map((i) => (
                  <li key={`${i.slug}-${i.size}`}>
                    <span>{i.name} · {i.size} × {i.qty}</span>
                    <span>{money(i.unitPrice * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="ticket-row">
                <span className="mono muted">{order.fulfillment === 'delivery' ? 'Delivery' : 'Meetup'} · {order.payment === 'gcash' ? 'GCash' : 'Cash'}</span>
                <span className="display">{money(order.total)}</span>
              </div>
            </>
          )}
          <Barcode value={id} width={260} height={46} />
        </div>
        <div className="confirm-ctas">
          <Btn to="/shop" variant="red">Keep shopping</Btn>
          <Btn href={BRAND.socials[0].href} variant="ghost">Follow on Instagram</Btn>
        </div>
      </div>
    </div>
  );
}
