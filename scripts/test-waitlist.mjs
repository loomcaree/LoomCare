import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync('integrations/google-sheets/Code.gs', 'utf8');
const requestId = '11111111-1111-4111-8111-111111111111';
const now = Math.floor(Date.now() / 1000);
const claims = { aud: 'loom-care', iss: 'https://securetoken.google.com/loom-care', sub: 'test-uid', exp: now + 3600, iat: now, auth_time: now, firebase: { sign_in_provider: 'google.com' } };
const tokenFor = (overrides = {}) => `header.${Buffer.from(JSON.stringify({ ...claims, ...overrides })).toString('base64url')}.signature`;
const values = { name: 'Test Person', email: 'test@example.com', city: 'Test City', consent: 'yes', consentVersion: '2026-09-22', requestId, idToken: tokenFor() };

function fixture() {
  const rows = [];
  const cached = new Map();
  const state = { available: true, config: true, released: false, failFlush: false, authStatus: 200, authThrows: false,
    account: { localId: 'test-uid', email: 'test@example.com', emailVerified: true, disabled: false, validSince: String(now - 100) } };
  const sheet = {
    getLastRow: () => rows.length,
    getLastColumn: () => (rows[0] ? rows[0].length : 0),
    appendRow: (row) => rows.push([...row]),
    setFrozenRows: () => {},
    getRange: (r, c, height, width) => ({ getValues: () => rows.slice(r - 1, r - 1 + height).map(row => row.slice(c - 1, c - 1 + width)) }),
  };
  const context = vm.createContext({
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => state.config ? 'private-sheet-id' : null }) },
    UrlFetchApp: { fetch: (url, options) => {
      assert(url.startsWith('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='));
      assert.equal(options.method, 'post');
      assert.equal(options.contentType, 'application/json');
      assert.equal(typeof JSON.parse(options.payload).idToken, 'string');
      if (state.authThrows) throw new Error('Network unavailable');
      return { getResponseCode: () => state.authStatus, getContentText: () => JSON.stringify({ users: [state.account] }) };
    } },
    Utilities: { base64DecodeWebSafe: text => Buffer.from(text, 'base64url'), newBlob: bytes => ({ getDataAsString: () => bytes.toString('utf8') }) },
    CacheService: { getScriptCache: () => ({ get: key => cached.get(key), put: (key, value) => cached.set(key, value) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => state.available, waitLock: () => {}, releaseLock: () => { state.released = true; } }) },
    SpreadsheetApp: {
      openById: () => ({ getSheetByName: () => sheet, insertSheet: () => sheet }),
      flush: () => { if (state.failFlush) throw new Error('private-sheet-id-sensitive-details'); },
    },
  });
  vm.runInContext(source, context);
  return { rows, state, post: (override = {}) => context.doPost({ contentLength: 250, parameter: { ...values, ...override } }), context };
}

const valid = fixture();
assert.deepEqual(valid.post(), { status: 'success', ok: true, requestId, duplicate: false });
assert.equal(valid.rows.length, 2);
assert.equal(valid.rows[1][2], 'test@example.com');
assert.equal(valid.rows[1][6], 'yes');
assert(valid.state.released);
assert.deepEqual(valid.post({ email: 'TEST@EXAMPLE.COM' }), { status: 'success', ok: true, requestId, duplicate: true });
assert.equal(valid.rows.length, 2, 'Repeat emails must not append twice');

const passwordOk = fixture();
assert.equal(passwordOk.post({ idToken: tokenFor({ firebase: { sign_in_provider: 'password' } }) }).ok, true);

for (const input of [{ consent: '' }, { consentVersion: 'old' }, { name: '' }, { email: 'invalid' }, { website: 'bot' }, { city: 'x'.repeat(101) }, { name: 'bad\nname' }]) {
  const test = fixture();
  assert.equal(test.post(input).ok, false);
  assert.equal(test.rows.length, 0, 'Invalid input must not touch the sheet');
}
const formula = fixture();
formula.post({ name: '=IMPORTXML("bad")', city: '+formula' });
assert.equal(formula.rows[1][1], '\'=IMPORTXML("bad")');
assert.equal(formula.rows[1][4], '\'+formula');
const busy = fixture();
busy.state.available = false;
assert.equal(busy.post().code, 'BUSY');
assert.equal(busy.rows.length, 0);
const missing = fixture();
missing.state.config = false;
assert.deepEqual(missing.post(), { status: 'error', ok: false, code: 'UNAVAILABLE' });
assert(missing.state.released);
const existing = fixture();
existing.rows.push(['Do not overwrite']);
assert.equal(existing.post().ok, false);
assert.deepEqual(existing.rows, [['Do not overwrite']]);
const uncertain = fixture();
uncertain.state.failFlush = true;
assert.deepEqual(uncertain.post(), { status: 'error', ok: false, code: 'UNAVAILABLE' });
uncertain.state.failFlush = false;
assert.equal(uncertain.post().ok, true);
assert.equal(uncertain.rows.length, 2, 'Retry after uncertain write must deduplicate');
const limited = fixture();
for (let n = 0; n < 60; n++) assert.equal(limited.post().ok, true);
assert.equal(limited.post().code, 'BUSY');
assert.deepEqual(valid.context.doGet(), { status: 'success', ok: true, service: 'loom-care-waitlist', version: 5, authentication: 'firebase' });
for (const idToken of ['', 'forged', tokenFor({ aud: 'another-project' }), tokenFor({ iss: 'https://evil.example' }),
  tokenFor({ exp: now - 1 }), tokenFor({ exp: '9999999999' }), tokenFor({ sub: 'other-user' }),
  tokenFor({ firebase: { sign_in_provider: 'facebook.com' } }), tokenFor({ firebase: null }),
  tokenFor({ auth_time: now - 200 }), tokenFor({ iat: now + 1000 }), tokenFor({ auth_time: null }),
  'header.not-json.signature']) {
  const rejected = fixture();
  assert.equal(rejected.post({ idToken }).code, 'AUTH_REQUIRED');
  assert.equal(rejected.rows.length, 0, 'Untrusted identity must never access the sheet');
}
for (const account of [{ disabled: true }, { email: 'someone-else@example.com' }, { localId: 'wrong-uid' }]) {
  const rejected = fixture();
  Object.assign(rejected.state.account, account);
  assert.equal(rejected.post().code, 'AUTH_REQUIRED');
  assert.equal(rejected.rows.length, 0);
}
const unverifiedGoogle = fixture();
unverifiedGoogle.state.account.emailVerified = false;
assert.equal(unverifiedGoogle.post().code, 'AUTH_REQUIRED');
const unverifiedPassword = fixture();
unverifiedPassword.state.account.emailVerified = false;
assert.equal(unverifiedPassword.post({ idToken: tokenFor({ firebase: { sign_in_provider: 'password' } }) }).ok, true);
for (const authStatus of [400, 401, 403, 429, 500]) {
  const rejected = fixture();
  rejected.state.authStatus = authStatus;
  assert.equal(rejected.post().ok, false);
  assert.equal(rejected.rows.length, 0, 'Firebase failures must fail closed');
}
const disconnected = fixture();
disconnected.state.authThrows = true;
assert.equal(disconnected.post().code, 'UNAVAILABLE');
assert.equal(disconnected.rows.length, 0);
assert(!JSON.stringify(valid.rows).includes(values.idToken), 'Never persist credentials');
console.log('Firebase identity rejection: missing/forged/expired/wrong-project/untrusted-provider/revoked/disabled/mismatched email and service outages passed (mocked).');
console.log('Apps Script validation, consent, deduplication, formula escaping, locking, quota guard and safe errors passed.');

const js = ts.transpileModule(readFileSync('lib/waitlist.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { getWaitlistEndpoint, submitWaitlist } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const endpoint = 'https://script.google.com/macros/s/EXAMPLE_ID/exec';
assert.equal(getWaitlistEndpoint(endpoint), endpoint);
for (const bad of [undefined, '', 'javascript:alert(1)', 'https://example.com', 'https://script.google.com/macros/s/EXAMPLE_ID/dev', `${endpoint}?token=private`, 'https://secret@script.google.com/macros/s/EXAMPLE_ID/exec']) assert.equal(getWaitlistEndpoint(bad), null);
await submitWaitlist(endpoint, values, async (url, options) => {
  assert.equal(url, endpoint);
  assert.equal(typeof options.body, 'string');
  const parsed = JSON.parse(options.body);
  assert.equal(parsed.consent, 'yes');
  assert.equal(parsed.consentVersion, '2026-09-22');
  assert.equal(parsed.idToken, values.idToken);
  assert.equal(options.credentials, 'omit');
  assert.notEqual(options.mode, 'no-cors');
  return Response.json({ status: 'success', ok: true, requestId });
});
for (const response of [Response.json({ ok: false }), Response.json({ ok: true, requestId: 'wrong' }), new Response('login page'), new Response('', { status: 500 })]) {
  await assert.rejects(submitWaitlist(endpoint, values, async () => response));
}
await assert.rejects(submitWaitlist(endpoint, values, async () => Response.json({ ok: false, code: 'BUSY' })), /busy/);
await assert.rejects(submitWaitlist(endpoint, values, async () => Response.json({ ok: false, code: 'AUTH_REQUIRED' })), /auth-required/);
await assert.rejects(submitWaitlist(endpoint, { ...values, idToken: '' }, async () => { assert.fail('Must not send an anonymous request'); }), /auth-required/);
await assert.rejects(submitWaitlist(endpoint, values, async () => { throw new TypeError('Network unavailable'); }));
console.log('Client endpoint validation, acknowledged success, rejected failures and retry states passed.');
