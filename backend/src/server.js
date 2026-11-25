import express from 'express';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_DIR = path.join(DATA_DIR, 'store');
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
const PORT = process.env.PORT || 4000;

const readJson = async (file, fallback) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
};

// Serialize writes per file so concurrent requests don't clobber each other.
const writeQueues = new Map();
const appendRecord = (name, record) => {
  const file = path.join(STORE_DIR, `${name}.json`);
  const prev = writeQueues.get(file) || Promise.resolve();
  const next = prev.then(async () => {
    await mkdir(STORE_DIR, { recursive: true });
    const list = await readJson(file, []);
    list.push(record);
    await writeFile(file, JSON.stringify(list, null, 2));
    return record;
  });
  writeQueues.set(file, next.catch(() => {}));
  return next;
};

const products = await readJson(path.join(DATA_DIR, 'products.json'), []);
const posts = await readJson(path.join(DATA_DIR, 'posts.json'), []);
const productBySlug = new Map(products.map((p) => [p.slug, p]));

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^[0-9+\s()-]{7,20}$/.test(v);
const newId = (prefix) => `${prefix}-${randomBytes(3).toString('hex').toUpperCase()}`;

const app = express();
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/products', (_req, res) => res.json(products));

app.get('/api/products/:slug', (req, res) => {
  const product = productBySlug.get(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.get('/api/posts', (_req, res) =>
  res.json(posts.map(({ body, ...summary }) => summary)),
);

app.get('/api/posts/:slug', (req, res) => {
  const post = posts.find((p) => p.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.get('/api/posts/:slug/comments', async (req, res) => {
  const all = await readJson(path.join(STORE_DIR, 'comments.json'), []);
  res.json(all.filter((c) => c.post === req.params.slug));
});

app.post('/api/posts/:slug/comments', async (req, res) => {
  if (!posts.some((p) => p.slug === req.params.slug)) {
    return res.status(404).json({ error: 'Post not found' });
  }
  const name = str(req.body?.name, 60);
  const text = str(req.body?.text, 1000);
  const rating = Number(req.body?.rating);
  if (!name || !text) return res.status(400).json({ error: 'Name and comment are required' });
  const comment = {
    id: newId('C'),
    post: req.params.slug,
    name,
    text,
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
    createdAt: new Date().toISOString(),
  };
  await appendRecord('comments', comment);
  res.status(201).json(comment);
});

app.post('/api/orders', async (req, res) => {
  const b = req.body || {};
  const customer = {
    name: str(b.customer?.name, 80),
    email: str(b.customer?.email, 120),
    phone: str(b.customer?.phone, 20),
  };
  const fulfillment = b.fulfillment === 'delivery' ? 'delivery' : 'meetup';
  const address = str(b.address, 300);
  const payment = ['gcash', 'cash'].includes(b.payment) ? b.payment : null;

  const errors = [];
  if (!customer.name) errors.push('Name is required');
  if (!isEmail(customer.email)) errors.push('A valid email is required');
  if (!isPhone(customer.phone)) errors.push('A valid phone number is required');
  if (fulfillment === 'delivery' && !address) errors.push('Delivery address is required');
  if (!payment) errors.push('Choose a payment method');
  if (!Array.isArray(b.items) || b.items.length === 0) errors.push('Your cart is empty');

  // Prices always come from the catalog, never from the client.
  const items = [];
  for (const raw of Array.isArray(b.items) ? b.items.slice(0, 30) : []) {
    const product = productBySlug.get(raw?.slug);
    const qty = Number(raw?.qty);
    if (!product || !product.sizes.includes(raw?.size) || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      errors.push('Your cart has an item that is no longer available');
      break;
    }
    items.push({ slug: product.slug, name: product.name, size: raw.size, qty, unitPrice: product.preorderPrice });
  }
  if (errors.length) return res.status(400).json({ error: errors[0], errors });

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const shipping = fulfillment === 'delivery' ? 100 : 0;
  const order = {
    id: newId('LWC'),
    status: 'pending-confirmation',
    customer,
    fulfillment,
    address: fulfillment === 'delivery' ? address : null,
    payment,
    notes: str(b.notes, 500),
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    createdAt: new Date().toISOString(),
  };
  await appendRecord('orders', order);
  res.status(201).json(order);
});

app.post('/api/contact', async (req, res) => {
  const name = str(req.body?.name, 80);
  const email = str(req.body?.email, 120);
  const message = str(req.body?.message, 2000);
  if (!name || !isEmail(email) || !message) {
    return res.status(400).json({ error: 'Name, a valid email and a message are required' });
  }
  const record = { id: newId('M'), name, email, message, createdAt: new Date().toISOString() };
  await appendRecord('messages', record);
  res.status(201).json({ ok: true, id: record.id });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// In production, serve the built frontend from the same origin.
if (existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));
}

app.listen(PORT, () => console.log(`Lowcal API on http://localhost:${PORT}`));
