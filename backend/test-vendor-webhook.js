#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

const BASE = process.env.TEST_API_URL || 'http://localhost:5001';
const API_KEY = process.env.JAYR_API_KEY || 'test-key-123';
const ORDER_NUM = `HNA-TEST-${Date.now()}`;

const c = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', b: '\x1b[36m', x: '\x1b[0m', d: '\x1b[2m', bold: '\x1b[1m' };
const ok  = (m) => console.log(`${c.g}✅ ${m}${c.x}`);
const err = (m) => console.log(`${c.r}❌ ${m}${c.x}`);
const inf = (m) => console.log(`${c.b}ℹ  ${m}${c.x}`);
const sec = (m) => console.log(`\n${c.bold}${c.b}── ${m} ──${c.x}`);
const dim = (m) => console.log(`${c.d}   ${m}${c.x}`);

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

// ── 1. SERVER UP ─────────────────────────────────────────────────────────────
sec('1. Server Health');
try {
  const res = await fetch(`${BASE}/api/vendors/portal/debug-vendors`);
  res.ok ? ok('Server reachable') : err(`Server returned ${res.status}`);
} catch {
  err(`Cannot reach ${BASE} — is npm run dev running?`);
  process.exit(1);
}

// ── 2. SEED ORDER ────────────────────────────────────────────────────────────
sec('2. Seed Test Order');
inf(`Order number: ${ORDER_NUM}`);
const seed = await post('/api/test/seed-order', {
  orderNumber: ORDER_NUM,
  vendorType: 'external',
  fulfillmentMethod: 'ship_direct',
  supplierName: 'Shirtzilla VS Hatsquatch',
});
if (seed.status === 200 || seed.status === 201) {
  ok(`Order seeded — vendorType: ${seed.data.vendorType}`);
} else {
  err(`Seed failed (${seed.status}) — add this to your server.js then rerun:`);
  console.log(`
${c.y}app.post('/api/test/seed-order', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).end();
  const Order = (await import('./models/Order.js')).default;
  const { orderNumber, vendorType, fulfillmentMethod, supplierName } = req.body;
  const order = await Order.create({
    orderNumber, vendorType, fulfillmentMethod,
    items: [{ name: 'Hat', quantity: 1, price: 35 }],
    customer: { name: 'Test User', email: 'test@hna.com', address: '123 Test St' },
    totalPrice: 35, paymentStatus: 'Paid', status: 'Processing',
    supplier: { name: supplierName },
    statusHistory: [{ status: 'Processing', updatedBy: 'seed', timestamp: new Date() }]
  });
  res.json(order);
});${c.x}
`);
}

// ── 3. AUTH CHECKS ───────────────────────────────────────────────────────────
sec('3. Webhook Auth Checks');

const badKey = await post('/api/vendors/portal/webhook/jayr',
  { orderNumber: ORDER_NUM, status: 'in_production' },
  { 'x-api-key': 'wrong-key' }
);
badKey.status === 401 ? ok('Rejects bad API key (401)') : err(`Expected 401, got ${badKey.status}`);

const noStatus = await post('/api/vendors/portal/webhook/jayr',
  { orderNumber: ORDER_NUM },
  { 'x-api-key': API_KEY }
);
noStatus.status === 400 ? ok('Rejects missing status (400)') : err(`Expected 400, got ${noStatus.status}`);

const badStatus = await post('/api/vendors/portal/webhook/jayr',
  { orderNumber: ORDER_NUM, status: 'banana' },
  { 'x-api-key': API_KEY }
);
badStatus.status === 400 ? ok('Rejects unknown status (400)') : err(`Expected 400, got ${badStatus.status}`);

// ── 4. STATUS PROGRESSION ────────────────────────────────────────────────────
sec('4. Status Progression');

const steps = [
  { status: 'in_production', expected: 'In Production' },
  { status: 'print_complete', expected: 'Print Complete' },
  { status: 'shipped', expected: 'Shipped', tracking: '1Z999AA10123456784' },
];

for (const step of steps) {
  const body = { orderNumber: ORDER_NUM, status: step.status };
  if (step.tracking) body.trackingNumber = step.tracking;
  const r = await post('/api/vendors/portal/webhook/jayr', body, { 'x-api-key': API_KEY });
  r.status === 200
    ? ok(`${step.status} → ${step.expected}`)
    : err(`${step.status} failed (${r.status})`);
  if (step.tracking) {
    r.data.orderNumber ? ok('Tracking accepted') : err('Tracking missing from response');
  }
  dim(JSON.stringify(r.data));
}

// ── 5. OUTBOUND TO JAYR ──────────────────────────────────────────────────────
sec('5. Outbound POST to JayR');

const jayRUrl = process.env.JAYR_WEBHOOK_URL;
if (!jayRUrl) {
  console.log(`${c.y}⚠️  JAYR_WEBHOOK_URL not in .env — skipping${c.x}`);
  console.log(`${c.d}   Get a free URL at https://webhook.site and add to .env${c.x}`);
} else {
  inf(`Posting to: ${jayRUrl}`);
  try {
    const res = await fetch(jayRUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({
        orderNumber: ORDER_NUM,
        items: [
          { name: 'Hat', quantity: 1, price: 35 },
          { name: 'T-Shirt', quantity: 1, price: 45 },
          { name: 'Hoodie', quantity: 1, price: 65 },
        ],
        customer: { name: 'Test Customer', email: 'test@hna.com', address: '123 Test St', city: 'Las Vegas', zipCode: '89101', country: 'US' },
        totalPrice: 145,
      }),
    });
    res.ok ? ok(`Outbound POST succeeded (${res.status})`) : err(`Outbound POST failed (${res.status})`);
    if (jayRUrl.includes('webhook.site')) inf('Check webhook.site to confirm payload received');
  } catch (e) {
    err(`Outbound POST threw: ${e.message}`);
  }
}

// ── DONE ─────────────────────────────────────────────────────────────────────
console.log(`
${c.b}─────────────────────────────────────────────────${c.x}
${c.d}Test order: ${ORDER_NUM}${c.x}

Next:
  1. Add seed route to server.js if step 2 failed
  2. Add JAYR_WEBHOOK_URL to .env to test outbound
  3. Swap real keys when JayR sends his endpoint
`);