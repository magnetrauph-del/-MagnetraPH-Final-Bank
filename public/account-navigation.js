// Account-page navigation only. No profile values, tokens or drafts are persisted.
const IN_APP = new Set(['/dashboard.html', '/account.html', '/banner.html', '/quote.html', '/followup.html', '/help.html', '/help-answer.html', '/privacy.html', '/terms.html']);
export function safeAccountReferrer(value, origin, current = '') {
  try {
    const url = new URL(value);
    return url.origin === origin && !url.username && !url.password && IN_APP.has(url.pathname) && url.href !== current ? url.href : null;
  } catch { return null; }
}
export function initAccountNavigation({ isDirty, isBusy, discard, confirmLeave, closeConfirm, closeOverlay, announceBusy, previous }) {
  // A reload can retain this page's history checkpoint. Adopt that UI-only marker
  // instead of stacking another checkpoint and making Back revisit the editor.
  const retained = history.state?.mgAccountGuard;
  const id = typeof retained === 'string' && /^[a-z0-9]{1,40}$/.test(retained) ? retained : Math.random().toString(36).slice(2);
  let exiting = false, pending = false, destroyed = false;
  const own = value => value?.mgAccountGuard === id;
  const state = () => history.state && typeof history.state === 'object' ? history.state : {};
  function arm() {
    if (destroyed || exiting || own(history.state)) return;
    try { history.pushState({ ...state(), mgAccountGuard: id }, '', location.href); } catch {}
  }
  async function release() {
    exiting = true;
    if (!own(history.state)) return;
    await new Promise(resolve => {
      let done = false;
      const finish = () => { if (done) return; done = true; clearTimeout(timer); window.removeEventListener('popstate', finish); resolve(); };
      const timer = setTimeout(finish, 300);
      window.addEventListener('popstate', finish);
      try { history.back(); } catch { finish(); }
    });
  }
  async function request(destination) {
    if (destroyed || exiting || pending) return false;
    if (destination === 'back' && closeConfirm()) { arm(); return false; }
    if (destination === 'back' && closeOverlay()) { arm(); return false; }
    if (isBusy()) { announceBusy(); arm(); return false; }
    pending = true;
    try {
      if (isDirty()) {
        arm();
        const allowed = await confirmLeave();
        if (!allowed || destroyed) return false;
        discard();
      }
      await release();
      if (destroyed) return false;
      if (destination === 'back') {
        if (previous && history.length > 1) history.back();
        else location.replace('/dashboard.html');
      } else location.assign(destination);
      return true;
    } finally { pending = false; }
  }
  function onPop(event) {
    if (destroyed || exiting || own(event.state)) return;
    // Back dismisses the uppermost overlay before considering page departure.
    if (closeConfirm()) { arm(); return; }
    if (closeOverlay()) { arm(); return; }
    if (pending) { arm(); return; }
    void request('back');
  }
  function onClick(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || link.hasAttribute('data-account-back') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !IN_APP.has(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) {
      if (!url.hash) event.preventDefault();
      return;
    }
    event.preventDefault();
    void request(url.href);
  }
  function beforeUnload(event) {
    if (!destroyed && !exiting && (isDirty() || isBusy())) { event.preventDefault(); event.returnValue = ''; }
  }
  window.addEventListener('pointerdown', arm, { capture: true, passive: true });
  window.addEventListener('keydown', arm, { capture: true, passive: true });
  window.addEventListener('popstate', onPop);
  window.addEventListener('beforeunload', beforeUnload);
  document.addEventListener('click', onClick);
  return {
    arm, request,
    async release() { await release(); },
    destroy() {
      destroyed = true;
      window.removeEventListener('pointerdown', arm, true);
      window.removeEventListener('keydown', arm, true);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', onClick);
    },
  };
}
