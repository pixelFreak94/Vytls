// kicks.js — the movement counter (DEV_PLAN §5; manual §28.6, §28.8).
// State lives in the day record (kicks: {startedAt, taps, endedAt, outcome}). The screen only
// displays it: elapsed and remaining time are recomputed from startedAt every second, never counted.
// Alert rules are NOT here; they attach through onSessionEnd (Phase 5, lead).

import * as store from './store.js';

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

/** Start (or resume) a session. Returns false if a different session is running. */
export function openCounter(key, meal) {
  if (view) return view.key === key && view.meal === meal;
  const running = store.runningSession();
  if (running && !(running.key === key && running.meal === meal)) return false;
  if (!running) {
    const prev = rec(key, meal);
    if (prev?.endedAt) return false;   // already ended; nothing to resume
    store.updateDay(key, (d) => { d.meals[meal].kicks = { startedAt: Date.now(), taps: [], endedAt: null, outcome: null }; });
  }
  mount(key, meal);
  return true;
}

/** Called at launch: reopen the counter if a session is still running. */
export function resumeIfRunning() {
  const r = store.runningSession();
  if (!r) return false;
  return openCounter(r.key, r.meal);
}

function mount(key, meal) {
  const goal = () => settings().goal;
  const title = el('div', { class: 'counter-title', id: 'counter-title', text: `movements · ${meal}` });
  const endBtn = el('button', { class: 'counter-pill', type: 'button', text: 'end early' });
  const top = el('div', { class: 'counter-top' }, title, endBtn);
  const spine = el('div', { class: 'counter-spine', 'aria-hidden': 'true' });
  const count = el('div', { class: 'counter-count', 'aria-live': 'polite' });
  const elapsed = el('span'); const left = el('span');
  const readout = el('div', { class: 'counter-readout' }, count, el('div', { class: 'counter-times' }, elapsed, left));
  const tap = el('button', { class: 'counter-tap', type: 'button', text: 'felt a movement' });
  const undo = el('button', { class: 'counter-pill', type: 'button', text: 'undo last tap' });
  const foot = el('div', { class: 'counter-foot' });
  // Phase 5 (lead): the A3 "baby moving less than usual?" button goes here, at the foot (manual §28.6).
  const root = el('div', { class: 'counter', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'counter-title' },
    top, spine, readout, tap, el('div', { class: 'counter-foot' }, undo), foot);
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
    count.textContent = `${n} of ${g}`;
    const now = Date.now();
    elapsed.textContent = `${mmss(now - k.startedAt)} elapsed`;
    left.textContent = `${mmss(k.startedAt + settings().windowMinutes * 60000 - now)} left`;
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
      el('div', { class: 'counter-top' }, el('div', { class: 'counter-title', id: 'counter-title', text: `movements · ${meal}` })),
      el('div', { class: 'counter-result' },
        el('div', { class: 'counter-count', text: `${k.taps.length} of ${g}` }),
        el('p', { class: 'counter-note', text: reached ? `${k.taps.length} of ${g} · ${note}` : note })),
      el('div', { class: 'counter-foot' }, done));
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

  endBtn.addEventListener('click', () => {
    if (v.confirming) return;
    v.confirming = true;
    const yes = el('button', { class: 'counter-pill', type: 'button', text: 'end now' });
    const no = el('button', { class: 'counter-pill', type: 'button', text: 'keep counting' });
    const box = el('div', { class: 'counter-confirm', role: 'group', 'aria-label': 'end early' },
      el('p', { text: 'end this count now?' }), el('div', { class: 'counter-confirm-row' }, yes, no));
    foot.replaceChildren(box);
    endBtn.hidden = true;
    no.addEventListener('click', () => { v.confirming = false; foot.replaceChildren(); endBtn.hidden = false; tap.focus(); });
    yes.addEventListener('click', () => {
      // Phase 5 (lead): A4 goes here. If taps < goal, ask "is the baby moving less than usual?"
      // before closing: yes opens the alert screen, no closes the session as incomplete.
      finish(key, meal, Date.now(), 'ended-early');
      close();
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
}
