import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Test-only rendering, not server rendering in the deployed website.
// No browser, live Google login, or spreadsheet is accessed.
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
try {
  const { JoinWaitlistPage } = await server.ssrLoadModule('/components/join-waitlist-page.tsx');
  const { authErrorMessage, firebaseConfig } = await server.ssrLoadModule('/lib/firebase-auth.ts');
  const html = renderToStaticMarkup(createElement(JoinWaitlistPage));
  assert.match(html, /Sign In/);
  assert.match(html, /Create Account/);
  assert.match(html, /Continue with Google/);
  assert.match(html, /auth-tab-btn/);
  assert.match(html, /auth-google-btn/);
  assert(!html.includes('extraordinary is coming'), 'Must not claim success before waitlist submission');
  assert.match(html, /loomcaree@gmail.com/);
  assert.equal(firebaseConfig.projectId, 'loom-care');
  for (const code of ['auth/popup-closed-by-user', 'auth/popup-blocked', 'auth/unauthorized-domain', 'auth/network-request-failed', 'unknown']) {
    const message = authErrorMessage({ code, message: 'secret-token-must-not-leak' });
    assert(message.length > 20);
    assert(!message.includes('secret-token'));
  }
  console.log('Signed-out static surface with Sign in / Sign up gate, support contact, and safe auth errors passed.');
} finally {
  await server.close();
}
