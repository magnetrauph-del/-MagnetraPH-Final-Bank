// Small deterministic workflow state. Validation stays with the existing Studio validator.
const STEPS = [1, 2, 3, 4];
const SOURCES = new Set(['user', 'system', 'restored', 'display']);
export function createWorkflow() {
  let epoch = 0, revision = 0, steps = [];
  const token = () => Object.freeze({epoch, revision});
  function current(ticket) { return !!ticket && ticket.epoch === epoch && ticket.revision === revision; }
  function reset(signatures = []) {
    epoch++; revision++;
    steps = STEPS.map((_, i) => ({signature: signatures[i], revision: 0,
      origin: 'system', edited: false, confirmed: null, attempted: false}));
    return token();
  }
  function sync(signatures, source = 'system', affected = STEPS, ticket) {
    if (!SOURCES.has(source)) throw new TypeError('Unknown workflow source');
    if (ticket && !current(ticket)) return false;
    if (source === 'display') return true;
    for (const at of affected) {
      const s = steps[at - 1], next = signatures[at - 1];
      if (next === s.signature) continue;
      s.signature = next; s.revision++; s.origin = source; revision++;
      if (source === 'user') s.edited = true;
    }
    return true;
  }
  function confirm(affected, valid, ticket) {
    if (!current(ticket) || affected.some(at => !valid[at - 1])) return false;
    for (const at of affected) {
      const s = steps[at - 1];
      s.confirmed = s.signature; s.edited = false;
    }
    return true;
  }
  function status(at, valid, ready = true) {
    const s = steps[at - 1];
    if (!valid && s.attempted) return 'invalid';
    if (valid && ready && s.confirmed !== null && s.confirmed === s.signature) return 'complete';
    return s.edited ? 'incomplete' : 'pending';
  }
  function view(at) { return Object.freeze({...steps[at - 1], epoch}); }
  function attempt() { for (const s of steps) s.attempted = true; }
  reset();
  return Object.freeze({reset, sync, confirm, status, view, attempt, token, current});
}

// At most one three-cycle run per step revision, with bounded (four-step) memory.
// Interrupted runs are consumed, not replayed on focus, scroll or tab visibility changes.
export function createAttentionBudget() {
  const spent = new Map();
  return Object.freeze({
    reset() { spent.clear(); },
    claim({step, epoch, revision, ready, visible, documentVisible, reducedMotion}) {
      if (!STEPS.includes(step) || !ready || !visible || !documentVisible || reducedMotion) return false;
      const key = epoch + ':' + revision;
      if (spent.get(step) === key) return false;
      spent.set(step, key);
      return true;
    }
  });
}
