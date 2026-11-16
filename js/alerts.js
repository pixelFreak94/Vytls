// alerts.js — every alert rule and the alert screen (DEV_PLAN §6, manual §28.9). LEAD MODEL ONLY.
// Safety rules (CLAUDE.md): the movement alert may become more cautious, never less. No "don't show
// again", no softened wording, no hard-coded thresholds: every number comes from settings.
//
// Triggers:
//   A1  a count's window passes below the goal          (kicks.js closes it → onSessionEnd → here)
//   A2  the goal is reached, but much slower than usual  (median of her last completed counts)
//   A3  she raises it herself                            (the red pill on Today and on the counter)
//   A4  she ends a count early below the goal and answers yes to "is the baby moving less than usual?"

import * as store from './store.js';

const HEADLINE = 'Contact your doctor!';                         // DECISIONS 20
const LINE = "If you can't reach them, go to the hospital.";      // DECISIONS 25
export const RAISE_LABEL = 'Baby moving less than usual?';        // DEV_PLAN §6 A3
export const ASK_LESS = 'Is the baby moving less than usual?';    // DEV_PLAN §6 A4

const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (v != null && v !== false) n.setAttribute(k, v);
  }
  n.append(...kids);
  return n;
};

const tokenMs = (name) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
};

const PHONE = '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3.6 1.5h2.1l1.1 3.2-1.5 1.1a8.6 8.6 0 0 0 4.9 4.9l1.1-1.5 3.2 1.1v2.1c0 .9-.7 1.6-1.6 1.6C6.8 14 2 9.2 2 3.1c0-.9.7-1.6 1.6-1.6z"/></svg>';
const MARK = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a1.2 1.2 0 0 1 1.2 1.2v6.1a1.2 1.2 0 0 1-2.4 0V2.7A1.2 1.2 0 0 1 8 1.5zm0 9.7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>';

// ---- the alert screen ------------------------------------------------------

let screen = null;

/** Show the alert at once, above everything, and record it. rule: 'A1'..'A4'. */
export function raiseAlert(rule, ctx = {}) {
  store.update((d) => { d.alerts.push({ at: Date.now(), rule, key: ctx.key ?? null, meal: ctx.meal ?? null }); });
  if (screen) return;   // already on screen; the record above still counts this trigger

  const shownAt = performance.now();
  const guard = tokenMs('--alert-guard') || 500;
  const phone = store.get().settings.doctorPhone.replace(/[^\d+]/g, '');

  const call = el('a', { class: 'alert-call', href: phone ? `tel:${phone}` : null, role: 'button' });
  call.innerHTML = PHONE;
  call.append(el('span', { text: 'Call doctor' }));
  const close = el('button', { class: 'alert-close', type: 'button', text: 'Close' });

  screen = el('div', { class: 'alert', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'alert-h', 'aria-describedby': 'alert-p' },
    el('div', { class: 'alert-words' },
      el('h2', { class: 'alert-head', id: 'alert-h', text: HEADLINE }),
      el('p', { class: 'alert-line', id: 'alert-p', text: LINE })),
    el('div', { class: 'alert-actions' }, call, close));

  // Tap guard (manual §28.9): for the first 500ms every touch is ignored, and a touch that BEGAN
  // before that never counts, even if the finger lifts later. Only a press that starts after the
  // guard can act.
  let armedPress = false;
  const onDown = () => { armedPress = performance.now() - shownAt >= guard; };
  const gate = (e) => {
    // a keyboard press (detail 0) has no pointerdown; it counts once the guard has passed
    const ok = armedPress || (e.detail === 0 && performance.now() - shownAt >= guard);
    armedPress = false;
    if (!ok) { e.preventDefault(); e.stopPropagation(); }
    return ok;
  };
  screen.addEventListener('pointerdown', onDown, true);
  call.addEventListener('click', (e) => { gate(e); });            // a live press follows the tel: link
  close.addEventListener('click', (e) => { if (gate(e)) dismiss(); });
  screen.addEventListener('keydown', (e) => { if (e.key === 'Escape') e.preventDefault(); });   // Close needs a deliberate press

  document.body.append(screen);
  document.documentElement.classList.add('is-alerting');
  close.focus({ preventScroll: true });
}

function dismiss() {
  screen?.remove();
  screen = null;
  document.documentElement.classList.remove('is-alerting');
}

export const alertShowing = () => !!screen;

// ---- A2: slower than her usual ---------------------------------------------

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Minutes-to-goal of her completed counts that ended before `before`, newest first. */
function pastDurations(before) {
  const out = [];
  for (const day of Object.values(store.get().days)) {
    for (const meal of store.MEALS) {
      const k = day.meals?.[meal]?.kicks;
      if (k?.outcome === 'reached' && k.endedAt < before) out.push({ end: k.endedAt, ms: k.endedAt - k.startedAt });
    }
  }
  return out.sort((a, b) => b.end - a.end);
}

/** A2 test, exported for checking by hand. */
export function slowerThanUsual(kicks) {
  const { factor, extraMinutes, lastSessions, minSessions } = store.get().settings.slowAlert;
  const past = pastDurations(kicks.endedAt).slice(0, lastSessions).map((p) => p.ms);
  if (past.length < minSessions) return false;
  const usual = median(past);
  const took = kicks.endedAt - kicks.startedAt;
  return took > factor * usual && took > usual + extraMinutes * 60000;
}

/** Called by kicks.js whenever a count ends (A1, A2). */
export function onCountEnded({ key, meal, kicks }) {
  if (kicks.outcome === 'window-expired') raiseAlert('A1', { key, meal });
  else if (kicks.outcome === 'reached' && slowerThanUsual(kicks)) raiseAlert('A2', { key, meal });
}

// ---- A3: the raise control ---------------------------------------------------

/** The red pill that opens the alert by hand (manual §28.9). Never collapsed into a menu. */
export function raiseButton(ctx = {}) {
  const b = el('button', { class: 'alert-raise', type: 'button' });
  b.innerHTML = MARK;
  b.append(el('span', { text: RAISE_LABEL }));
  b.addEventListener('click', () => raiseAlert('A3', ctx));
  return b;
}
