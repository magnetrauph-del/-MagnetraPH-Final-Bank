// Existing local Playwright/Chromium only. No packages or remote services required.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
// Run: node tests/help-center.browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:8876';
const out = process.env.MAGNETRA_HELP_ARTIFACTS || '/tmp/magnetra-help-review';
fs.mkdirSync(out, { recursive: true });
const results = [], errors = [], external = [], writes = [], serviceLoads = [];
let browser;
async function env({ lang = 'en', theme = 'light', width = 390, blockedStorage = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(({ lang, theme, blockedStorage }) => {
    if (blockedStorage) {
      const deny = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
      Object.defineProperty(window, 'localStorage', { get: deny });
    } else {
      // The context also initializes an opaque about:blank document before localhost.
      try {
        if (!localStorage.getItem('mgpref_lang')) localStorage.setItem('mgpref_lang', lang);
        if (!localStorage.getItem('mgpref_theme')) localStorage.setItem('mgpref_theme', theme);
      } catch {}
    }
  }, { lang, theme, blockedStorage });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== base) { external.push(url.origin); return route.abort(); }
    if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.method() + ' ' + url.pathname);
    if (/firebase-init|auth-core|appcheck|profile-name/.test(url.pathname)) serviceLoads.push(url.pathname);
    return route.continue();
  });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  const page = await context.newPage();
  await page.goto(base + '/help.html' + (blockedStorage ? '?lang=en' : ''));
  await page.locator('.help-question').first().waitFor();
  return { context, page };
}
async function test(name, fn) { await fn(); results.push({ name, result: 'PASS' }); console.log('PASS', name); }
async function readyAnswer(page) { await page.waitForURL('**/help-answer.html?*'); await page.locator('#hAnswerTitle').waitFor(); }
async function noOverflow(page) { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow: ' + page.url()); }
async function doubleText(page) {
  await page.evaluate(() => {
    const nodes = [document.documentElement, ...document.querySelectorAll('body *')].filter(node => node instanceof HTMLElement);
    const sizes = nodes.map(node => parseFloat(getComputedStyle(node).fontSize) * 2);
    nodes.forEach((node, index) => { node.style.fontSize = sizes[index] + 'px'; });
  });
}
(async () => {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    await test('One question-list surface per topic, native article links, no accordions/arrows or fake content', async () => {
      const { context, page } = await env();
      assert.equal(await page.locator('.help-topic').count(), 7);
      assert.equal(await page.locator('.help-question-list').count(), 7);
      assert.equal(await page.locator('#hTopics details,#hTopics summary,#hTopics [aria-expanded]').count(), 0);
      assert.equal(await page.locator('#hTopics svg').count(), 0);
      assert.equal(await page.locator('.help-question').first().evaluate(node => getComputedStyle(node).fontWeight), '400');
      assert.equal(await page.locator('.help-footer').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(0, 0, 0)');
      assert.equal(await page.locator('#hSupportNote').textContent(), 'Share a question or suggestion.');
      assert.equal(await page.locator('#fPrivacy').getAttribute('href'), '/privacy.html');
      assert.equal(await page.locator('#fTerms').getAttribute('href'), '/terms.html');
      for (const href of await page.locator('.help-question').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) assert(href.startsWith('/help-answer.html?question='));
      const text = await page.locator('body').innerText();
      assert(!/maya|hotline|regulated|insured|24\/7/i.test(text));
      await context.close();
    });
    await test('Language changes keep the same article, complete answer and Back destination', async () => {
      const { context, page } = await env();
      await page.locator('#q-banner-unsaved-work').click(); await readyAnswer(page);
      const expected = {
        en: 'Will my unfinished Banner be saved?',
        fil: 'Mase-save ba ang hindi ko pa tapos na Banner?',
        tl: 'Mase-save ba ang Banner na hindi pa tapos?',
      };
      for (const lang of ['fil', 'tl', 'en']) {
        await page.locator('#helpLanguage').selectOption(lang);
        assert.equal(new URL(page.url()).searchParams.get('question'), 'banner-unsaved-work');
        assert.equal(await page.locator('#hAnswerTitle').textContent(), expected[lang]);
        assert((await page.locator('#hAnswerBody').textContent()).includes('Keep editing'));
        await page.reload();
        assert.equal(await page.locator('#hAnswerTitle').textContent(), expected[lang]);
        assert.equal(await page.locator('#helpLanguage').inputValue(), lang);
      }
      await page.locator('#answerBack').click(); await page.waitForURL('**/help.html');
      await page.waitForFunction(() => document.activeElement?.id === 'q-banner-unsaved-work');
      await context.close();
    });
    await test('Every question opens a real reloadable answer document in all three languages', async () => {
      for (const lang of ['en', 'fil', 'tl']) {
        const { context, page } = await env({ lang });
        const questions = await page.locator('.help-question').evaluateAll(nodes => nodes.map(node => ({ href: node.getAttribute('href'), text: node.textContent })));
        for (const question of questions) {
          const response = await page.goto(base + question.href);
          assert.equal(response.status(), 200);
          await page.locator('#hAnswerTitle').waitFor();
          assert.equal(await page.locator('#hAnswerTitle').textContent(), question.text);
          assert((await page.locator('#hAnswerBody').textContent()).length > 40);
          assert.equal(await page.locator('html').getAttribute('lang'), lang);
          assert.equal(await page.locator('details,summary').count(), 0);
        }
        await page.reload();
        assert.equal(await page.locator('#hAnswerTitle').textContent(), questions.at(-1).text);
        await context.close();
      }
    });
    await test('Visible Back, browser Back and Forward restore question, scroll, focus and search', async () => {
      const { context, page } = await env();
      await page.locator('#q-banner-unsaved-work').scrollIntoViewIfNeeded();
      const top = await page.evaluate(() => scrollY);
      await page.locator('#q-banner-unsaved-work').click(); await readyAnswer(page);
      await page.locator('#answerBack').click(); await page.waitForURL('**/help.html');
      await page.waitForFunction(() => document.activeElement?.id === 'q-banner-unsaved-work');
      assert(Math.abs(await page.evaluate(() => scrollY) - top) < 8);
      await page.goForward(); await readyAnswer(page);
      await page.goBack(); await page.waitForURL('**/help.html');
      await page.waitForFunction(() => document.activeElement?.id === 'q-banner-unsaved-work');
      await page.locator('#hInput').fill('1080');
      await page.locator('#q-banner-sizes').click(); await readyAnswer(page);
      await page.locator('#backLink').click(); await page.waitForURL('**/help.html');
      assert.equal(await page.locator('#hInput').inputValue(), '1080');
      assert.equal(await page.locator('.help-question').count(), 1);
      await page.locator('#hClear').click();
      assert.equal(await page.locator('.help-topic').count(), 7);
      await context.close();
    });
    await test('Direct answer visits, new tabs, unknown ids and legacy Help hashes have safe destinations', async () => {
      const { context, page } = await env();
      const popupPromise = context.waitForEvent('page');
      await page.locator('#q-banner-download').click({ modifiers: ['Control'] });
      const popup = await popupPromise; await readyAnswer(popup);
      await popup.locator('#answerBack').click(); await popup.waitForURL('**/help.html?*');
      assert.equal(await popup.locator('.help-topic').count(), 7); await popup.close();
      await page.goto(base + '/help-answer.html?question=%3Cscript%3E');
      assert.equal(await page.locator('#hAnswerTitle').textContent(), 'This answer isn’t available.');
      assert.equal(await page.locator('script:not([src])').count(), 0);
      await page.locator('#backLink').click(); await page.waitForURL('**/help.html?*');
      await page.goto(base + '/help.html#banner');
      await page.waitForFunction(() => document.activeElement?.id === 'banner-heading');
      await page.goto(base + '/help.html#faq-2');
      await page.waitForFunction(() => document.activeElement?.id === 'q-password');
      await context.close();
    });
    await test('Feedback retains native focus containment; Back closes it first and Escape restores focus', async () => {
      const { context, page } = await env();
      await page.locator('#q-contact-support').click(); await readyAnswer(page);
      assert.equal(await page.locator('#hSupportAddress').getAttribute('href'), 'mailto:support@magnetra.app');
      await page.locator('#hReport').click();
      assert(await page.locator('#reportDialog').isVisible());
      for (let i = 0; i < 18; i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => document.querySelector('#reportDialog').contains(document.activeElement))); }
      await page.goBack();
      await page.locator('#reportDialog').waitFor({ state: 'hidden' });
      assert(page.url().includes('help-answer.html'));
      assert.equal(await page.evaluate(() => document.activeElement.id), 'hReport');
      await page.locator('#hReport').click(); await page.keyboard.press('Escape');
      await page.locator('#reportDialog').waitFor({ state: 'hidden' });
      await page.waitForFunction(() => !history.state?.mgHelpFeedback);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'hReport');
      await page.goBack(); await page.waitForURL('**/help.html');
      await context.close();
    });
    await test('Storage denial still permits language selection, article navigation and Back', async () => {
      const { context, page } = await env({ blockedStorage: true });
      await page.locator('#helpLanguage').selectOption('tl');
      await page.locator('#q-banner-sizes').click(); await readyAnswer(page);
      assert.equal(await page.locator('html').getAttribute('lang'), 'tl');
      await page.reload(); assert.equal(await page.locator('html').getAttribute('lang'), 'tl');
      await page.locator('#answerBack').click(); await page.waitForURL('**/help.html*');
      assert.equal(await page.locator('#helpLanguage').inputValue(), 'tl');
      await context.close();
    });
    await test('Readable contrast, live preference sync, search safety and reduced-motion behavior', async () => {
      const { context, page } = await env();
      const ratio = await page.locator('.help-question').first().evaluate(node => {
        const luminance = color => {
          const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
          return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
        };
        const a = luminance(getComputedStyle(node).color), b = luminance(getComputedStyle(node.closest('ul')).backgroundColor);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      });
      assert(ratio >= 4.5);
      await page.evaluate(() => {
        window.dispatchEvent(new StorageEvent('storage', { key: 'mgpref_theme', newValue: 'dark' }));
        window.dispatchEvent(new StorageEvent('storage', { key: 'mgpref_lang', newValue: 'tl' }));
      });
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      assert.equal(await page.locator('html').getAttribute('lang'), 'tl');
      await page.locator('#hInput').fill('<script>alert(1)</script>');
      assert(await page.locator('#hNone').isVisible());
      assert.equal(await page.locator('script:not([src])').count(), 0);
      await page.locator('#hNoneClear').click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'hInput');
      assert(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
      assert.equal(await page.locator('h1').count(), 1);
      await context.close();
    });
    await test('200% text keeps the feedback dialog usable in each language; mailto stays user controlled', async () => {
      for (const lang of ['en', 'fil', 'tl']) {
        const { context, page } = await env({ lang, width: 320 });
        await doubleText(page);
        await page.locator('#hReport').click();
        assert(await page.locator('#reportDialog').evaluate(node => node.scrollWidth <= node.clientWidth));
        await page.locator('#reportMsg').fill('Banner Download problem in a local test.');
        await page.evaluate(() => {
          document.addEventListener('click', event => {
            const link = event.target.closest('a');
            if (link?.href.startsWith('mailto:')) { event.preventDefault(); window.__testMailto = link.href; }
          }, true);
        });
        await page.locator('#reportDialog button[type="submit"]').click();
        assert((await page.evaluate(() => window.__testMailto)).startsWith('mailto:support@magnetra.app?'));
        assert(await page.locator('#reportCopyArea').isVisible());
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !history.state?.mgHelpFeedback);
        await noOverflow(page);
        await context.close();
      }
    });
    for (const width of [320, 360, 390, 768, 1280]) for (const lang of ['en', 'fil', 'tl']) for (const theme of ['light', 'dark']) {
      await test(`Layout, language, theme and answer at ${width}px/${lang}/${theme}`, async () => {
        const { context, page } = await env({ width, lang, theme });
        await noOverflow(page);
        assert.equal(await page.locator('html').getAttribute('lang'), lang);
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor), theme === 'dark' ? 'rgb(9, 9, 11)' : 'rgb(248, 248, 250)');
        assert.equal(await page.locator('.help-question-list').first().evaluate(node => getComputedStyle(node).backgroundColor), theme === 'dark' ? 'rgb(25, 25, 30)' : 'rgb(255, 255, 255)');
        const contrast = await page.evaluate(() => {
          const luminance = color => {
            const c = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
            return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
          };
          return [['.help-question', '.help-question-list'], ['.help-topic-title', 'body'], ['.help-footer-note', '.help-footer'], ['#fPrivacy', '.help-footer']].map(([foreground, background]) => {
            const a = luminance(getComputedStyle(document.querySelector(foreground)).color), b = luminance(getComputedStyle(document.querySelector(background)).backgroundColor);
            return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
          });
        });
        assert(Math.min(...contrast) >= 4.5, 'Readable question, heading and footer contrast');
        for (const selector of ['#backLink', '#helpLanguage', '.help-question', '#hReport', '#fPrivacy', '#fTerms']) {
          const box = await page.locator(selector).first().boundingBox(); assert(box.height >= 44, selector);
        }
        if ([390, 1280].includes(width)) {
          await page.screenshot({ path: path.join(out, `help-${width}-${lang}-${theme}.png`) });
          if (width === 390) {
            await page.locator('.help-footer').scrollIntoViewIfNeeded();
            await page.screenshot({ path: path.join(out, `footer-${lang}-${theme}.png`) });
          }
        }
        if (width === 320) { await doubleText(page); await noOverflow(page); }
        await page.locator('#q-banner-unsaved-work').focus();
        await page.keyboard.press('Enter'); await readyAnswer(page);
        if (width === 320) { await doubleText(page); await noOverflow(page); }
        if ([390, 1280].includes(width)) await page.screenshot({ path: path.join(out, `answer-${width}-${lang}-${theme}.png`), fullPage: true });
        await page.locator('#answerBack').click(); await page.waitForURL('**/help.html*');
        await noOverflow(page);
        await context.close();
      });
    }
    assert.deepEqual(errors, []); assert.deepEqual(external, []); assert.deepEqual(writes, []); assert.deepEqual(serviceLoads, []);
    fs.writeFileSync(path.join(out, 'help-center-results.json'), JSON.stringify({ results, errors, externalRequests: external, writeRequests: writes, authOrBackendLoads: serviceLoads, actualAndroid: 'NOT RUN', result: 'PASS' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => {
  console.error(error);
  fs.writeFileSync(path.join(out, 'help-center-results.json'), JSON.stringify({ results, errors, external, writes, serviceLoads, failure: error.message }, null, 2));
  process.exitCode = 1;
});
