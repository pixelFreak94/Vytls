// today.js — the Today room: the day as a lifeline (manual §16.9, §28.5, §28.8; DEV_PLAN §2, §4).
// renderToday(body) is idempotent: it rebuilds the body every time. Sheets live on document.body,
// so a re-render never closes one that is open. Thresholds are read from settings on every render.

import * as store from './store.js';
import { openCounter, resumeIfRunning } from './kicks.js';

const HOUR = 3600000;
const TEST_AFTER = 2 * HOUR;               // sugar test: meal finished + 2 hours (DEV_PLAN §2)
const TYPO_LOW = 40, TYPO_HIGH = 400;      // typo guard (DEV_PLAN §2)
const MAX_TIMER = 2 ** 31 - 1;

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
const hhmm = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const cssNum = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

/** A clock time on a day key as a timestamp. Times before dayStartHour belong to the next calendar date (DECISIONS 17). */
function stampFor(key, time) {
  const [y, m, d] = key.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const dt = new Date(y, m - 1, d, h, mi, 0, 0);
  if (h < store.get().settings.dayStartHour) dt.setDate(dt.getDate() + 1);
  return dt.getTime();
}

// ---- the day as a list of nodes ----------------------------------------

/** Sugar state against her set target (strictly above = flagged). */
function sugarFlag(kind, value) {
  const t = store.get().settings.targets;
  return value > (kind === 'fasting' ? t.fasting : t.afterMeal) ? 'above' : 'settled';
}

function buildNodes(day, now, past) {
  const nodes = [];
  const f = day.fasting;
  nodes.push({ id: 'fasting', kind: 'fasting', done: f?.value != null, rec: f });
  for (const meal of store.MEALS) {
    const m = day.meals[meal];
    const testAt = m.finishedAt ? m.finishedAt + TEST_AFTER : null;
    nodes.push({ id: `${meal}-meal`, kind: 'meal', meal, done: !!m.finishedAt, rec: m });
    nodes.push({ id: `${meal}-kicks`, kind: 'kicks', meal, done: !!m.kicks?.endedAt, rec: m.kicks });
    nodes.push({
      id: `${meal}-sugar`, kind: 'sugar', meal, done: m.sugar?.value != null, rec: m.sugar,
      testAt, due: !past && m.sugar?.value == null && testAt != null && now >= testAt,
    });
  }
  return nodes;
}

// a count ended early below the goal is incomplete and not counted (DEV_PLAN §5)
const countLogged = (nodes) => nodes.filter((n) => n.kind !== 'meal' && n.done && n.rec?.outcome !== 'ended-early').length;

// ---- pieces ------------------------------------------------------------

function chip(cls, ...kids) { return el('span', { class: `chip ${cls}` }, ...kids); }

function valueChip(n) {
  if (!n.done) return chip('chip--dash', '–');
  if (n.kind === 'sugar' || n.kind === 'fasting') {
    const v = n.rec.value;
    if (sugarFlag(n.kind, v) === 'above') {
      return chip('chip--above', el('span', { class: 'chip-mark', 'aria-hidden': 'true', text: '▲' }), `${v} above`);
    }
    return chip('chip--settled', el('span', { class: 'chip-mark', 'aria-hidden': 'true', text: '✓' }), String(v));
  }
  if (n.kind === 'kicks') {
    const taps = n.rec.taps?.length ?? 0;
    if (n.rec.outcome === 'window-expired') return chip('chip--passed', `${taps} of ${store.get().settings.kicks.goal}`);
    if (n.rec.outcome === 'ended-early') return chip('chip--dash', `${taps} · incomplete`);
    return chip('chip--settled', el('span', { class: 'chip-mark', 'aria-hidden': 'true', text: '✓' }), String(taps));
  }
  return chip('chip--settled', el('span', { class: 'chip-mark', 'aria-hidden': 'true', text: '✓' }));
}

function labelFor(n) {
  if (n.kind === 'fasting') return n.done ? hhmm(n.rec.at) : 'not logged';
  if (n.kind === 'meal') {
    const foods = n.rec.foods?.length ? ` · ${n.rec.foods.map(store.foodName).join(', ')}` : '';
    return (n.done ? `finished ${hhmm(n.rec.finishedAt)}` : 'not logged') + foods;
  }
  if (n.kind === 'kicks') {
    const k = n.rec;
    if (k?.startedAt && !k.endedAt) return `counting · ${k.taps.length} of ${store.get().settings.kicks.goal}`;
    if (!n.done) return 'not logged';
    if (k.outcome === 'window-expired') return 'window passed';
    if (k.outcome === 'ended-early') return 'ended early';
    return `${k.taps.length} in ${Math.max(1, Math.round((k.endedAt - k.startedAt) / 60000))} min`;
  }
  if (n.done) return hhmm(n.rec.at);
  if (n.testAt) return `${n.due ? 'due now · ' : ''}test at ${hhmm(n.testAt)}`;
  return 'not logged';
}

const TITLES = { fasting: 'sugar', meal: 'meal', kicks: 'movements', sugar: 'sugar' };

// ---- which day is shown ----------------------------------------------------
// Today by default. Past days can be opened to fill in what was missed; anything already
// logged on a past day is locked (owner's call). Today's entries stay editable.
let viewKey = null;
const shownKey = () => viewKey ?? store.todayKey();
/** Show a given day on Today (History's day tap uses this). */
export function setViewDay(key) { viewKey = key && key < store.todayKey() ? key : null; }
const isPast = () => shownKey() < store.todayKey();

function shortDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toLowerCase();
}

const ordinal = (n) => {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] ?? 'th'}`;
};

/** "12th of Nov/26": the day leads, the rest supports it (owner, 0.4.0). */
function dateLine(key) {
  const [y, m, d] = key.split('-').map(Number);
  const mon = new Date(y, m - 1, d).toLocaleDateString('en-GB', { month: 'short' });
  return el('span', { class: 'day-date' },
    el('span', { class: 'day-date-n', text: ordinal(d) }),
    el('span', { class: 'day-date-rest', text: ` of ${mon}/${String(y).slice(2)}` }));
}

function dayStepper(logged) {
  const key = shownKey();
  const today = store.todayKey();
  const pos = store.dayPosition(key);
  const first = store.get().settings.startDate;
  const step = (dir) => {
    const next = store.addDays(key, dir);
    viewKey = next >= today ? null : next;
    if (bodyRef) renderToday(bodyRef);
  };
  const btn = (dir, label, glyph, disabled) => {
    const b = el('button', { class: 'btn-icon day-step', type: 'button', 'aria-label': label, disabled }, glyph);
    b.addEventListener('click', () => step(dir));
    return b;
  };
  // the date and its small lines sit together as one group, in heading ink
  const sub = `${logged} of 7 logged`;
  return el('div', { class: 'day-stepper reveal-item' },
    btn(-1, 'previous day', '‹', key <= first),
    el('div', { class: 'day-name', 'aria-live': 'polite' }, dateLine(key), el('p', { class: 'label label--legible day-sub', text: sub })),
    btn(1, 'next day', '›', key >= today));
}

function nodeRow(n, state) {
  const dot = el('span', { class: 'node-dot', 'aria-hidden': 'true' });
  if (state.docked) dot.append(el('span', { class: 'ball' }));
  const inner = [
    el('span', { class: 'node-text' },
      el('span', { class: 'item-title', text: TITLES[n.kind] }),
      el('span', { class: 'label label--legible', text: labelFor(n) })),
    valueChip(n),
  ];
  const locked = isPast() && n.done;      // past entries are kept as logged
  // movements: counted live, so only today, and only until the count has ended
  const tappable = n.kind === 'kicks' ? !isPast() && !n.done : !locked;
  const hit = tappable
    ? el('button', { class: 'node-hit', type: 'button', 'data-node': n.id }, ...inner)
    : el('div', { class: 'node-hit', 'data-node': n.id }, ...inner);
  const flag = n.done && (n.kind === 'sugar' || n.kind === 'fasting') ? sugarFlag(n.kind, n.rec.value) : null;
  const li = el('li', {
    class: 'node reveal-item',
    'data-kind': n.kind,
    'data-state': n.done ? 'done' : n.due ? 'due' : 'open',
    ...(locked ? { 'data-locked': '' } : {}),
    ...(n.kind === 'kicks' && n.rec?.outcome === 'window-expired' ? { 'data-flag': 'passed' } : {}),
    ...(n.kind === 'kicks' && n.rec?.outcome === 'ended-early' ? { 'data-flag': 'incomplete' } : {}),
    ...(flag ? { 'data-flag': flag } : {}),
  }, dot, hit);
  if (tappable) hit.addEventListener('click', () => openFor(n));
  return li;
}

// ---- render ------------------------------------------------------------

let bodyRef = null;
let dueTimer = null;
let lastBall = { key: null, y: null };

export function renderToday(body) {
  bodyRef = body;
  clearTimeout(dueTimer);
  const now = Date.now();
  if (viewKey && viewKey >= store.todayKey()) viewKey = null;   // the day rolled over
  const day = store.getDay(shownKey());
  const nodes = buildNodes(day, now, isPast());
  const logged = countLogged(nodes);
  const complete = logged === 7;
  const dock = complete ? null : nodes.find((n) => !n.done);
  const hadLifeline = !!body.querySelector('.lifeline');

  // rows in order, so the lit part of the spine can be worked out by index
  const rows = [];   // { li, hasDot, nodeId }
  // tier 1: the four parts of the day are headings; their steps sit under them
  const head = (text, lead) => ({ li: el('li', { class: `node-head reveal-item${lead ? ' is-lead' : ''}` }, el('h2', { class: 'group-title', text })), nodeId: null, hasDot: false });
  rows.push(head('fasting', true));
  rows.push({ li: nodeRow(nodes[0], { docked: dock === nodes[0] }), nodeId: nodes[0].id, hasDot: true });
  store.MEALS.forEach((meal, i) => {
    rows.push(head(meal));
    for (const n of nodes.slice(1 + i * 3, 4 + i * 3)) {
      rows.push({ li: nodeRow(n, { docked: dock === n }), nodeId: n.id, hasDot: true });
    }
  });
  const closeDot = el('span', { class: 'node-dot is-mark', 'aria-hidden': 'true' });
  if (complete) closeDot.append(el('span', { class: 'ball' }));
  const closeLi = el('li', { class: 'node-close reveal-item' }, closeDot);
  if (complete) closeLi.append(el('p', { class: 'close-line body', text: 'rest.' }));
  rows.push({ li: closeLi, nodeId: 'rest', hasDot: true });

  const dockIndex = complete ? rows.length - 1 : rows.findIndex((r) => r.nodeId === dock.id);
  rows.forEach((r, i) => {
    if (r.hasDot) {
      if (i <= dockIndex) r.li.classList.add('lit-top');
      if (i < dockIndex) r.li.classList.add('lit-bot');
    } else if (i < dockIndex) {
      r.li.classList.add('lit-top', 'lit-bot');
    }
  });
  rows[1].li.classList.add('is-first');


  const list = el('ol', { class: 'lifeline' }, ...rows.map((r) => r.li));
  // a gentle nudge when the last backup is over 7 days old (DEV_PLAN §8); the one plz (manual §28.11)
  const last = store.get().settings.lastBackupAt;
  const hasData = Object.keys(store.get().days).length > 0;
  const nudge = hasData && (!last || now - last > 7 * 24 * HOUR)
    ? el('button', { class: 'backup-nudge reveal-item', type: 'button', text: 'back up your data, plz' })
    : null;
  nudge?.addEventListener('click', () => document.querySelector('#nav [data-go="report"]')?.click());
  body.replaceChildren(el('div', { class: 'today' }, dayStepper(logged), ...(nudge ? [nudge] : []), list));

  // the "due now" state changes with the clock, so wake up when the next test time passes
  const next = nodes.filter((n) => n.testAt && !n.done && n.testAt > now).map((n) => n.testAt).sort((a, b) => a - b)[0];
  if (next) {
    dueTimer = setTimeout(() => { if (bodyRef?.isConnected) renderToday(bodyRef); }, Math.min(next - now + 500, MAX_TIMER));
  }

  const key = complete ? 'rest' : dock.id;
  requestAnimationFrame(() => requestAnimationFrame(() => settle(list, key, hadLifeline)));
}

// After layout (the room may have been hidden while rendering): hop the ball, then place the docked node on the focus line.
function settle(list, key, animate) {
  const scroller = list.closest('.scroller');
  if (!list.isConnected || !scroller || !scroller.clientHeight) return;
  const ball = list.querySelector('.ball');
  if (!ball) return;
  const lr = list.getBoundingClientRect();
  const br = ball.getBoundingClientRect();
  const y = br.top + br.height / 2 - lr.top;

  if (animate && lastBall.key && lastBall.key !== key && lastBall.y != null && !reduced()) {
    ball.style.setProperty('--hop-dy', `${lastBall.y - y}px`);
    ball.classList.add('is-hopping');
    ball.addEventListener('animationend', () => ball.classList.remove('is-hopping'), { once: true });
  }
  lastBall = { key, y };

  const sr = scroller.getBoundingClientRect();
  const top = lr.top - sr.top + scroller.scrollTop + y - cssNum('--focus-line') * scroller.clientHeight;
  scroller.scrollTo({ top: Math.max(0, top), behavior: animate && !reduced() ? 'smooth' : 'auto' });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && bodyRef?.isConnected && bodyRef.closest('.room')?.hidden === false) renderToday(bodyRef);
});

// ---- sheets (manual §16.7, §16.12) -----------------------------------------

let openSheetEl = null;

function closeSheet(returnTo) {
  if (!openSheetEl) return;
  openSheetEl.cleanup();
  openSheetEl.veil.remove();
  openSheetEl = null;
  const target = returnTo && document.querySelector(`[data-node="${returnTo}"]`);
  target?.focus?.({ preventScroll: true });
}

function openFor(n) {
  if (!store.canLog()) return;
  if (n.kind === 'kicks') { if (!openCounter(shownKey(), n.meal)) resumeIfRunning(); }
  else if (n.kind === 'meal') openMealSheet(n);
  else openReadingSheet(n);
}

/** The shared frame: veil, dialog, head with a close button. Returns the parts to fill. */
function frame({ eyebrow, title, nodeId }) {
  closeSheet();
  const titleId = 'sheet-title';
  const close = el('button', { class: 'btn btn-ghost sheet-close', type: 'button', text: 'close' });
  const head = el('div', { class: 'sheet-head' },
    el('div', { class: 'sheet-titles' },
      el('span', { class: 'label label--legible', text: eyebrow }),
      el('h2', { class: 'item-title', id: titleId, text: title })),
    close);
  const form = el('form', { class: 'sheet-form', novalidate: true });
  const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId }, head, form);
  const veil = el('div', { class: 'sheet-veil' }, sheet);
  document.body.append(veil);

  const onKey = (e) => { if (e.key === 'Escape') closeSheet(nodeId); };
  const vv = window.visualViewport;
  const fit = () => {
    if (!vv) return;
    veil.style.setProperty('--vv-h', `${vv.height}px`);
    veil.style.setProperty('--vv-top', `${vv.offsetTop}px`);
  };
  fit();
  document.addEventListener('keydown', onKey);
  vv?.addEventListener('resize', fit);
  vv?.addEventListener('scroll', fit);
  const cleanup = () => {
    document.removeEventListener('keydown', onKey);
    vv?.removeEventListener('resize', fit);
    vv?.removeEventListener('scroll', fit);
  };
  openSheetEl = { veil, cleanup };

  close.addEventListener('click', () => closeSheet(nodeId));
  veil.addEventListener('click', (e) => { if (e.target === veil) closeSheet(nodeId); });
  return { form, sheet };
}

function timeField(ts) {
  const input = el('input', { class: 'field-input', id: 'sheet-time', name: 'time', type: 'time', value: hhmm(ts ?? Date.now()), required: true });
  const note = el('p', { class: 'field-note', role: 'status', hidden: true });
  const wrap = el('div', { class: 'field' },
    el('label', { class: 'field-label', for: 'sheet-time', text: 'time' }),
    el('div', { class: 'field-row' }, input), note);
  const error = (msg) => { wrap.classList.add('is-error'); note.textContent = msg; note.hidden = false; input.setAttribute('aria-invalid', 'true'); };
  input.addEventListener('input', () => { wrap.classList.remove('is-error'); note.hidden = true; input.removeAttribute('aria-invalid'); });
  return { wrap, input, error };
}

function openReadingSheet(n) {
  const isFasting = n.kind === 'fasting';
  const key = shownKey();
  const rec = n.rec;
  const editing = n.done;
  const { form } = frame({
    eyebrow: isFasting ? 'fasting' : `after ${n.meal}${n.testAt ? ` · test at ${hhmm(n.testAt)}` : ''}`,
    title: 'blood sugar',
    nodeId: n.id,
  });

  // the one large field
  const input = el('input', {
    class: 'reading-input', id: 'sheet-reading', name: 'reading', type: 'text',
    inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
    'aria-label': 'blood sugar in mg/dL', autofocus: true,
  });
  if (editing) input.value = String(rec.value);
  const note = el('p', { class: 'field-note', role: 'status', hidden: true });
  const reading = el('div', { class: 'field reading' },
    el('div', { class: 'field-row' }, input, el('span', { class: 'field-unit reading-unit', 'aria-hidden': 'true', text: 'mg/dL' })), note);
  form.append(reading);

  // fasted 8 hours (fasting only)
  let fasted = rec?.fasted8h ?? false;
  if (isFasting) {
    const tg = el('button', { class: 'toggle', type: 'button', role: 'switch', 'aria-checked': String(fasted), 'aria-labelledby': 'fasted-label' });
    const val = el('span', { class: 'toggle-value', text: fasted ? 'yes' : 'no' });
    tg.addEventListener('click', () => {
      fasted = !fasted;
      tg.classList.add('is-live');
      tg.setAttribute('aria-checked', String(fasted));
      val.textContent = fasted ? 'yes' : 'no';
    });
    form.append(el('div', { class: 'toggle-row' }, tg, el('span', { class: 'value', id: 'fasted-label', text: 'fasted 8 hours' }), val));
  }

  const time = timeField(rec?.at);
  form.append(time.wrap);

  // actions: save (and delete when editing); a typo guard swaps them for a confirm
  const save = el('button', { class: 'btn btn-filled', type: 'submit', text: 'save' });
  const actions = el('div', { class: 'sheet-actions' });
  const del = editing ? el('button', { class: 'btn btn-ghost', type: 'button', text: 'delete' }) : null;
  const change = el('button', { class: 'btn btn-ghost', type: 'button', text: 'change', hidden: true });
  const confirmBtn = el('button', { class: 'btn btn-filled', type: 'button', text: 'yes, save', hidden: true });
  actions.append(...[del, change, confirmBtn, save].filter(Boolean));
  form.append(actions);

  const showNote = (msg) => { reading.classList.add('is-error'); note.textContent = msg; note.hidden = false; input.setAttribute('aria-invalid', 'true'); };
  const clearNote = () => {
    reading.classList.remove('is-error'); note.hidden = true; input.removeAttribute('aria-invalid');
    confirmBtn.hidden = true; change.hidden = true; save.hidden = false; if (del) del.hidden = false;
  };
  input.addEventListener('input', clearNote);

  const commit = () => {
    const value = Number(input.value.trim());
    if (!time.input.value) { time.error('Pick a time.'); return; }
    const at = stampFor(key, time.input.value);
    store.updateDay(key, (d) => {
      if (isFasting) d.fasting = { value, at, fasted8h: fasted };
      else d.meals[n.meal].sugar = { value, at };
    });
    closeSheet(n.id);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!/^\d{1,3}$/.test(raw) || Number(raw) === 0) { showNote('Whole numbers only, like 92.'); input.focus(); return; }
    const v = Number(raw);
    if (v < TYPO_LOW || v > TYPO_HIGH) {
      showNote(`Is this right? ${v} mg/dL`);
      save.hidden = true; if (del) del.hidden = true; change.hidden = false; confirmBtn.hidden = false;
      confirmBtn.focus();
      return;
    }
    commit();
  });
  confirmBtn.addEventListener('click', commit);
  change.addEventListener('click', () => { clearNote(); input.focus(); input.select(); });
  del?.addEventListener('click', () => {
    store.updateDay(key, (d) => { if (isFasting) d.fasting = null; else d.meals[n.meal].sugar = null; });
    closeSheet(n.id);
  });

  input.focus();
}

/** The ingredient list for one meal: add field, suggestions from past foods, the added foods with remove. */
function foodsField(key, meal) {
  const current = () => store.getDay(key).meals[meal].foods ?? [];
  const input = el('input', {
    class: 'field-input', id: 'sheet-food', type: 'text', enterkeyhint: 'done',
    // the iPhone keyboard capitalises and corrects spelling as she types
    placeholder: 'Rice, 1 cup', autocomplete: 'off', autocapitalize: 'sentences', autocorrect: 'on', spellcheck: 'true',
  });
  const add = el('button', { class: 'btn btn-ghost food-add', type: 'button', text: 'add' });
  const sugg = el('div', { class: 'food-suggest', role: 'group', 'aria-label': 'suggestions' });
  const list = el('ul', { class: 'food-list' });
  const wrap = el('div', { class: 'field foods' },
    el('label', { class: 'field-label', for: 'sheet-food', text: 'ingredients' }),
    el('div', { class: 'field-row food-row' }, input, add), sugg, list);

  const addFood = (raw) => {
    const f = store.foodName(raw);
    input.value = '';
    if (f && !current().some((x) => x.toLowerCase() === f.toLowerCase())) {
      store.updateDay(key, (d) => { d.meals[meal].foods.push(f); });
      store.noteFood(f);
    }
    paint();
  };
  const paint = () => {
    const have = current();
    list.replaceChildren(...have.map((f, i) => {
      const rm = el('button', { class: 'food-remove', type: 'button', 'aria-label': `remove ${f}`, text: '×' });
      rm.addEventListener('click', () => {
        store.updateDay(key, (d) => { d.meals[meal].foods.splice(i, 1); });
        paint();
      });
      return el('li', { class: 'food-item' }, el('span', { class: 'food-name', text: store.foodName(f) }), rm);
    }));
    const q = input.value.trim().toLowerCase();
    const picks = store.get().foodHistory
      .map(store.foodName)
      .filter((f, i, all) => all.indexOf(f) === i && !have.some((h) => store.foodName(h) === f) && (!q || f.toLowerCase().includes(q))).slice(0, 5);
    sugg.hidden = picks.length === 0;
    sugg.replaceChildren(...picks.map((f) => {
      const b = el('button', { class: 'food-chip', type: 'button', text: f });
      b.addEventListener('click', () => { addFood(f); input.focus(); });
      return b;
    }));
  };
  input.addEventListener('input', paint);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addFood(input.value); } });
  add.addEventListener('click', () => { addFood(input.value); input.focus(); });
  paint();
  return wrap;
}

function openMealSheet(n) {
  const key = shownKey();
  const editing = n.done;
  const { form } = frame({ eyebrow: n.meal, title: 'meal', nodeId: n.id });

  const time = timeField(n.rec.finishedAt);
  form.append(time.wrap);
  form.append(foodsField(key, n.meal));

  const save = el('button', { class: 'btn btn-filled', type: 'submit', text: editing ? 'save' : 'meal finished' });
  const clear = editing ? el('button', { class: 'btn btn-ghost', type: 'button', text: 'clear' }) : null;
  form.append(el('div', { class: 'sheet-actions' }, ...[clear, save].filter(Boolean)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!time.input.value) { time.error('Pick a time.'); return; }
    const at = stampFor(key, time.input.value);
    store.updateDay(key, (d) => { d.meals[n.meal].finishedAt = at; });
    closeSheet(n.id);
  });
  clear?.addEventListener('click', () => {
    store.updateDay(key, (d) => { d.meals[n.meal].finishedAt = null; });
    closeSheet(n.id);
  });
  save.focus();
}
