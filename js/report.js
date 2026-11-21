// report.js — the Report room: doctor report (PDF made on the phone, js/pdf.js), CSV, backup and restore, reminder guide
// (DEV_PLAN §8, §10; DECISIONS 29, 32-34; manual §28.10, §28.11).
// renderReport(body) is idempotent. Everything stays on the phone: files are made in memory and handed to
// the share sheet or downloaded by her; nothing is sent anywhere.

import * as store from './store.js';
import { reportPdf } from './pdf.js';

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

const MEALS = store.MEALS;
const DASH = '–';
const pad = (n) => String(n).padStart(2, '0');
const hhmmOf = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const OUTCOME_LABEL = { reached: 'reached', 'window-expired': 'window passed', 'ended-early': 'incomplete' };
const RULE_LABEL = {
  A1: 'movement window passed below the goal',
  A2: 'goal reached much slower than usual',
  A3: 'raised by her: baby moving less than usual',
  A4: 'count ended early, less movement reported',
};
const FILTERS = [
  ['fasting', 'fasting sugar'],
  ['after', 'after-meal sugar'],
  ['moves', 'movements'],
  ['foods', 'foods'],
  ['alerts', 'alerts'],
  ['summary', 'summary'],
];

// ---- state kept between renders (this session only) -------------------------

const state = {
  period: null,                      // a month number as a string, or 'custom'
  from: '', to: '',
  on: { fasting: true, after: true, moves: true, foods: true, alerts: true, summary: true },
};

function currentMonth() { return store.dayPosition(store.todayKey())?.month ?? 1; }

function monthRange(m) { const k = store.monthKeys(m); return [k[0], k.at(-1)]; }

function range() {
  if (state.period === 'custom') {
    let [a, b] = [state.from, state.to];
    if (!a && !b) return monthRange(currentMonth());
    a ||= b; b ||= a;
    return a <= b ? [a, b] : [b, a];
  }
  return monthRange(Number(state.period));
}

function keysIn([from, to]) {
  const n = Math.min(store.daysBetween(from, to), 400);
  return Array.from({ length: n + 1 }, (_, i) => store.addDays(from, i));
}

// ---- reading one day -------------------------------------------------------

const above = (kind, v) => {
  const t = store.get().settings.targets;
  return v != null && v > (kind === 'fasting' ? t.fasting : t.afterMeal);
};

function moveText(k) {
  if (!k || !k.startedAt) return null;
  if (!k.endedAt || !k.outcome) return 'incomplete';
  if (k.outcome === 'reached') return `${Math.max(1, Math.round((k.endedAt - k.startedAt) / 60000))} min`;
  return OUTCOME_LABEL[k.outcome] ?? 'incomplete';
}

function dayFacts(key) {
  const d = store.get().days[key];
  const f = { key, fasting: d?.fasting?.value ?? null, meals: {} };
  for (const m of MEALS) {
    const x = d?.meals?.[m];
    f.meals[m] = {
      sugar: x?.sugar?.value ?? null,
      move: moveText(x?.kicks),
      outcome: x?.kicks?.startedAt ? (x.kicks.endedAt ? x.kicks.outcome : 'ended-early') : null,
      dish: store.foodName(x?.dish),
      note: [x?.note, x?.sugar?.note].filter(Boolean).join('; '),
      foods: (x?.foods ?? []).map(store.foodName).filter(Boolean),
      snacks: store.snacksOf(x).map((s) => `snack ${hhmmOf(s.at)}: ${(s.foods ?? []).map(store.foodName).join('; ')}${s.note ? ` (note: ${s.note})` : ''}`),
    };
  }
  return f;
}

/** A meal's foods as one line; the dish name leads ("Chicken biryani: Rice; Chicken"). */
const foodText = (m) => [[[m.dish, m.foods.join('; ')].filter(Boolean).join(': '), m.note ? `(note: ${m.note})` : ''].filter(Boolean).join(' '), ...m.snacks].filter(Boolean).join(' · ');

const alertsIn = (keys) => {
  const set = new Set(keys);
  return (store.get().alerts ?? []).filter((a) => set.has(store.dayKey(a.at))).sort((a, b) => a.at - b.at);
};

// ---- the report sheet (screen preview and print share this) ------------------

const avg = (xs) => (xs.length ? Math.round((xs.reduce((s, v) => s + v, 0) / xs.length) * 10) / 10 : null);
const stamp = (ts) => { const d = new Date(ts); return `${store.dayKey(ts, 0)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

/** 14-Nov-26 (owner, 0.4.1). The CSV keeps YYYY-MM-DD so spreadsheets read it as a date. */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dmy(key) {
  const [y, m, d] = key.split('-').map(Number);
  return `${String(d).padStart(2, '0')}-${MON[m - 1]}-${String(y).slice(2)}`;
}

function buildSheet(on, today = new Date()) {
  const [from, to] = range();
  const keys = keysIn([from, to]);
  const facts = keys.map(dayFacts);
  const t = store.get().settings.targets;
  const sheet = el('div', { class: 'rp-sheet' });

  sheet.append(el('h2', { text: 'vytls report' }),
    el('p', { class: 'rp-meta', text: `${dmy(from)} to ${dmy(to)} · ${keys.length} days` }));

  // the grid
  const head1 = el('tr'), head2 = el('tr');
  head1.append(el('th', { rowspan: '2', text: 'date' }));
  const group = (label, subs) => {
    head1.append(el('th', { colspan: String(subs.length), text: label }));
    subs.forEach((s) => head2.append(el('th', { text: s })));
  };
  if (on.fasting) group('fasting sugar (mg/dL)', ['fasting']);
  if (on.after) group('after-meal sugar (mg/dL)', MEALS);
  if (on.moves) group('movements', MEALS);
  if (on.foods) group('foods', MEALS);
  const tbody = el('tbody');
  for (const f of facts) {
    const tr = el('tr', {}, el('td', { text: dmy(f.key) }));
    if (on.fasting) tr.append(el('td', { text: f.fasting == null ? DASH : `${f.fasting}${above('fasting', f.fasting) ? ' ▲' : ''}` }));
    if (on.after) for (const m of MEALS) { const v = f.meals[m].sugar; tr.append(el('td', { text: v == null ? DASH : `${v}${above('after', v) ? ' ▲' : ''}` })); }
    if (on.moves) for (const m of MEALS) tr.append(el('td', { text: f.meals[m].move ?? DASH }));
    if (on.foods) for (const m of MEALS) tr.append(el('td', { class: 'rp-foods', text: foodText(f.meals[m]) || DASH }));
    tbody.append(tr);
  }
  const anyCol = on.fasting || on.after || on.moves || on.foods;
  if (anyCol) sheet.append(el('table', {}, el('thead', {}, head1, head2), tbody));
  else sheet.append(el('p', { class: 'rp-empty', text: 'no columns chosen.' }));
  if (on.fasting || on.after) sheet.append(el('p', { class: 'rp-meta', text: `▲ above target (fasting over ${t.fasting}, after-meal over ${t.afterMeal}). ${DASH} not logged.` }));

  const al = alertsIn(keys);
  if (on.alerts) {
    sheet.append(el('h3', { text: 'alerts shown' }));
    if (!al.length) sheet.append(el('p', { text: 'none in this period.' }));
    else {
      const ul = el('ul');
      for (const a of al) ul.append(el('li', { text: `${dmy(store.dayKey(a.at, 0))} ${stamp(a.at).slice(11)} · ${a.rule} · ${RULE_LABEL[a.rule] ?? a.rule}${a.meal ? ` · ${a.meal}` : ''}` }));
      sheet.append(ul);
    }
  }

  if (on.summary) {
    const box = el('div', { class: 'rp-summary' }, el('h3', { text: 'summary' }));
    const lines = [`period: ${dmy(from)} to ${dmy(to)} (${keys.length} days)`];
    const sugarLine = (label, vals, kind) => {
      const a = avg(vals);
      const n = vals.filter((v) => above(kind, v)).length;
      lines.push(`${label}: ${a == null ? 'no readings' : `average ${a} mg/dL`} · ${vals.length} logged · ${n} above target`);
    };
    const f0 = facts.map((f) => f.fasting).filter((v) => v != null);
    sugarLine('fasting', f0, 'fasting');
    let aboveTotal = f0.filter((v) => above('fasting', v)).length;
    for (const m of MEALS) {
      const vals = facts.map((f) => f.meals[m].sugar).filter((v) => v != null);
      sugarLine(`after ${m}`, vals, 'after');
      aboveTotal += vals.filter((v) => above('after', v)).length;
    }
    lines.push(`readings above target: ${aboveTotal}`);
    const oc = { reached: 0, 'window-expired': 0, 'ended-early': 0 };
    for (const f of facts) for (const m of MEALS) if (f.meals[m].outcome in oc) oc[f.meals[m].outcome]++;
    lines.push(`movement sessions: ${oc.reached + oc['window-expired'] + oc['ended-early']} · reached ${oc.reached} · window passed ${oc['window-expired']} · incomplete ${oc['ended-early']}`);
    lines.push(`alerts shown: ${al.length}`);
    const ul = el('ul');
    lines.forEach((l) => ul.append(el('li', { text: l })));
    box.append(ul);
    sheet.append(box);
  }

  sheet.append(el('p', { class: 'rp-foot', text: `vytls · generated ${dmy(store.dayKey(today.getTime(), 0))}` }));
  return sheet;
}

// ---- CSV ---------------------------------------------------------------------

const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function buildCsv(on = state.on) {
  const keys = keysIn(range());
  const head = ['date'];
  if (on.fasting) head.push('fasting', 'fasting above target');
  if (on.after) MEALS.forEach((m) => head.push(`${m} sugar`, `${m} sugar above target`));
  if (on.moves) MEALS.forEach((m) => head.push(`${m} movements`));
  if (on.foods) MEALS.forEach((m) => head.push(`${m} foods`));
  if (on.alerts) head.push('alerts');
  const rows = [head];
  for (const key of keys) {
    const f = dayFacts(key);
    const r = [key];
    if (on.fasting) r.push(f.fasting ?? '', above('fasting', f.fasting) ? 'yes' : '');
    if (on.after) MEALS.forEach((m) => r.push(f.meals[m].sugar ?? '', above('after', f.meals[m].sugar) ? 'yes' : ''));
    if (on.moves) MEALS.forEach((m) => r.push(f.meals[m].move ?? ''));
    if (on.foods) MEALS.forEach((m) => r.push(foodText(f.meals[m])));
    if (on.alerts) r.push(alertsIn([key]).map((a) => `${a.rule} ${stamp(a.at).slice(11)}`).join('; '));
    rows.push(r);
  }
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

// ---- handing a file to her ---------------------------------------------------

async function deliver(name, text, type) {
  const file = new File([text], name, { type });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return true; }
    catch (e) { if (e?.name === 'AbortError') return false; /* otherwise fall back to a download */ }
  }
  const url = URL.createObjectURL(file);
  const a = el('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return true;
}

// ---- backup and restore -------------------------------------------------------

export function looksLikeVytls(o) {
  return !!o && typeof o === 'object' && typeof o.version === 'number'
    && o.settings && typeof o.settings === 'object' && o.days && typeof o.days === 'object' && !Array.isArray(o.days);
}

function replaceAll(incoming) {
  return store.replaceAll(incoming);   // keeps a copy of the old data first (store.js)
}

function lastBackupText() {
  const t = store.get().settings.lastBackupAt;
  return t ? `last backup ${dmy(store.dayKey(t, 0))}` : 'no backup yet';
}

// ---- the room -------------------------------------------------------------------

export function renderReport(body) {
  if (!state.period) state.period = String(currentMonth());
  const settings = store.get().settings;
  const months = Math.max(currentMonth(), 1);
  const root = el('div', { class: 'rp' });

  // 1. doctor report
  const preview = el('div', { class: 'rp-preview', 'aria-label': 'report preview' });
  const paint = () => { preview.replaceChildren(buildSheet(state.on)); };

  const select = el('select', { class: 'rp-select', 'aria-label': 'period' });
  for (let m = 1; m <= months; m++) {
    const [a, b] = monthRange(m);
    select.append(el('option', { value: String(m), text: `${dmy(a)} to ${dmy(b)}` }));
  }
  select.append(el('option', { value: 'custom', text: 'custom range' }));
  select.value = state.period === 'custom' || Number(state.period) <= months ? state.period : String(months);
  state.period = select.value;

  const [cf, ct] = range();
  const fromIn = el('input', { class: 'rp-date', type: 'date', 'aria-label': 'from', value: state.from || cf });
  const toIn = el('input', { class: 'rp-date', type: 'date', 'aria-label': 'to', value: state.to || ct });
  const dates = el('div', { class: 'rp-dates', hidden: state.period !== 'custom' }, fromIn, toIn);
  select.addEventListener('change', () => {
    state.period = select.value;
    if (state.period === 'custom') { state.from = fromIn.value; state.to = toIn.value; }
    dates.hidden = state.period !== 'custom';
    paint();
  });
  const onDate = () => { state.from = fromIn.value; state.to = toIn.value; paint(); };
  fromIn.addEventListener('change', onDate);
  toIn.addEventListener('change', onDate);

  const toggles = el('div', { class: 'rp-toggles' });
  for (const [id, label] of FILTERS) {
    const btn = el('button', { class: 'toggle is-live', type: 'button', role: 'switch', 'aria-label': label, 'aria-checked': String(state.on[id]) });
    const txt = el('span', { class: 'toggle-value', text: label });
    const flip = () => {
      state.on[id] = !state.on[id];
      btn.setAttribute('aria-checked', String(state.on[id]));
      paint();
    };
    btn.addEventListener('click', flip);
    txt.addEventListener('click', flip);
    toggles.append(el('div', { class: 'toggle-row' }, btn, txt));
  }

  const status = el('p', { class: 'rp-status', role: 'status' });
  const pdfBtn = el('button', { class: 'btn btn-filled rp-btn', type: 'button', text: 'export pdf' });
  pdfBtn.addEventListener('click', async () => {
    const [a, b] = range();
    let bytes;
    try { bytes = reportPdf(buildSheet(state.on)); } catch { status.textContent = 'pdf could not be made. export csv instead.'; return; }
    const ok = await deliver(`vytls-report-${a}-${b}.pdf`, bytes, 'application/pdf');
    status.textContent = ok ? 'pdf ready' : '';
  });
  const csvBtn = el('button', { class: 'btn btn-ghost rp-btn', type: 'button', text: 'export csv' });
  csvBtn.addEventListener('click', async () => {
    const [a, b] = range();
    const ok = await deliver(`vytls-${a}-${b}.csv`, '﻿' + buildCsv(), 'text/csv');
    status.textContent = ok ? 'csv ready' : '';
  });

  root.append(el('section', { class: 'rp-section' },
    el('h2', { class: 'rp-h', text: 'doctor report' }),
    select, dates, toggles,
    el('div', { class: 'rp-row' }, pdfBtn, csvBtn),
    el('p', { class: 'rp-note', text: 'export pdf opens the share sheet. choose save to files, or send it.' }),
    status, preview));
  paint();

  // 3. backup and restore
  const test = store.isTestDevice();
  const backupLine = el('p', { class: 'rp-status', text: lastBackupText() });
  const backupMsg = el('p', { class: 'rp-status', role: 'status' });
  const backupBtn = el('button', { class: 'btn btn-filled rp-btn', type: 'button', text: 'back up' });
  backupBtn.addEventListener('click', async () => {
    const ok = await deliver(`vytls-backup-${store.dayKey(Date.now(), 0)}.json`, JSON.stringify(store.get()), 'application/json');
    if (!ok) return;
    store.setSetting('lastBackupAt', Date.now());
    backupLine.textContent = lastBackupText();
    backupMsg.textContent = 'backup saved';
  });
  const fileIn = el('input', { class: 'rp-file', type: 'file', accept: 'application/json,.json', tabindex: '-1', 'aria-hidden': 'true' });
  const restoreBtn = el('button', { class: 'btn btn-ghost rp-btn', type: 'button', text: 'restore' });
  restoreBtn.addEventListener('click', () => fileIn.click());
  const confirmText = el('p', { class: 'rp-note', text: 'this replaces everything on this phone. restore?' });
  const yes = el('button', { class: 'btn btn-filled rp-btn', type: 'button', text: 'restore' });
  const no = el('button', { class: 'btn btn-ghost rp-btn', type: 'button', text: 'cancel' });
  const confirm = el('div', { class: 'rp-confirm', role: 'alertdialog', 'aria-label': 'restore', hidden: true }, confirmText, el('div', { class: 'rp-row' }, yes, no));
  let pending = null;
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files?.[0];
    fileIn.value = '';
    if (!f) return;
    try {
      const o = JSON.parse(await f.text());
      if (!looksLikeVytls(o)) throw new Error('shape');
      // a backup only restores onto a phone with the same username, so a test phone's
      // file can never replace her record (DECISIONS 43)
      const owner = String(o.settings.account ?? '').toLowerCase();
      if (owner && owner !== store.account()) {
        pending = null;
        confirm.hidden = true;
        backupMsg.textContent = 'that backup was made under another username. nothing changed.';
        return;
      }
      confirmText.textContent = owner
        ? 'this replaces everything on this phone. restore?'
        : 'this file has no username on it, so check it is the right one. it replaces everything on this phone. restore?';
      pending = o;
      backupMsg.textContent = '';
      confirm.hidden = false;
    } catch {
      pending = null;
      confirm.hidden = true;
      backupMsg.textContent = 'that file does not look like vytls data. nothing changed.';
    }
  });
  no.addEventListener('click', () => { pending = null; confirm.hidden = true; });
  yes.addEventListener('click', () => {
    if (!pending) return;
    replaceAll(pending);
    pending = null;
    confirm.hidden = true;
    renderReport(body);
    const msg = body.querySelector('.rp-restored');
    if (msg) msg.textContent = 'restored';
  });
  root.append(el('section', { class: 'rp-section' },
    el('h2', { class: 'rp-h', text: 'backup and restore' }),
    el('p', { class: 'rp-note', text: test
      ? 'this is a test phone. it makes no backups.'
      : `back up now and then, plz. the file is kept by you, not by the app, and is marked ${store.account()}.` }),
    ...(test ? [] : [backupLine]),
    el('div', { class: 'rp-row' }, ...(test ? [] : [backupBtn]), restoreBtn, fileIn),
    confirm, backupMsg, el('p', { class: 'rp-status rp-restored' })));

  // 4. reminders
  root.append(el('section', { class: 'rp-section' },
    el('h2', { class: 'rp-h', text: 'reminders' }),
    el('p', { class: 'rp-note', text: 'the app cannot remind you while it is closed.' }),
    el('p', { class: 'rp-note', text: '1. open the clock app, then alarm, then the plus.' }),
    el('p', { class: 'rp-note', text: '2. set one for the fasting test each morning and label it.' }),
    el('p', { class: 'rp-note', text: '3. after-meal test times show on today once meal finished is tapped.' })));
  void settings;

  body.replaceChildren(root);
}
