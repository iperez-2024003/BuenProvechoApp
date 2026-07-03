'use strict';

// Simple smoke test: login -> refresh -> revoke
// Usage: NODE_ENV=development node scripts/smoke-refresh.js

const BASE = process.env.AUTH_BASE || 'http://localhost:3006/api/v1/auth';
const TEST_USER = process.env.AUTH_TEST_USER;
const TEST_PASS = process.env.AUTH_TEST_PASS;

if (!TEST_USER || !TEST_PASS) {
  console.log('Set AUTH_TEST_USER and AUTH_TEST_PASS env vars to run this smoke test.');
  process.exit(1);
}

const run = async () => {
  try {
    console.log('Login...');
    const loginResp = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: TEST_USER, password: TEST_PASS }),
    });
    const loginJson = await loginResp.json();
    console.log('Login response:', loginJson.success ? 'OK' : 'FAIL');
    if (!loginJson.success) return process.exit(2);

    const setCookieHeader = loginResp.headers.get('set-cookie') || '';
    const refreshCookie = setCookieHeader.split(';')[0];
    const accessToken = loginJson.token;

    console.log('Refreshing token...');
    const refreshResp = await fetch(`${BASE}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: refreshCookie,
      },
    });
    const refreshJson = await refreshResp.json();
    console.log('Refresh response:', refreshJson.success ? 'OK' : 'FAIL', refreshJson);
    if (!refreshJson.success) return process.exit(3);

    const refreshedSetCookie = refreshResp.headers.get('set-cookie') || '';
    const refreshedCookie = refreshedSetCookie.split(';')[0];

    console.log('Revoking refresh token...');
    const revokeResp = await fetch(`${BASE}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Cookie: refreshedCookie || refreshCookie,
      },
      body: JSON.stringify({}),
    });
    const revokeJson = await revokeResp.json();
    console.log('Revoke response:', revokeJson.success ? 'OK' : 'FAIL', revokeJson);
    if (!revokeJson.success) return process.exit(4);

    console.log('Smoke test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(5);
  }
};

run();
