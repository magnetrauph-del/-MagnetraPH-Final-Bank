// Small deterministic workflow state. Validation stays with the existing Studio validator.
const STEPS = [1, 2, 3, 4];
const SOURCES = new Set(['user', 'system', 'restored', 'display']);
export function createWorkflow() {
  let epoch = 0, revision = 0, steps = [], activeStep = 1, highestReached = 1;
  const token = () => Object.freeze({epoch, revision});
  function current(ticket) { return !!ticket && ticket.epoch === epoch && ticket.revision === revision; }
  function reset(signatures = [], requirements = []) {
    epoch++; revision++;
    activeStep = highestReached = 1;
    steps = STEPS.map((_, i) => ({signature: signatures[i], revision: 0,
      origin: 'system', confirmed: null, attempted: false, continueError: null, visited: i === 0,
      requirements: {...requirements[i]}, evidence: {}, outcome: 'pending',
      incompleteExposed: false, pendingDeparture: false, everComplete: false}));
    return token();
  }
  function sync(signatures, source = 'system', affected = STEPS, ticket, {requirements, evidence = {}} = {}) {
    if (!SOURCES.has(source)) throw new TypeError('Unknown workflow source');
    if (ticket && !current(ticket)) return false;
    if (source === 'display') return true;
    for (const at of affected) {
      const s = steps[at - 1], next = signatures[at - 1];
      if (next === s.signature) continue;
      const facts = requirements?.[at - 1] || s.requirements;
      // Only the owning user action may attest changed required work. Optional
      // events cannot claim a delayed system default seen in the same snapshot.
      if (source === 'user') for (const key of evidence[at] || []) {
        if (facts[key] !== undefined && facts[key] !== s.requirements[key]) s.evidence[key] = facts[key];
      }
      s.requirements = {...facts};
      s.signature = next; s.revision++; s.origin = source; revision++;
      s.outcome = 'pending'; // Previous validation cannot certify a new revision.
    }
    return true;
  }
  function confirm(affected, valid, ticket) {
    if (!current(ticket) || affected.some(at => !valid[at - 1] || steps[at - 1].outcome !== 'valid')) return false;
    for (const at of affected) {
      const s = steps[at - 1];
      s.confirmed = s.signature; s.evidence = {...s.evidence, ...s.requirements}; s.everComplete = true;
    }
    return true;
  }
  function confirmed(at) {
    const s = steps[at - 1];
    return s.outcome === 'valid' && s.confirmed !== null && s.confirmed === s.signature;
  }
  function assess(outcomes, ticket, contentErrors = []) {
    if (ticket && !current(ticket)) return false;
    for (const at of STEPS) {
      const s = steps[at - 1]; s.outcome = outcomes[at - 1];
      // Continue owns only the rejected content problem. Generate history stays
      // independent when that problem is corrected or a different field fails.
      if (s.outcome === 'valid' || s.continueError !== contentErrors[at - 1]) s.continueError = null;
      if (s.outcome === 'valid') { s.incompleteExposed = false; s.pendingDeparture = false; }
      if (s.outcome === 'invalid' && s.pendingDeparture) { s.incompleteExposed = true; s.pendingDeparture = false; }
      if (complete(at)) s.everComplete = true;
    }
    return true;
  }
  function complete(at) {
    const s = steps[at - 1];
    const keys = Object.keys(s.requirements);
    return s.outcome === 'valid' && (confirmed(at) || (keys.length > 0 && keys.every(k => s.evidence[k] === s.requirements[k])));
  }
  function status(at) {
    const s = steps[at - 1];
    if (s.outcome === 'invalid' && (s.attempted || s.continueError)) return 'invalid';
    if (complete(at)) return 'complete';
    return s.outcome === 'invalid' && (s.everComplete || s.incompleteExposed) ? 'incomplete' : 'pending';
  }
  function accessible(at) { return STEPS.includes(at) && at <= highestReached; }
  function position() { return Object.freeze({activeStep, highestReached}); }
  function navigate(at) {
    if (!accessible(at)) return false;
    if (at !== activeStep) {
      const before = steps[activeStep - 1];
      if (before.outcome === 'invalid') before.incompleteExposed = true;
      if (before.outcome === 'pending') before.pendingDeparture = true;
    }
    activeStep = at; steps[at - 1].visited = true;
    return true;
  }
  function proceed(ticket) {
    const s = steps[activeStep - 1];
    if (!current(ticket) || activeStep === 4) return false;
    if (s.outcome !== 'valid') {
      if (s.outcome === 'invalid') s.incompleteExposed = true;
      return false;
    }
    if (!confirm([activeStep], STEPS.map(at => steps[at - 1].outcome === 'valid'), ticket)) return false;
    highestReached = Math.max(highestReached, activeStep + 1);
    return true;
  }
  function view(at) {
    const s = steps[at - 1];
    return Object.freeze({...s, requirements: Object.freeze({...s.requirements}), evidence: Object.freeze({...s.evidence}), epoch});
  }
  function attempt(affected = STEPS) { for (const at of affected) steps[at - 1].attempted = true; }
  function rejectContent(at, error, ticket) {
    if (!current(ticket) || at !== activeStep || steps[at - 1].outcome !== 'invalid' || !error) return false;
    steps[at - 1].continueError = error;
    return true;
  }
  reset();
  return Object.freeze({reset, sync, confirm, confirmed, assess, status, view, attempt, rejectContent, token, current,
    accessible, position, navigate, proceed});
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
