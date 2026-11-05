// Run: node --experimental-vm-modules tests/account-navigation.test.cjs
const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
async function load(file) {
  const m = new vm.SourceTextModule(fs.readFileSync(path.join(__dirname, '../public', file), 'utf8'), { context: vm.createContext({ URL }) });
  await m.link(() => { throw Error('Pure policy modules must not initialize services'); }); await m.evaluate(); return m.namespace;
}
test('Back provenance accepts known same-origin pages and rejects cross-origin, credentials, loops and unknown paths', async () => {
  const { safeAccountReferrer: safe } = await load('account-navigation.js');
  const origin = 'https://magnetra.app', current = origin + '/account.html?section=profile';
  assert.equal(safe(origin + '/dashboard.html', origin, current), origin + '/dashboard.html');
  assert.equal(safe(origin + '/help-answer.html?question=banner-sizes', origin, current), origin + '/help-answer.html?question=banner-sizes');
  for (const value of ['', 'javascript:alert(1)', 'https://evil.invalid/dashboard.html', 'https://a:b@magnetra.app/dashboard.html', origin + '/login.html', origin + '/unknown.html', current]) assert.equal(safe(value, origin, current), null, value);
});
test('shared provider-photo policy allows only the matching Google provider photo on the approved host/path', async () => {
  const { providerPhoto } = await load('provider-photo.js');
  const make = photoURL => ({ uid:'A', email:'a@example.invalid', photoURL, providerData:[{providerId:'google.com',email:'a@example.invalid',photoURL}] });
  assert(providerPhoto(make('https://lh3.googleusercontent.com/a/abc_123=s96-c')));
  for (const url of ['http://lh3.googleusercontent.com/a/abc','https://evil.invalid/a/abc','https://lh3.googleusercontent.com/a/abc?redirect=evil','https://user@lh3.googleusercontent.com/a/abc','https://lh3.googleusercontent.com:444/a/abc','data:image/png;base64,abc','https://lh3.googleusercontent.com/redirect/abc']) assert.equal(providerPhoto(make(url)), null);
  const mismatch = make('https://lh3.googleusercontent.com/a/abc'); mismatch.providerData[0].email='b@example.invalid'; assert.equal(providerPhoto(mismatch),null);
});
