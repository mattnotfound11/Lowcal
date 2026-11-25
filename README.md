# Lowcal

Online store for Lowcal, a premium streetwear brand where Japanese aesthetic meets automotive soul.

## Structure

- `frontend/`: React + Vite storefront. GSAP and Lenis for motion, a custom WebGL smoke shader for the hero.
- `backend/`: Express API serving products and journal posts. It also takes pre-orders, reviews and contact messages.

## Run it

```bash
npm run setup   # install root, backend and frontend dependencies
npm run dev     # API on :4000, storefront on :5173 (proxies /api)
```

## Production

```bash
npm run build   # builds frontend/dist
npm start       # Express serves the API and the built site on :4000
```

## Data

- Catalog: `backend/data/products.json`. Prices are read from here at checkout and never trusted from the browser.
- Journal: `backend/data/posts.json`
- Orders, reviews and messages are written to `backend/data/store/`, which is gitignored.
