// store.js — the only file that touches storage.
// Loads, saves and migrates the one data object (DEV_PLAN §4).
// Every write goes through update(); every change is saved at once.

const KEY = 'vytls';
const CORRUPT_KEY = 'vytls.unreadable';   // a copy of data that would not parse, never deleted by the app
export const DATA_VERSION = 1;
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
    },
    days: {},
    foodHistory: [],
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
  // 1: (d) => { ...; d.version = 2; return d; },
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
  data = migrate(structuredClone(incoming));
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
  const meal = () => ({ foods: [], finishedAt: null, sugar: null, kicks: null });
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

/** Remember a food: front of foodHistory (most used first), newest spelling kept, capped at 200. */
/** A food as shown and saved: one capital letter, the rest lowercase ("chicken BIRYANI" → "Chicken biryani"). */
export function foodName(name) {
  const f = String(name ?? '').trim().replace(/\s+/g, ' ');
  return f ? f[0].toUpperCase() + f.slice(1).toLowerCase() : '';
}

export function noteFood(name) {
  const f = foodName(name);
  if (!f) return false;
  return update((d) => {
    d.foodHistory = [f, ...d.foodHistory.filter((x) => x.toLowerCase() !== f.toLowerCase())].slice(0, 200);
  });
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

/** Logging is blocked until the doctor's number is saved (DECISIONS 21). */
export function canLog() { return data.settings.doctorPhone.trim() !== ''; }
