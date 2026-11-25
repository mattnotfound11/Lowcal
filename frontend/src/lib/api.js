const cache = new Map();

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function cached(path) {
  if (!cache.has(path)) {
    cache.set(path, request(path).catch((err) => {
      cache.delete(path);
      throw err;
    }));
  }
  return cache.get(path);
}

export const api = {
  products: () => cached('/products'),
  product: (slug) => cached(`/products/${encodeURIComponent(slug)}`),
  posts: () => cached('/posts'),
  post: (slug) => cached(`/posts/${encodeURIComponent(slug)}`),
  comments: (slug) => request(`/posts/${encodeURIComponent(slug)}/comments`),
  addComment: (slug, body) =>
    request(`/posts/${encodeURIComponent(slug)}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  placeOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  contact: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};
