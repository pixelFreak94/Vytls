// settings.js — the settings room body (DEV_PLAN §9, manual §16.12, §28.11).
// renderSettings(bodyEl) is called every time the room opens. A value is saved only when it is valid;
// an invalid one shows the error state and the old saved value stays.

import * as store from './store.js';
import { VERSION } from './app.js';
import { enable, disable } from './audio.js';
import { askAccount } from './signin.js';

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

const getPath = (path) => path.split('.').reduce((o, k) => o?.[k], store.get().settings);
const defaultsLine = 'Defaults. Set them to the numbers your doctor gives you.';

// ---- validators: return { ok, value } or { ok: false, msg } ----
const range = (min, max) => (raw) => {
  const s = raw.trim();
  if (!/^\d+$/.test(s)) return { ok: false, msg: `Whole numbers from ${min} to ${max}.` };
  const n = Number(s);
  return n >= min && n <= max ? { ok: true, value: n } : { ok: false, msg: `Whole numbers from ${min} to ${max}.` };
};
const decimal = (min, max) => (raw) => {
  const s = raw.trim().replace(',', '.');
  const msg = `A number from ${min} to ${max}, one decimal at most.`;
  if (!/^\d+(\.\d)?$/.test(s)) return { ok: false, msg };
  const n = Number(s);
  return n >= min && n <= max ? { ok: true, value: n } : { ok: false, msg };
};
const phone = (raw) => {
  const s = raw.trim();
  const msg = 'Use at least 6 digits. Spaces, +, - and brackets are fine.';
  if (!/^[0-9\s+\-()]+$/.test(s)) return { ok: false, msg };
  return s.replace(/\D/g, '').length >= 6 ? { ok: true, value: s } : { ok: false, msg };
};
const dateKey = (raw) => (/^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw))
  ? { ok: true, value: raw } : { ok: false, msg: 'Pick the first day of the month.' });

// ---- one text field: label above, input, unit beside, one calm sentence on error ----
function field({ path, label, unit, check, input = {} }) {
  const id = `s-${path.replace(/\./g, '-')}`;
  const note = el('p', { class: 'field-note', id: `${id}-note`, hidden: true, role: 'status' });
  const inp = el('input', {
    class: 'field-input', id, name: id, type: 'text', autocomplete: 'off',
    autocapitalize: 'off', spellcheck: 'false', 'aria-describedby': note.id, ...input,
  });
  inp.value = String(getPath(path) ?? '');
  const row = el('div', { class: 'field-row' }, inp);
  if (unit) row.append(el('span', { class: 'field-unit', 'aria-hidden': 'true', text: unit }));
  const wrap = el('div', { class: 'field reveal-item' }, el('label', { class: 'field-label', for: id, text: label }), row, note);

  const showError = (msg) => {
    wrap.classList.add('is-error');
    inp.setAttribute('aria-invalid', 'true');
    note.textContent = msg; note.hidden = false;
  };
  const clearError = () => {
    wrap.classList.remove('is-error');
    inp.removeAttribute('aria-invalid');
    note.hidden = true; note.textContent = '';
  };
  inp.addEventListener('input', () => {
    if (wrap.classList.contains('is-error') && check(inp.value).ok) clearError();
  });
  inp.addEventListener('change', () => {
    const r = check(inp.value);
    if (!r.ok) { showError(r.msg); return; }
    clearError();
    if (getPath(path) !== r.value) store.setSetting(path, r.value);
    wrap.dispatchEvent(new CustomEvent('saved', { bubbles: true }));
  });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  return wrap;
}

const numField = (path, label, min, max, unit, extra = {}) =>
  field({ path, label, unit, check: range(min, max), input: { inputmode: 'numeric', ...extra } });

// ---- a toggle with its mono value label beside it ----
function toggle({ path, name, onLabel, offLabel, onChange }) {
  const btn = el('button', { class: 'toggle', type: 'button', role: 'switch', 'aria-label': name });
  const value = el('span', { class: 'toggle-value', 'aria-hidden': 'true' });
  const row = el('div', { class: 'toggle-row reveal-item' }, btn, value);
  const paint = (on) => {
    btn.setAttribute('aria-checked', String(on));
    value.textContent = on ? onLabel : offLabel;
  };
  paint(Boolean(getPath(path)));
  const flip = () => {
    const next = !(btn.getAttribute('aria-checked') === 'true');
    onChange?.(next);               // inside the tap, so audio can start
    paint(next);
    store.setSetting(path, next);
  };
  btn.addEventListener('click', flip);
  value.addEventListener('click', flip);
  // animate the thumb only after the first paint, not on arrival
  requestAnimationFrame(() => requestAnimationFrame(() => btn.classList.add('is-live')));
  return row;
}

const group = (title, ...rows) => {
  const label = el('p', { class: 'label settings-label reveal-item', text: title });
  return el('section', { class: 'settings-group' }, label, el('div', { class: 'settings-rows' }, ...rows));
};
const line = (text) => el('p', { class: 'settings-line reveal-item', text });

// ---- saved dishes and foods: rename (fixes it everywhere) or remove from the suggestions ----
function nameList({ title, names, rename, forget, empty }) {
  const box = el('div', { class: 'name-list reveal-item' });
  const paint = () => {
    const items = names();
    box.replaceChildren(el('p', { class: 'field-label', text: title }),
      items.length ? el('ul', { class: 'food-list' }, ...items.map((name) => {
        const inp = el('input', {
          class: 'field-input', type: 'text', 'aria-label': `rename ${name}`, autocomplete: 'off',
          autocapitalize: 'sentences', autocorrect: 'on', spellcheck: 'true', enterkeyhint: 'done',
        });
        inp.value = name;
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
        inp.addEventListener('change', () => {
          const to = store.foodName(inp.value);
          if (!to) { inp.value = name; return; }
          if (to !== name) { rename(name, to); paint(); }
        });
        const rm = el('button', { class: 'food-remove', type: 'button', 'aria-label': `remove ${name}`, text: '×' });
        rm.addEventListener('click', () => { forget(name); paint(); });
        return el('li', { class: 'food-item name-item' }, inp, rm);
      })) : el('p', { class: 'settings-line', text: empty }));
  };
  paint();
  return box;
}

export function renderSettings(bodyEl) {
  // 01 — doctor
  const phoneField = field({
    path: 'doctorPhone', label: "doctor's phone", check: phone,
    input: { type: 'tel', inputmode: 'tel', autocomplete: 'tel', placeholder: 'e.g. +00 000 000 000' },
  });
  const phoneLine = line('Logging opens once this is saved.');
  const syncPhoneLine = () => { phoneLine.hidden = store.canLog(); };
  syncPhoneLine();
  phoneField.addEventListener('saved', syncPhoneLine);

  // the username is asked once; this is the way to correct a mistyped one
  const changeName = el('button', { class: 'btn btn-ghost reveal-item', type: 'button', text: 'change username' });
  changeName.addEventListener('click', async () => {
    const name = await askAccount({ current: store.account() });
    if (name) { store.setAccount(name); renderSettings(bodyEl); }
  });

  const root = el('div', { class: 'settings' },
    group('01 — doctor', phoneField, phoneLine),
    group('02 — sugar targets',
      numField('targets.fasting', 'fasting', 60, 250, 'mg/dL'),
      numField('targets.afterMeal', 'after meals', 60, 250, 'mg/dL'),
      line(defaultsLine)),
    group('03 — movements',
      numField('kicks.goal', 'goal', 1, 20),
      numField('kicks.windowMinutes', 'window', 10, 180, 'min')),
    group('04 — slower than usual',
      field({ path: 'slowAlert.factor', label: 'factor', unit: '×', check: decimal(1.2, 5), input: { inputmode: 'decimal' } }),
      numField('slowAlert.extraMinutes', 'extra minutes', 0, 60, 'min'),
      numField('slowAlert.lastSessions', 'sessions compared', 3, 20),
      numField('slowAlert.minSessions', 'sessions needed first', 3, 20),
      line(defaultsLine)),
    group('05 — the month',
      field({ path: 'startDate', label: 'start date', check: dateKey, input: { type: 'date' } }),
      numField('dayStartHour', 'day starts at', 0, 6, 'h')),
    group('06 — room',
      toggle({ path: 'ambient', name: 'ambient', onLabel: 'ambient · full', offLabel: 'ambient · min' }),
      toggle({
        path: 'sound', name: 'sound', onLabel: 'sound · on', offLabel: 'sound · off',
        onChange: (on) => (on ? enable() : disable()),
      })),
    group('07 — dishes and foods',
      nameList({
        title: 'dishes', empty: 'none yet. a dish is saved when a meal with a name is finished.',
        names: () => store.get().dishes.map((x) => x.name),
        rename: store.renameDish, forget: store.forgetDish,
      }),
      nameList({
        title: 'ingredients', empty: 'none yet.',
        names: () => [...new Set(store.get().foodHistory.map(store.foodName))],
        rename: store.renameFood, forget: store.forgetFood,
      }),
      line('Renaming fixes it in every meal. × takes it out of the suggestions; meals already logged keep it.')),
    group('08 — this phone',
      line(store.isTestDevice() ? `signed in as ${store.account()} · test phone, backups off` : `signed in as ${store.account()}`),
      changeName),
    el('p', { class: 'label settings-foot reveal-item', text: `vytls · ${VERSION}` }),
  );
  bodyEl.replaceChildren(root);
}
