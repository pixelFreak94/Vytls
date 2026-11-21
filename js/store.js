// store.js — the only file that touches storage.
// Loads, saves and migrates the one data object (DEV_PLAN §4).
// Every write goes through update(); every change is saved at once.

const KEY = 'vytls';
const CORRUPT_KEY = 'vytls.unreadable';   // a copy of data that would not parse, never deleted by the app
export const DATA_VERSION = 3;
export const MEALS = ['breakfast', 'lunch', 'dinner'];

function defaults() {
  return {
    version: DATA_VERSION,
    settings: {
      startDate: '',                                  // set to the first day on first run
      lengthDays: 30,
      targets: { fasting: 95, afterMeal: 120 },       // mg/dL, flag when above
      kicks: { goal: 5, windowMinutes: 60 },
      slowAlert: { factor: 2, extraMinutes: 15, lastSessions: 7, minSessions: 5 },  // A2 (DEV_PLAN §6)
      dayStartHour: 4,
      doctorPhone: '',
      ambient: true,
      sound: false,
      lastBackupAt: null,
      account: '',                                    // 'admin' on a test phone, her email on hers; asked once
    },
    days: {},
    foodHistory: [],
    dishes: [],                                       // [{ name, foods }], most used first: a dish name brings back its ingredients
    alerts: [],
  };
}

// Fill any missing fields from the defaults without touching what is there.
function fillMissing(target, base) {
  for (const k of Object.keys(base)) {
    const b = base[k];
    if (!(k in target) || target[k] === undefined) {
      target[k] = structuredClone(b);
    } else if (b && typeof b === 'object' && !Array.isArray(b) && target[k] && typeof target[k] === 'object') {
      fillMissing(target[k], b);
    }
  }
  return target;
}

// Upgrades from older shapes go here, one step per version. Never change the shape without one.
const MIGRATIONS = {
  // 2: every meal gets a dish name (empty until she types one)
  1: (d) => {
    for (const day of Object.values(d.days ?? {})) {
      for (const meal of MEALS) { const m = day?.meals?.[meal]; if (m && m.dish === undefined) m.dish = ''; }
    }
    d.version = 2;
    return d;
  },
  // 3: every meal gets a list of snacks eaten after it ({ at, foods, note? })
  2: (d) => {
    for (const day of Object.values(d.days ?? {})) {
      for (const meal of MEALS) { const m = day?.meals?.[meal]; if (m && !Array.isArray(m.snacks)) m.snacks = []; }
    }
    d.version = 3;
    return d;
  },
};

function migrate(d) {
  // Data from a newer version (e.g. after a rollback) is kept as it is: unknown fields survive.
  if (typeof d.version !== 'number') d.version = DATA_VERSION;
  while (d.version < DATA_VERSION && MIGRATIONS[d.version]) d = MIGRATIONS[d.version](d);
  return fillMissing(d, defaults());
}

let data = null;
let lastSaveOk = true;
const listeners = new Set();

export function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { raw = null; }
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // Before an update reshapes the data, keep an untouched copy (never deleted by the app).
      if ((parsed.version ?? 0) < DATA_VERSION) {
        try { localStorage.setItem(`${KEY}.before-v${DATA_VERSION}`, raw); } catch { /* keep going */ }
      }
      data = migrate(parsed);
    } catch {
      try { localStorage.setItem(CORRUPT_KEY, raw); } catch { /* keep going */ }
      data = defaults();
    }
  } else {
    data = defaults();
  }
  if (!data.settings.startDate) data.settings.startDate = dayKey(Date.now());
  save();
  try { navigator.storage?.persist?.(); } catch { /* best effort */ }
  return data;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    lastSaveOk = true;
  } catch {
    lastSaveOk = false;
  }
  return lastSaveOk;
}

/** Read-only view of the data. Do not mutate; use update(). */
export function get() { return data; }
export function saveOk() { return lastSaveOk; }

/** Change the data and save it. fn(data) mutates in place. Returns true if it reached storage. */
export function update(fn) {
  fn(data);
  const ok = save();
  for (const l of listeners) l(data);
  return ok;
}

/** Replace everything with a restored backup. The current data is kept first under
 *  vytls.before-restore (never deleted by the app), and the backup is upgraded and filled in
 *  like any stored data, so an older file cannot leave a field missing. */
export function replaceAll(incoming) {
  try { localStorage.setItem(`${KEY}.before-restore`, JSON.stringify(data)); } catch { /* keep going */ }
  const account = data.settings.account;   // the phone keeps its own username, whatever the file says
  data = migrate(structuredClone(incoming));
  data.settings.account = account;
  if (!data.settings.startDate) data.settings.startDate = dayKey(Date.now());
  const ok = save();
  for (const l of listeners) l(data);
  return ok;
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// ---- days -------------------------------------------------------------

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The app's day for a timestamp. The day runs dayStartHour to dayStartHour (DECISIONS 17). */
export function dayKey(ts, startHour = data?.settings.dayStartHour ?? 4) {
  const d = new Date(ts);
  if (d.getHours() < startHour) d.setDate(d.getDate() - 1);
  return fmt(d);
}

export function todayKey() { return dayKey(Date.now()); }

/** Whole days from a to b (YYYY-MM-DD), counted on the calendar, safe across clock changes. */
export function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return fmt(new Date(y, m - 1, d + n));
}

/** Where a day sits in the 30-day months: { month: 1.., day: 1..lengthDays }. null before the start date. */
export function dayPosition(key) {
  const { startDate, lengthDays } = data.settings;
  const n = daysBetween(startDate, key);
  if (n < 0) return null;
  return { month: Math.floor(n / lengthDays) + 1, day: (n % lengthDays) + 1, lengthDays };
}

/** The keys of the month a day belongs to, first to last. */
export function monthKeys(month) {
  const { startDate, lengthDays } = data.settings;
  const first = addDays(startDate, (month - 1) * lengthDays);
  return Array.from({ length: lengthDays }, (_, i) => addDays(first, i));
}

function emptyDay() {
  const meal = () => ({ dish: '', foods: [], finishedAt: null, sugar: null, kicks: null, snacks: [] });
  return { fasting: null, meals: { breakfast: meal(), lunch: meal(), dinner: meal() } };
}

/** A day's record. Read-only; returns an empty shape if nothing is logged. */
export function getDay(key) { return data.days[key] ?? emptyDay(); }

/** Change one day and save. fn(day) mutates in place. */
export function updateDay(key, fn) {
  return update((d) => {
    if (!d.days[key]) d.days[key] = emptyDay();
    fn(d.days[key]);
  });
}

/** A meal's snacks in time order (eaten after the meal, before the next one). */
export function snacksOf(m) { return [...(m?.snacks ?? [])].sort((a, b) => a.at - b.at); }

/** The snacks eaten after a meal and before its 2-hour test was taken (all of them if no test yet). */
export function snacksBeforeTest(m) {
  const by = m?.sugar?.at ?? Infinity;
  return snacksOf(m).filter((x) => x.at <= by);
}

/** The one movement session still running, if any: { key, meal, kicks }. */
export function runningSession() {
  for (const [key, day] of Object.entries(data.days)) {
    for (const meal of MEALS) {
      const k = day.meals?.[meal]?.kicks;
      if (k && k.startedAt && !k.endedAt) return { key, meal, kicks: k };
    }
  }
  return null;
}

// ---- foods ------------------------------------------------------------

/** A food as shown and saved: one capital letter, the rest lowercase ("chicken BIRYANI" → "Chicken biryani"). */
export function foodName(name) {
  const f = String(name ?? '').trim().replace(/\s+/g, ' ');
  return f ? f[0].toUpperCase() + f.slice(1).toLowerCase() : '';
}

/** Remember a food: front of foodHistory (most used first), newest spelling kept, capped at 200. */
export function noteFood(name) {
  const f = foodName(name);
  if (!f) return false;
  return update((d) => {
    d.foodHistory = [f, ...d.foodHistory.filter((x) => x.toLowerCase() !== f.toLowerCase())].slice(0, 200);
  });
}

const same = (a, b) => foodName(a).toLowerCase() === foodName(b).toLowerCase();

/** Rename a food everywhere: suggestions, dishes and every meal it is in (a typo fix). Merges into an existing name. */
export function renameFood(from, to) {
  const t = foodName(to);
  if (!t) return false;
  const fix = (list) => list.reduce((out, x) => {
    const y = same(x, from) ? t : x;
    if (!out.some((o) => same(o, y))) out.push(y);
    return out;
  }, []);
  return update((d) => {
    d.foodHistory = fix(d.foodHistory);
    for (const dish of d.dishes) dish.foods = fix(dish.foods);
    for (const day of Object.values(d.days)) for (const meal of MEALS) {
      const m = day.meals?.[meal];
      if (m?.foods) m.foods = fix(m.foods);
      for (const x of m?.snacks ?? []) x.foods = fix(x.foods ?? []);
    }
  });
}

/** Take a food out of the suggestions and the saved dishes. Meals already logged keep it. */
export function forgetFood(name) {
  return update((d) => {
    d.foodHistory = d.foodHistory.filter((x) => !same(x, name));
    for (const dish of d.dishes) dish.foods = dish.foods.filter((x) => !same(x, name));
  });
}

/** A saved dish by name, or null. */
export function findDish(name) {
  return name ? data.dishes.find((x) => same(x.name, name)) ?? null : null;
}

/** Remember a dish with its ingredients, at the front (most used first), capped at 100. */
export function noteDish(name, foods) {
  const n = foodName(name);
  if (!n) return false;
  return update((d) => {
    d.dishes = [{ name: n, foods: [...foods] }, ...d.dishes.filter((x) => !same(x.name, n))].slice(0, 100);
  });
}

/** Rename a dish everywhere: the saved list and every meal that carries it. */
export function renameDish(from, to) {
  const t = foodName(to);
  if (!t) return false;
  return update((d) => {
    const keep = d.dishes.find((x) => same(x.name, from));
    d.dishes = d.dishes.filter((x) => !same(x.name, from) && !same(x.name, t));
    if (keep) d.dishes.unshift({ name: t, foods: keep.foods });
    for (const day of Object.values(d.days)) for (const meal of MEALS) { const m = day.meals?.[meal]; if (m?.dish && same(m.dish, from)) m.dish = t; }
  });
}

/** Take a dish out of the saved list. Meals already logged keep their name. */
export function forgetDish(name) {
  return update((d) => { d.dishes = d.dishes.filter((x) => !same(x.name, name)); });
}

// ---- settings ---------------------------------------------------------

/** Set one setting by path, e.g. setSetting('targets.fasting', 95). */
export function setSetting(path, value) {
  return update((d) => {
    const parts = path.split('.');
    let o = d.settings;
    for (const p of parts.slice(0, -1)) o = o[p];
    o[parts.at(-1)] = value;
  });
}

// ---- username (DECISIONS 43) ---------------------------------------------
// Asked once per phone. 'admin' marks a test phone: it makes no backups. Anything else is her
// email. A backup file only restores onto a phone signed in with the same username.

export const TEST_ACCOUNT = 'admin';

/** A typed username as it is stored ('admin' or a lowercase email), or null if it is neither. */
export function parseAccount(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === TEST_ACCOUNT) return s;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}
export function account() { return data.settings.account || ''; }
export function isTestDevice() { return account() === TEST_ACCOUNT; }
export function setAccount(name) { return setSetting('account', name); }

/** Logging is blocked until the doctor's number is saved (DECISIONS 21). */
export function canLog() { return data.settings.doctorPhone.trim() !== ''; }
