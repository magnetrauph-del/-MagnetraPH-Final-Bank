// Local only: node --experimental-vm-modules tests/auth-logout.test.cjs
// Loads the actual Auth Core with in-memory Firebase, storage, timers and navigation.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../public/auth-core-shared.js'), 'utf8');
const A = { uid: 'account-A', email: 'a@example.invalid', emailVerified: true, providerData: [{ providerId: 'password' }] };
const B = { ...A, uid: 'account-B', email: 'b@example.invalid' };
const flush = () => new Promise(resolve => setImmediate(resolve));
function storage(initial) {
  const value = { ...initial };
  Object.defineProperties(value, {
    getItem: { value: key => Object.hasOwn(value, key) ? value[key] : null },
    setItem: { value: (key, item) => { value[key] = String(item); } },
    removeItem: { value: key => { delete value[key]; } },
    clear: { value: () => { for (const key of Object.keys(value)) delete value[key]; } },
  });
  return value;
}
async function harness() {
  const auth = { currentUser: { ...A }, authStateReady: async () => {} };
  const local = storage({ mag_bizprofile: 'private fixture', mgpref_theme: 'dark', mgpref_lang: 'en' });
  const session = storage({ mag_profile_ok: '1', privateFixture: 'editor fixture' });
  const redirects = [], observers = [], intervals = new Map(), events = new Map();
  let now = 100000, nextTimer = 0, attempts = 0;
  const notify = user => { auth.currentUser = user; for (const cb of [...observers]) cb(user); };
  let behavior = async () => { notify(null); };
  const window = {
    addEventListener(type, cb) { if (!events.has(type)) events.set(type, new Set()); events.get(type).add(cb); },
    removeEventListener(type, cb) { events.get(type)?.delete(cb); },
  };
  const context = vm.createContext({
    window, document: { documentElement: { style: {} } }, navigator: { userAgent: 'local fixture' },
    localStorage: local, sessionStorage: session,
    location: { origin: 'https://fixture.invalid', replace: url => redirects.push(url) },
    Date: class extends Date { static now() { return now; } },
    setInterval: cb => { const id = ++nextTimer; intervals.set(id, cb); return id; },
    clearInterval: id => intervals.delete(id), setTimeout: () => ++nextTimer, clearTimeout: () => {},
    URL, Headers, AbortSignal,
    fetch: () => { throw Error('Unexpected network request in local test'); },
  });
  const sdk = Object.fromEntries([
    'createUserWithEmailAndPassword', 'signInWithEmailAndPassword', 'sendEmailVerification',
    'signInWithPopup', 'signInWithRedirect', 'getRedirectResult', 'reauthenticateWithPopup',
    'sendPasswordResetEmail', 'updatePassword', 'deleteUser', 'reauthenticateWithCredential',
  ].map(name => [name, async () => {}]));
  sdk.signOut = () => { attempts += 1; return behavior(); };
  sdk.GoogleAuthProvider = class { setCustomParameters() {} };
  sdk.EmailAuthProvider = { credential: () => ({}) };
  sdk.onAuthStateChanged = (_, cb) => { observers.push(cb); queueMicrotask(() => cb(auth.currentUser)); return () => {}; };
  const module = new vm.SourceTextModule(source, { context, identifier: 'auth-core-shared.js' });
  await module.link(specifier => {
    const exports = specifier === './firebase-init.js' ? { auth, API_BASE: 'https://fixture.invalid' }
      : specifier === './appcheck-shared.js' ? { getAppCheckToken: async () => null } : sdk;
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return {
    api: module.namespace, auth, local, session, redirects, intervals, notify,
    attempts: () => attempts, setBehavior: fn => { behavior = fn; },
    async guard() { module.namespace.guardDashboard(() => {}, { idleMinutes: 1 }); await flush(); },
    async tickIdle() { now += 61000; for (const cb of [...intervals.values()]) cb(); await flush(); },
  };
}

test('confirmed sign-out clears private storage, retains preferences and redirects once', async () => {
  const h = await harness(); await h.guard();
  await h.api.logout();
  assert.equal(h.auth.currentUser, null);
  assert.equal(h.local.getItem('mag_bizprofile'), null);
  assert.equal(h.session.getItem('privateFixture'), null);
  assert.equal(h.local.getItem('mgpref_theme'), 'dark');
  assert.equal(h.local.getItem('mgpref_lang'), 'en');
  assert.deepEqual(h.redirects, ['/login.html']);
  assert.equal(h.intervals.size, 0);
});

test('a null Auth event does not redirect until the SDK promise confirms success', async () => {
  const h = await harness(); await h.guard(); let complete;
  h.setBehavior(() => new Promise(resolve => { complete = resolve; }));
  const pending = h.api.logout(); await flush(); h.notify(null);
  assert.deepEqual(h.redirects, []);
  assert.equal(h.session.getItem('privateFixture'), 'editor fixture');
  complete(); await pending;
  assert.deepEqual(h.redirects, ['/login.html']);
});

test('rejection preserves auth, private data, idle protection and returns only a safe error', async () => {
  const h = await harness(); await h.guard();
  h.setBehavior(async () => { throw Error('private provider details must not escape'); });
  await assert.rejects(h.api.logout(), error => error.code === 'app/logout-failed' && !error.message.includes('private provider'));
  assert.equal(h.auth.currentUser.uid, A.uid);
  assert.equal(h.local.getItem('mag_bizprofile'), 'private fixture');
  assert.equal(h.session.getItem('privateFixture'), 'editor fixture');
  assert.deepEqual(h.redirects, []);
  assert.equal(h.intervals.size, 1);
});

test('retry after rejection succeeds using the same module', async () => {
  const h = await harness();
  h.setBehavior(async () => { throw Error('fixture failure'); });
  await assert.rejects(h.api.logout());
  h.setBehavior(async () => { h.notify(null); });
  await h.api.logout();
  assert.equal(h.attempts(), 2);
  assert.deepEqual(h.redirects, ['/login.html']);
});

test('synchronous SDK throw also permits retry', async () => {
  const h = await harness();
  h.setBehavior(() => { throw Error('synchronous fixture failure'); });
  await assert.rejects(h.api.logout());
  h.setBehavior(async () => { h.notify(null); });
  await h.api.logout();
  assert.equal(h.attempts(), 2);
});

test('concurrent callers await one SDK outcome; no redirect while pending', async () => {
  const h = await harness(); let fail;
  h.setBehavior(() => new Promise((_, reject) => { fail = reject; }));
  const first = h.api.logout(), second = h.api.logout();
  assert.equal(first, second);
  const rejected = Promise.allSettled([first, second]);
  await flush();
  assert.equal(h.attempts(), 1);
  assert.deepEqual(h.redirects, []);
  fail(Error('fixture failure'));
  assert((await rejected).every(result => result.status === 'rejected'));
});

test('SDK resolution with a still-active or switched account is not treated as signed out', async () => {
  const h = await harness();
  h.setBehavior(async () => { h.notify({ ...B }); });
  await assert.rejects(h.api.logout(), error => error.code === 'app/logout-failed');
  assert.equal(h.auth.currentUser.uid, B.uid);
  assert.equal(h.session.getItem('privateFixture'), 'editor fixture');
  assert.deepEqual(h.redirects, []);
});

test('account switch during a failed attempt keeps the new account, then permits its sign-out', async () => {
  const h = await harness(); await h.guard(); let fail;
  h.setBehavior(() => new Promise((_, reject) => { fail = reject; }));
  const rejected = assert.rejects(h.api.logout()); await flush();
  h.notify({ ...B }); fail(Error('fixture failure')); await rejected;
  assert.equal(h.auth.currentUser.uid, B.uid);
  assert.deepEqual(h.redirects, []);
  h.setBehavior(async () => { h.notify(null); });
  await h.api.logout();
  assert.equal(h.auth.currentUser, null);
});

test('failed logout releases the guard so subsequent invalidation and verification changes are enforced', async () => {
  for (const next of [null, { ...A, emailVerified: false }]) {
    const h = await harness(); await h.guard();
    h.setBehavior(async () => { throw Error('fixture failure'); });
    await assert.rejects(h.api.logout()); h.notify(next);
    assert.deepEqual(h.redirects, [next ? '/login.html?verify=1' : '/login.html']);
  }
});

test('automatic idle rejection stays handled and retryable without discarding the session', async () => {
  const h = await harness(); await h.guard();
  h.setBehavior(async () => { throw Error('fixture failure'); });
  await h.tickIdle();
  assert.equal(h.attempts(), 1);
  assert.equal(h.intervals.size, 1);
  assert.deepEqual(h.redirects, []);
  h.setBehavior(async () => { h.notify(null); });
  await h.tickIdle();
  assert.equal(h.attempts(), 2);
  assert.deepEqual(h.redirects, ['/login.html']);
});
