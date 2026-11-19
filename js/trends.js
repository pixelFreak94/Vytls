// trends.js — the trends block under the History grid (manual §28.10, §28.8, §28.11).
// Numbers only: it states, it never judges. Targets are read live from settings.
// Motion: lines draw in, points fade in. Styles and timing live in history.css.

import * as store from './store.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 320, H = 168;                                   // viewBox units; the SVG scales to the card
const PAD = { l: 30, r: 10, t: 14, b: 22 };
const TICKS = 4;

const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  n.append(...kids);
  return n;
};
const sv = (tag, props = {}, ...kids) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.setAttribute('class', v);
    else if (k === 'text') n.textContent = v;
    else if (v != null && v !== false) n.setAttribute(k, v);
  }
  n.append(...kids);
  return n;
};

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const dayNum = (key) => Number(key.split('-')[2]);

/** One row of numbers per day. Future days are left out. */
function collect(keys, s) {
  const today = store.todayKey();
  return keys.map((key, i) => {
    if (key > today) return null;
    const day = store.getDay(key);
    const fasting = day.fasting && day.fasting.value != null ? day.fasting.value : null;
    const meals = store.MEALS.map((m) => day.meals[m]);
    const after = mean(meals.map((m) => m.sugar?.value).filter((v) => v != null));
    const mins = meals.map((m) => m.kicks).filter((k) => k && k.outcome === 'reached' && k.startedAt && k.endedAt)
      .map((k) => (k.endedAt - k.startedAt) / 60000);
    const expired = meals.some((m) => m.kicks && m.kicks.outcome === 'window-expired');
    return { key, i, fasting, after, moves: mean(mins), expired };
  }).filter(Boolean);
}

/** Split a series into runs of consecutive days so a gap is never bridged. */
function runs(rows, pick) {
  const out = []; let cur = [];
  for (const r of rows) {
    const v = pick(r);
    if (v == null) { if (cur.length) out.push(cur); cur = []; }
    else cur.push({ i: r.i, v });
  }
  if (cur.length) out.push(cur);
  return out;
}

function chartFrame(n, lo, hi, step, label) {
  const x = (i) => PAD.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - PAD.l - PAD.r));
  const y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const svg = sv('svg', { class: 'tr-svg', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet' });
  for (let v = lo; v <= hi + 1e-9; v += step) {
    svg.append(sv('line', { class: 'tr-grid', x1: PAD.l, x2: W - PAD.r, y1: y(v), y2: y(v) }),
      sv('text', { class: 'tr-axis', x: PAD.l - 4, y: y(v), 'text-anchor': 'end', 'dominant-baseline': 'middle', text: String(Math.round(v)) }));
  }
  return { svg, x, y };
}

function dayAxis(svg, rows, x) {
  for (const r of rows) {
    const d = dayNum(r.key);
    if (r.i % 7 === 0) svg.append(sv('text', { class: 'tr-axis', x: x(r.i), y: H - PAD.b + 12, 'text-anchor': 'middle', text: String(d) }));
  }
}

let seq = 0;
function line(svg, pts, x, y, cls, delay) {
  for (const run of pts) {
    if (run.length > 1) {
      const d = run.map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join('');
      svg.append(sv('path', { class: `tr-line ${cls}`, d, pathLength: 1, style: `--tr-delay:${delay}` }));
    }
  }
}
function dots(svg, pts, x, y, shape, above, delay) {
  let k = 0;
  for (const run of pts) for (const p of run) {
    const cx = x(p.i), cy = y(p.v), cls = `tr-pt tr-${shape}` + (above(p.v) ? ' tr-above' : '');
    const style = `--tr-delay:${delay + k++}`;
    svg.append(shape === 'dot'
      ? sv('circle', { class: cls, cx, cy, r: 3, style })
      : sv('rect', { class: cls, x: cx - 3, y: cy - 3, width: 6, height: 6, style }));
  }
}

function legendItem(swatchCls, text) {
  return el('li', { class: 'tr-key' }, el('span', { class: `tr-sw ${swatchCls}`, 'aria-hidden': 'true' }), el('span', { text }));
}

function sugarChart(rows, s) {
  const tf = s.targets.fasting, ta = s.targets.afterMeal;
  const vals = rows.flatMap((r) => [r.fasting, r.after]).filter((v) => v != null).concat([tf, ta]);
  const lo = Math.floor((Math.min(...vals) - 5) / 20) * 20, hi = Math.ceil((Math.max(...vals) + 5) / 20) * 20;
  const { svg, x, y } = chartFrame(rows.length ? rows[rows.length - 1].i + 1 : 1, lo, hi, 20, 'sugar readings by day, with the two targets');
  dayAxis(svg, rows, x);
  for (const [t, name] of [[tf, 'fasting target'], [ta, 'after-meal target']]) {
    svg.append(sv('line', { class: 'tr-target', x1: PAD.l, x2: W - PAD.r, y1: y(t), y2: y(t) }),
      sv('text', { class: 'tr-axis tr-tlabel', x: W - PAD.r, y: y(t) + (t === Math.min(tf, ta) ? 10 : -3), 'text-anchor': 'end', text: `${name} ${t}` }));
  }
  const f = runs(rows, (r) => r.fasting), a = runs(rows, (r) => r.after);
  line(svg, f, x, y, 'tr-l-fast', 0); line(svg, a, x, y, 'tr-l-after', 1);
  dots(svg, f, x, y, 'dot', (v) => v > tf, 2);
  dots(svg, a, x, y, 'sq', (v) => v > ta, 3);
  return svg;
}

function moveChart(rows, goal) {
  const vals = rows.map((r) => r.moves).filter((v) => v != null);
  const top = Math.max(10, ...vals), hi = Math.ceil(top / 10) * 10 + 10;
  const { svg, x, y } = chartFrame(rows.length ? rows[rows.length - 1].i + 1 : 1, 0, hi, hi / 4 >= 10 ? Math.ceil(hi / 4 / 5) * 5 : 5, `minutes to ${goal} movements by day`);
  dayAxis(svg, rows, x);
  const m = runs(rows, (r) => r.moves);
  line(svg, m, x, y, 'tr-l-move', 0);
  dots(svg, m, x, y, 'dot', () => false, 1);
  rows.filter((r) => r.expired).forEach((r, k) => {
    svg.append(sv('polygon', { class: 'tr-pt tr-alert', style: `--tr-delay:${2 + k}`,
      points: `${x(r.i) - 4},${PAD.t - 8} ${x(r.i) + 4},${PAD.t - 8} ${x(r.i)},${PAD.t - 1}` }));
  });
  return svg;
}

function weekRows(rows) {
  const out = [];
  for (let w = 0; w < 5; w++) {
    const part = rows.filter((r) => r.i >= w * 7 && r.i < (w + 1) * 7);
    if (!part.length) continue;
    const g = (pick) => { const v = mean(part.map(pick).filter((q) => q != null)); return v == null ? '–' : String(Math.round(v)); };
    out.push(el('li', { class: 'tr-week', text: `week ${w + 1} · fasting avg ${g((r) => r.fasting)} · after meals avg ${g((r) => r.after)} · moves avg ${g((r) => r.moves)} min` }));
  }
  return out;
}

export function renderTrends(keys) {
  const s = store.get().settings;
  const rows = collect(keys, s);
  const sec = el('section', { class: 'hg-section tr' },
    el('h2', { class: 'hg-sec-title', text: 'trends' }));
  const any = rows.some((r) => r.fasting != null || r.after != null || r.moves != null || r.expired);
  if (!any) { sec.append(el('p', { class: 'hg-empty', text: 'nothing to show yet. it fills in as readings are logged.' })); return sec; }

  sec.append(
    el('p', { class: 'hg-sec-note', text: 'daily numbers for this month. a gap is a day with nothing logged' }),
    el('div', { class: 'tr-card' },
      el('h3', { class: 'tr-title', text: 'sugar (mg/dL)' }),
      sugarChart(rows, s),
      el('ul', { class: 'tr-legend' },
        legendItem('tr-sw-fast', 'fasting'), legendItem('tr-sw-after', 'after-meal average'), legendItem('tr-sw-above', 'above target'))),
    el('div', { class: 'tr-card' },
      el('h3', { class: 'tr-title', text: `minutes to ${s.kicks.goal} movements` }),
      moveChart(rows, s.kicks.goal),
      el('ul', { class: 'tr-legend' },
        legendItem('tr-sw-move', 'mean minutes'), legendItem('tr-sw-alert', 'window passed'))),
    el('div', { class: 'tr-card' },
      el('h3', { class: 'tr-title', text: 'by week' }),
      el('ul', { class: 'tr-weeks' }, ...weekRows(rows))));
  return sec;
}
