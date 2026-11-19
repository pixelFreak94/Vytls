// kicks.js — the movement counter (DEV_PLAN §5; manual §28.6, §28.8).
// State lives in the day record (kicks: {startedAt, taps, endedAt, outcome}). The screen only
// displays it: elapsed and remaining time are recomputed from startedAt every second, never counted.
// Alert rules are NOT here; they attach through onSessionEnd (Phase 5, lead).

import * as store from './store.js';
import { onCountEnded, raiseButton, raiseAlert, ASK_LESS } from './alerts.js';

const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  n.append(...kids);
  return n;
};
const pad = (n) => String(n).padStart(2, '0');
const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const endHooks = [];
/** Register fn({key, meal, kicks}); called once whenever a session ends, whatever the outcome. */
export function onSessionEnd(fn) { endHooks.push(fn); }
onSessionEnd(onCountEnded);   // A1 and A2 (alerts.js)

let view = null;   // { key, meal, root, timer, onVis, onPop, ... } while open

const rec = (key, meal) => store.getDay(key).meals[meal].kicks;
const settings = () => store.get().settings.kicks;

function finish(key, meal, endedAt, outcome) {
  const cur = rec(key, meal);
  if (!cur || cur.endedAt) return false;
  store.updateDay(key, (d) => { d.meals[meal].kicks.endedAt = endedAt; d.meals[meal].kicks.outcome = outcome; });
  const kicks = rec(key, meal);
  for (const fn of endHooks) { try { fn({ key, meal, kicks }); } catch (e) { console.error(e); } }
  return true;
}

/** Close the session as window-expired if its window has passed. Returns true if it did. */
function checkWindow(key, meal) {
  const k = rec(key, meal);
  if (!k || k.endedAt) return false;
  const end = k.startedAt + settings().windowMinutes * 60000;
  if (Date.now() < end) return false;
  return finish(key, meal, end, 'window-expired');
}

/** Start (or resume) a session. Returns false if a different session is running.
 *  An unfinished count (ended early) can be counted again: opts.again replaces it with a fresh one. */
export function openCounter(key, meal, { again = false } = {}) {
  if (view) return view.key === key && view.meal === meal;
  const running = store.runningSession();
  if (running && !(running.key === key && running.meal === meal)) return false;
  if (!running) {
    const prev = rec(key, meal);
    if (prev?.endedAt && !(again && prev.outcome === 'ended-early')) return false;   // ended; nothing to resume
    store.updateDay(key, (d) => { d.meals[meal].kicks = { startedAt: Date.now(), taps: [], endedAt: null, outcome: null }; });
  } else if (running.kicks.leftAt) {
    store.updateDay(key, (d) => { delete d.meals[meal].kicks.leftAt; });   // back on the counter
  }
  mount(key, meal);
  return true;
}

/** Clear an unfinished count (ended early), so the step is open again. Finished counts are never cleared. */
export function clearUnfinished(key, meal) {
  const k = rec(key, meal);
  if (!k || k.outcome !== 'ended-early') return false;
  store.updateDay(key, (d) => { d.meals[meal].kicks = null; });
  return true;
}

// A count she has left keeps running on its timestamps. Its window still closes on time while the
// app is open, so the window-passed alert (A1) is never late or skipped (DEV_PLAN §6).
let watchT = null;
export function watchRunning() {
  clearTimeout(watchT);
  const r = store.runningSession();
  if (!r || view) return;
  const end = r.kicks.startedAt + settings().windowMinutes * 60000;
  watchT = setTimeout(() => { if (!checkWindow(r.key, r.meal)) watchRunning(); }, Math.min(Math.max(0, end - Date.now()) + 250, 2 ** 31 - 1));
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && !view) { closeExpired(); watchRunning(); } });

/** Close a running count whose window has passed, without opening the screen. Used at launch so an owed alert shows before the ball. */
export function closeExpired() {
  const r = store.runningSession();
  return r ? checkWindow(r.key, r.meal) : false;
}

/** Reopen the counter if a session is still running. At launch, a count she chose to leave stays
 *  in the background (its window still runs, see watchRunning). */
export function resumeIfRunning({ launch = false } = {}) {
  const r = store.runningSession();
  if (!r) return false;
  if (launch && r.kicks.leftAt) { watchRunning(); return false; }
  return openCounter(r.key, r.meal);
}

function mount(key, meal) {
  const goal = () => settings().goal;
  const title = el('div', { class: 'counter-title', id: 'counter-title', text: `${meal} · movements` });
  const endBtn = el('button', { class: 'counter-pill', type: 'button', text: 'end early' });
  // leave: the count keeps its taps and keeps running; she comes back to it from Today
  const leaveBtn = el('button', { class: 'counter-pill', type: 'button', text: 'leave' });
  const top = el('div', { class: 'counter-top' }, title, el('div', { class: 'counter-actions' }, leaveBtn, endBtn));
  const spine = el('div', { class: 'counter-spine', 'aria-hidden': 'true' });
  const count = el('div', { class: 'counter-count', 'aria-live': 'polite' });
  const elapsed = el('span'); const left = el('span');
  const readout = el('div', { class: 'counter-readout' }, count, el('div', { class: 'counter-times' }, elapsed, left));
  const tap = el('button', { class: 'counter-tap', type: 'button', text: 'felt a movement' });
  const undo = el('button', { class: 'counter-pill', type: 'button', text: 'undo last tap' });
  const foot = el('div', { class: 'counter-foot' });
  // A3: the raise control is always on the counter, at the foot (manual §28.6, §28.9)
  const raise = () => el('div', { class: 'counter-raise' }, raiseButton({ key, meal }));
  const root = el('div', { class: 'counter', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'counter-title' },
    top, spine, readout, tap, el('div', { class: 'counter-foot' }, undo), foot, raise());
  document.body.append(root);

  const v = view = { key, meal, root, timer: null, confirming: false };

  const draw = () => {
    const k = rec(key, meal);
    const g = goal();
    if (!k.endedAt && checkWindow(key, meal)) return drawEnded();
    if (k.endedAt) return drawEnded();
    const n = k.taps.length;
    if (spine.children.length !== g) {
      spine.replaceChildren(...Array.from({ length: g }, () => el('span', { class: 'counter-node' })));
    }
    [...spine.children].forEach((node, i) => node.classList.toggle('is-lit', i < n));
    // the number is the one thing to read; "of 5" supports it
    count.replaceChildren(el('span', { class: 'counter-n', text: String(n) }), el('span', { class: 'counter-of', text: ` of ${g}` }));
    const now = Date.now();
    elapsed.textContent = `${mmss(now - k.startedAt)} elapsed`;
    left.textContent = `${mmss(k.startedAt + settings().windowMinutes * 60000 - now)} left`;
    elapsed.className = 'counter-elapsed';
    undo.disabled = n === 0;
  };

  const drawEnded = () => {
    clearInterval(v.timer);
    const k = rec(key, meal);
    const g = goal();
    const reached = k.outcome === 'reached';
    root.classList.toggle('is-passed', k.outcome === 'window-expired');
    const note = reached ? `${Math.max(1, Math.round((k.endedAt - k.startedAt) / 60000))} min`
      : k.outcome === 'window-expired' ? 'window passed' : 'ended early';
    const done = el('button', { class: 'counter-done', type: 'button', text: 'done' });
    done.addEventListener('click', close);
    root.replaceChildren(
      el('div', { class: 'counter-top' }, el('div', { class: 'counter-title', id: 'counter-title', text: `${meal} · movements` })),
      el('div', { class: 'counter-result' },
        el('div', { class: 'counter-count', text: `${k.taps.length} of ${g}` }),
        el('p', { class: 'counter-note', text: reached ? `${k.taps.length} of ${g} · ${note}` : note })),
      el('div', { class: 'counter-foot' }, done), raise());
    done.focus();
  };
  v.drawEnded = drawEnded;

  tap.addEventListener('click', (e) => {
    const k = rec(key, meal);
    if (k.endedAt) return;
    const now = Date.now();
    if (checkWindow(key, meal)) return drawEnded();
    store.updateDay(key, (d) => { d.meals[meal].kicks.taps.push(now); });
    if (!reduced()) {
      const r = tap.getBoundingClientRect();
      const b = el('span', { class: 'counter-bloom', 'aria-hidden': 'true' });
      b.style.left = `${(e.clientX || r.left + r.width / 2) - r.left}px`;
      b.style.top = `${(e.clientY || r.top + r.height / 2) - r.top}px`;
      tap.append(b);
      b.addEventListener('animationend', () => b.remove());
    }
    if (rec(key, meal).taps.length >= goal()) { finish(key, meal, now, 'reached'); return drawEnded(); }
    draw();
  });

  undo.addEventListener('click', () => {
    const k = rec(key, meal);
    if (k.endedAt || !k.taps.length) return;
    store.updateDay(key, (d) => { d.meals[meal].kicks.taps.pop(); });
    draw();
  });

  leaveBtn.addEventListener('click', () => {
    if (v.confirming || rec(key, meal).endedAt) return;
    if (checkWindow(key, meal)) return drawEnded();
    store.updateDay(key, (d) => { d.meals[meal].kicks.leftAt = Date.now(); });
    close();
  });

  endBtn.addEventListener('click', () => {
    if (v.confirming) return;
    v.confirming = true;
    leaveBtn.hidden = true;
    const yes = el('button', { class: 'counter-pill', type: 'button', text: 'end now' });
    const no = el('button', { class: 'counter-pill', type: 'button', text: 'keep counting' });
    const box = el('div', { class: 'counter-confirm', role: 'group', 'aria-label': 'end early' },
      el('p', { text: 'end this count now?' }), el('div', { class: 'counter-confirm-row' }, yes, no));
    foot.replaceChildren(box);
    endBtn.hidden = true;
    no.addEventListener('click', () => { v.confirming = false; foot.replaceChildren(); endBtn.hidden = false; leaveBtn.hidden = false; tap.focus(); });
    yes.addEventListener('click', () => {
      const endedAt = Date.now();
      const end = (alert) => { finish(key, meal, endedAt, 'ended-early'); close(); if (alert) raiseAlert('A4', { key, meal }); };
      if (rec(key, meal).taps.length >= goal()) return end(false);
      // A4 (DEV_PLAN §6): below the goal, ask before closing. Yes opens the alert.
      const y = el('button', { class: 'counter-pill counter-pill--alert', type: 'button', text: 'yes' });
      const n = el('button', { class: 'counter-pill', type: 'button', text: 'no' });
      y.addEventListener('click', () => end(true));
      n.addEventListener('click', () => end(false));
      foot.replaceChildren(el('div', { class: 'counter-confirm', role: 'group', 'aria-label': ASK_LESS },
        el('p', { class: 'counter-ask', text: ASK_LESS }), el('div', { class: 'counter-confirm-row' }, y, n)));
      y.focus();
    });
    no.focus();
  });

  v.timer = setInterval(draw, 1000);
  v.onVis = () => { if (!document.hidden) draw(); };
  document.addEventListener('visibilitychange', v.onVis);

  // The iPhone back swipe does nothing here (DECISIONS 26): keep one extra history entry.
  history.pushState({ vytlsCounter: true }, '');
  v.onPop = () => { if (view) history.pushState({ vytlsCounter: true }, ''); };
  window.addEventListener('popstate', v.onPop);

  draw();
  if (!rec(key, meal).endedAt) tap.focus();
}

function close() {
  const v = view;
  if (!v) return;
  view = null;
  clearInterval(v.timer);
  document.removeEventListener('visibilitychange', v.onVis);
  window.removeEventListener('popstate', v.onPop);
  v.root.remove();
  if (history.state?.vytlsCounter) history.back();
  watchRunning();
}
