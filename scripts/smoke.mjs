// Boots the API on a spare port and checks the endpoints the storefront depends on.
import { spawn } from 'node:child_process';

const PORT = 4100;
const base = `http://localhost:${PORT}/api`;
const server = spawn('node', ['backend/src/server.js'], { env: { ...process.env, PORT }, stdio: 'inherit' });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (msg) => {
  console.error(`FAIL: ${msg}`);
  server.kill();
  process.exit(1);
};

let up = false;
for (let i = 0; i < 40 && !up; i++) {
  try { up = (await fetch(`${base}/health`)).ok; } catch { await wait(250); }
}
if (!up) fail('API did not start');

const products = await (await fetch(`${base}/products`)).json();
if (!Array.isArray(products) || products.length === 0) fail('/products returned no items');

const bad = await fetch(`${base}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
if (bad.status !== 400) fail(`empty order should be rejected with 400, got ${bad.status}`);

const missing = await fetch(`${base}/products/does-not-exist`);
if (missing.status !== 404) fail(`unknown product should be 404, got ${missing.status}`);

console.log(`OK: ${products.length} products, validation and 404 behave`);
server.kill();
