// Run: node --experimental-vm-modules tests/help-content.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
async function content() {
  const m = new vm.SourceTextModule(fs.readFileSync(path.join(__dirname, '../public/help-articles.js'), 'utf8'));
  await m.link(() => { throw Error('Public help content must not initialize services'); });
  await m.evaluate();
  return m.namespace;
}
test('every public question has a unique stable URL id and complete three-language answer', async () => {
  const m = await content();
  const ids = new Set();
  assert.equal(m.HELP_TOPICS.length, 7);
  for (const item of m.HELP_ARTICLES) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert(!ids.has(item.id)); ids.add(item.id);
    assert(m.HELP_TOPICS.some(topic => topic.id === item.topic));
    for (const lang of ['en', 'fil', 'tl']) {
      const text = m.articleText(item, lang);
      assert(text.question.length > 10);
      assert(text.body.length > 0);
      for (const block of text.body) {
        if (typeof block === 'string') assert(block.trim().length > 0);
        else { assert.deepEqual(Object.keys(block).filter(key => !['ol', 'ul'].includes(key)), []); assert(Object.values(block)[0].every(line => typeof line === 'string' && line.trim())); }
      }
    }
  }
  assert.equal(ids.size, 25);
});
test('search finds individual answers and excludes legacy business-management topics', async () => {
  const m = await content();
  for (const [query, lang, expected] of [['1080', 'en', 'banner-sizes'], ['presyo', 'tl', 'banner-text-and-price'], ['password', 'fil', 'password'], ['profile picture', 'en', 'profile-photo']]) assert(m.searchHelpArticles(query, lang).some(item => item.id === expected));
  assert.equal(m.searchHelpArticles('zzzznomatchzz', 'en').length, 0);
  assert(!m.HELP_ARTICLES.some(item => ['quote', 'followup', 'easy-actions', 'inventory', 'crm'].includes(item.topic)));
  assert.equal(m.getHelpArticle('__proto__'), null);
  assert.equal(m.getHelpArticle('<script>'), null);
});
test('natural questions and English product terms find answers in each selected language', async () => {
  const m = await content();
  for (const lang of ['en', 'fil', 'tl']) {
    for (const [query, id] of [['how to download my banner', 'banner-download'], ['how to change my password', 'password'], ['where are my projects saved', 'my-projects']]) assert(m.searchHelpArticles(query, lang).some(item => item.id === id), lang + ': ' + query);
  }
  assert(m.searchHelpArticles('paano mag download ng banner', 'fil').some(item => item.id === 'banner-download'));
  assert(m.searchHelpArticles('paano baguhin ang pangalan', 'tl').some(item => item.id === 'profile-name'));
});
test('Help describes unavailable features and storage honestly without new legal promises', async () => {
  const m = await content();
  const text = id => m.getHelpArticle(id).en.body.filter(x => typeof x === 'string').join(' ');
  assert.match(text('video-availability'), /not available/);
  assert.match(text('my-projects'), /not available/);
  assert.match(text('profile-photo'), /not available/);
  assert.match(text('ask-magnetra'), /not available/);
  assert.match(text('banner-unsaved-work'), /download the PNG before leaving/);
  assert.match(text('banner-unsaved-work'), /not a project you can reopen and edit/);
  assert.match(text('banner-unsaved-work'), /You may lose unfinished work if you reload the page or close the browser/);
  assert.match(text('contact-support'), /cannot confirm delivery/);
  assert.match(text('privacy-and-terms'), /currently published/);
  assert.match(text('account-deletion'), /deletion may be incomplete/);
});
