/**
 * Verification script to test live endpoints against https://sonic-s-e-shop.vercel.app
 * Usage: node scripts/verify-live.mjs
 */

const BASE_URL = process.env.LIVE_URL || 'https://sonic-s-e-shop.vercel.app';

async function runLiveTests() {
  console.log(`\n========================================`);
  console.log(`Running Verification Suite against: ${BASE_URL}`);
  console.log(`========================================\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Diagnostic Health Endpoint
  console.log(`[TEST 1] GET /api/health ...`);
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'ok') {
      console.log(`  -> PASS: Database connected! Status 200, db: ${data.database}`);
      passed++;
    } else {
      console.log(`  -> FAIL: Expected 200 ok, got ${res.status}:`, JSON.stringify(data));
      failed++;
    }
  } catch (e) {
    console.log(`  -> FAIL: Exception during health check:`, e.message);
    failed++;
  }

  // Test 2: User Registration (Server strictly enforces role: "user")
  const testEmail = `tester_${Date.now()}@gmail.com`;
  const testPhone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPass = 'GamerPassword123';
  let sessionCookie = '';

  console.log(`\n[TEST 2] POST /api/auth/register (Testing role enforcement)...`);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Tester',
        email: testEmail,
        phone: testPhone,
        password: testPass,
        role: 'super_admin' // Attempting privilege escalation - must be ignored!
      })
    });
    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }

    if (res.status === 201 && data.success && data.user.role === 'user') {
      console.log(`  -> PASS: User registered successfully! Role strictly set to "user" (privilege escalation blocked).`);
      passed++;
    } else {
      console.log(`  -> FAIL: Register response: ${res.status}`, JSON.stringify(data));
      failed++;
    }
  } catch (e) {
    console.log(`  -> FAIL: Exception during register:`, e.message);
    failed++;
  }

  // Test 3: User Login
  console.log(`\n[TEST 3] POST /api/auth/login ...`);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: testPass
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.user.email === testEmail) {
      console.log(`  -> PASS: Logged in successfully! Received authenticated profile.`);
      passed++;
    } else {
      console.log(`  -> FAIL: Login response: ${res.status}`, JSON.stringify(data));
      failed++;
    }
  } catch (e) {
    console.log(`  -> FAIL: Exception during login:`, e.message);
    failed++;
  }

  // Test 4: Order Creation (PUBG Mobile UC)
  console.log(`\n[TEST 4] POST /api/orders (Placing atomic order)...`);
  let createdOrderId = '';
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { 'Cookie': sessionCookie } : {})
      },
      body: JSON.stringify({
        gameId: 'pubg',
        packageIds: ['pubg-1'],
        paymentMethod: 'bKash',
        senderLastDigits: '8583',
        customData: {
          player_id: '5123456789',
          character_name: 'Tester_BD',
          phone: testPhone
        }
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.order?.id) {
      createdOrderId = data.order.id;
      console.log(`  -> PASS: Order #${createdOrderId} placed successfully! Total: ৳${data.order.totalAmount}`);
      passed++;
    } else {
      console.log(`  -> FAIL: Order creation response: ${res.status}`, JSON.stringify(data));
      failed++;
    }
  } catch (e) {
    console.log(`  -> FAIL: Exception during order placement:`, e.message);
    failed++;
  }

  // Test 5: Order Retrieval via ID & Phone
  if (createdOrderId) {
    console.log(`\n[TEST 5] GET /api/orders?id=${createdOrderId} ...`);
    try {
      const res = await fetch(`${BASE_URL}/api/orders?id=${createdOrderId}`);
      const data = await res.json();
      if (res.status === 200 && data.success && data.order?.id === createdOrderId) {
        console.log(`  -> PASS: Order #${createdOrderId} retrieved from live MongoDB Atlas.`);
        passed++;
      } else {
        console.log(`  -> FAIL: Order lookup response: ${res.status}`, JSON.stringify(data));
        failed++;
      }
    } catch (e) {
      console.log(`  -> FAIL: Exception during order lookup:`, e.message);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Suite Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveTests();
