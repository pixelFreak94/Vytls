// history.js — the History room: a month grid and the foods list (manual §28.10, §28.8; DEV_PLAN §7).
// renderHistory(body, { openDay }) is idempotent: it rebuilds the body every time.
// Thresholds are read from settings on every render. Words state; they never judge (manual §28.11).

import * as store from './store.js';
import { renderTrends } from './trends.js';

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

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MEAL_HEAD = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const FOODS_SHOWN = 12;

let shown = null;   // the month on screen; null = the current month

const parts = (key) => key.split('-').map(Number);
const shortDate = (key) => { const [, m, d] = parts(key); return `${d} ${MONTHS[m - 1]}`; };
const weekday = (key) => { const [y, m, d] = parts(key); return WEEKDAYS[new Date(y, m - 1, d).getDay()]; };

/** Just the month (owner, 0.4.1): the current one for this month's grid, else the month it began in. */
function monthName(key) { const [y, m] = parts(key); return `${MONTH_NAMES[m - 1]} ${y}`; }

function currentMonth() {
  const p = store.dayPosition(store.todayKey());
  return p ? p.month : 1;
}

function sugarCell(entry, limit) {
  if (!entry || entry.value == null) return el('span', { class: 'hg-cell hg-none', text: '–', 'aria-label': 'not logged' });
  const above = entry.value > limit;
  return el('span', {
    class: 'hg-cell hg-num' + (above ? ' hg-above' : ''),
    'aria-label': `${entry.value}${above ? ', above target' : ''}`,
  }, above ? el('span', { class: 'hg-mark', 'aria-hidden': 'true', text: '▲' }) : '', String(entry.value));
}

function moveCell(k, goal) {
  if (!k || !k.startedAt) return el('span', { class: 'hg-cell hg-none', text: '–', 'aria-label': 'not logged' });
  if (k.outcome === 'reached' && k.endedAt) {
    const min = Math.max(1, Math.round((k.endedAt - k.startedAt) / 60000));
    return el('span', { class: 'hg-cell hg-num hg-reached', text: String(min), 'aria-label': `${goal} movements in ${min} minutes` });
  }
  if (k.outcome === 'window-expired') {
    return el('span', { class: 'hg-cell hg-num hg-expired', text: `${(k.taps || []).length}/${goal}`, 'aria-label': `window passed, ${(k.taps || []).length} of ${goal}` });
  }
  return el('span', { class: 'hg-cell hg-none', text: '–', 'aria-label': 'not completed' });
}

function dayRow(key, today, openDay, s) {
  const day = store.getDay(key);
  const future = key > today;
  const p = store.dayPosition(key);
  const cells = [sugarCell(day.fasting, s.targets.fasting)];
  for (const meal of store.MEALS) {
    cells.push(sugarCell(day.meals[meal].sugar, s.targets.afterMeal));
    cells.push(moveCell(day.meals[meal].kicks, s.kicks.goal));
  }
  const label = el('span', { class: 'hg-day' },
    el('span', { class: 'hg-daynum', text: String(parts(key)[2]) }),
    el('span', { class: 'hg-wd', text: weekday(key) }));
  const cls = 'hg-row' + (key === today ? ' hg-today' : '') + (future ? ' hg-future' : '');
  const row = el(future ? 'div' : 'button', {
    class: cls,
    type: future ? null : 'button',
    'data-day': key,
    'aria-label': future ? null : `${shortDate(key)}${key === today ? ', today' : ''}`,
  }, label, ...cells);
  if (!future) row.addEventListener('click', () => openDay?.(key, row));
  return row;
}

/** Foods ranked by how often they were in a meal whose after-meal reading was above target. */
function foodsBeforeAbove(s) {
  const tally = new Map();   // lowercase -> { name, above, all }
  for (const day of Object.values(store.get().days)) {
    for (const meal of store.MEALS) {
      const m = day.meals?.[meal];
      // snacks eaten before the test count as part of what preceded the reading
      const eaten = [...(m?.foods ?? []), ...store.snacksBeforeTest(m).flatMap((x) => x.foods ?? [])];
      if (!eaten.length) continue;
      const above = m.sugar && m.sugar.value > s.targets.afterMeal;
      const seen = new Set();
      for (const f of eaten) {
        const k = store.foodName(f).toLowerCase();
        if (!k || seen.has(k)) continue;
        seen.add(k);
        const t = tally.get(k) ?? { name: store.foodName(f), above: 0, all: 0 };
        t.all++;
        if (above) t.above++;
        tally.set(k, t);
      }
    }
  }
  return [...tally.values()].filter((t) => t.above > 0)
    .sort((a, b) => b.above - a.above || (b.above / b.all) - (a.above / a.all) || a.name.localeCompare(b.name))
    .slice(0, FOODS_SHOWN);
}

export function renderHistory(body, { openDay } = {}) {
  const s = store.get().settings;
  const today = store.todayKey();
  const cur = currentMonth();
  if (shown == null || shown > cur) shown = cur;
  if (shown < 1) shown = 1;
  const keys = store.monthKeys(shown);

  const nav = el('div', { class: 'hg-nav' },
    el('button', { class: 'hg-arrow', type: 'button', 'aria-label': 'previous month', text: '‹', disabled: shown <= 1 }),
    el('p', { class: 'hg-range', text: monthName(shown === cur ? today : keys[0]) }),
    el('button', { class: 'hg-arrow', type: 'button', 'aria-label': 'next month', text: '›', disabled: shown >= cur }));
  const [prev, next] = [nav.firstChild, nav.lastChild];
  const go = (d) => { shown += d; renderHistory(body, { openDay }); };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  const head = el('div', { class: 'hg-head', 'aria-hidden': 'true' },
    el('span', { class: 'hg-day' }),
    el('span', { class: 'hg-h1', text: 'Fasting' }),
    ...store.MEALS.map((m) => el('span', { class: 'hg-h2', text: MEAL_HEAD[m] })));
  // two-level head: meal name spans sugar + movements, then sub-labels
  const head2 = el('div', { class: 'hg-head hg-head-sub', 'aria-hidden': 'true' },
    el('span', { class: 'hg-day' }),
    el('span', { class: 'hg-h1', text: 'sug' }),
    ...store.MEALS.flatMap(() => [el('span', { class: 'hg-h1', text: 'sug' }), el('span', { class: 'hg-h1', text: 'mov' })]));

  const grid = el('div', { class: 'hg-grid', role: 'group', 'aria-label': 'daily log for the month' }, head, head2,
    ...keys.map((k) => dayRow(k, today, openDay, s)));

  const foods = foodsBeforeAbove(s);
  const list = foods.length
    ? el('ul', { class: 'hg-foods' }, ...foods.map((f) =>
        el('li', { class: 'hg-food' },
          el('span', { class: 'hg-food-name', text: f.name }),
          el('span', { class: 'hg-food-n', text: `${f.above} of ${f.all}` }))))
    : el('p', { class: 'hg-empty', text: 'nothing to show yet. it fills in as after-meal readings are logged.' });

  body.replaceChildren(
    nav, grid,
    el('section', { class: 'hg-section' },
      el('h2', { class: 'hg-sec-title', text: 'foods before readings above target' }),
      el('p', { class: 'hg-sec-note', text: 'times in a meal before an above-target reading, of times eaten' }),
      list),
    renderTrends(keys));
}
