// app.js — start-up order, navigation between rooms, the status readout and live chip.
// Manual §13.4 (room change), §16.1 (readout), §16.11 (live chip), §17 (journey), §28.3–28.4.

import * as store from './store.js';
import { initAtmosphere, setRoom as setAtmosphereRoom } from './atmosphere.js';
import { runEntry } from './entry.js';
import { renderSettings } from './settings.js';
import { initAudio, thup } from './audio.js';
import { renderToday as renderLifeline } from './today.js';

export const VERSION = '0.2.1';   // keep in step with sw.js (DEV_PLAN §3)

const ROOMS = ['today', 'history', 'report', 'settings'];   // fixed order (manual §28.3)
const CODES = { today: 'tod', history: 'his', report: 'rep', settings: 'set' };
const html = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);

// ---- one source of truth for the environment (manual §23.2) ----
export const env = {
  standalone: navigator.standalone === true || matchMedia('(display-mode: standalone)').matches,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
};

function tokenMs(name) {
  const v = getComputedStyle(html).getPropertyValue(name).trim();
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
}

function applySettingsToHtml(d) {
  html.dataset.ambient = d.settings.ambient ? 'on' : 'off';
  html.dataset.sound = d.settings.sound ? 'on' : 'off';
}

// ---- room bodies ----
function emptyState(line, action) {
  const wrap = document.createElement('div');
  wrap.className = 'empty';
  const p = document.createElement('p');
  p.className = 'body reveal-item';
  p.textContent = line;
  wrap.append(p);
  if (action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-filled reveal-item';
    b.textContent = action.label;
    b.addEventListener('click', action.onTap);
    wrap.append(b);
  }
  return wrap;
}

function renderToday() {
  const body = $('[data-body="today"]');
  body.replaceChildren();
  if (!store.canLog()) {
    body.append(emptyState("Add the doctor's number to begin. The alert's call button needs it.",
      { label: 'open settings', onTap: () => go('settings') }));
    return;
  }
  renderLifeline(body);
}

function renderRoom(room) {
  if (room === 'today') renderToday();
  else if (room === 'settings') renderSettings($('[data-body="settings"]'));
  else $(`[data-body="${room}"]`).replaceChildren(emptyState('Nothing here yet.'));
}

function indexReveals(section) {
  section.querySelectorAll('.reveal-item').forEach((el, i) => el.style.setProperty('--i', i));
}

// ---- navigation: rooms are peers, reached only from the nav (manual §17.1) ----
let current = null;
let crossing = null;   // { from, to, timers }

function finishCrossing() {
  if (!crossing) return;
  crossing.timers.forEach(clearTimeout);
  const { from, to } = crossing;
  if (from) { from.classList.remove('is-leaving', 'is-active'); from.hidden = true; }
  to.classList.remove('is-entering', 'is-revealing');
  html.classList.remove('is-crossing');
  crossing = null;
}

function setNavState(room) {
  document.querySelectorAll('#nav [data-go]').forEach((b) => {
    if (b.dataset.go === room) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  html.dataset.room = room;
  document.title = `Vytls — ${room}`;
}

/** Show a room. opts.boot: first arrival under the entry ripple (no crossfade, reveal only). */
export function go(room, opts = {}) {
  if (!ROOMS.includes(room) || room === current) return;
  finishCrossing();
  const from = current ? $(`#room-${current}`) : null;
  const to = $(`#room-${room}`);
  renderRoom(room);
  indexReveals(to);
  to.querySelector('.scroller').scrollTop = 0;
  to.hidden = false;
  setNavState(room);
  setAtmosphereRoom(room, { instant: !from });
  current = room;

  const cross = tokenMs('--d-cross');
  const revealEnd = tokenMs('--d-reveal-base') + tokenMs('--d-reveal') +
    to.querySelectorAll('.reveal-item').length * tokenMs('--d-reveal-step');
  const timers = [];

  if (opts.boot || !from) {
    to.style.setProperty('--reveal-base', opts.boot ? '0ms' : '');
    to.classList.add('is-active', 'is-revealing');
  } else {
    to.style.removeProperty('--reveal-base');
    from.classList.add('is-leaving');
    from.classList.remove('is-active');
    to.classList.add('is-entering', 'is-active', 'is-revealing');
    html.classList.add('is-crossing');
    timers.push(setTimeout(() => html.classList.remove('is-crossing'), tokenMs('--d-chrome-return')));
    morphChip(CODES[room]);
    thup();
  }
  crossing = { from, to, timers };
  timers.push(setTimeout(finishCrossing, Math.max(cross, revealEnd)));
}

// The nav pill's creamy pour holds through the room change, then drains (manual §13.3).
function pour(btn) {
  if (!btn.classList.contains('nav-pill')) return;
  clearTimeout(btn._pourT);
  btn.classList.remove('is-draining');
  btn.classList.add('is-pouring');
  btn._pourT = setTimeout(() => {
    btn.classList.replace('is-pouring', 'is-draining');
    btn._pourT = setTimeout(() => btn.classList.remove('is-draining'), tokenMs('--d-drain'));
  }, tokenMs('--d-pour-hold'));
}

// ---- status readout (manual §16.1, §28.3) ----
function hourBand(h) {
  if (h >= 20 || h < 6) return 'moon';
  if (h < 9 || h >= 17) return 'lowsun';
  return 'sun';
}
const GLYPHS = {
  sun: '<svg viewBox="0 0 13 13" aria-hidden="true"><circle cx="6.5" cy="6.5" r="3.4" fill="var(--glyph-sun)"/></svg>',
  lowsun: '<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M2.6 8.6a3.9 3.9 0 0 1 7.8 0z" fill="var(--glyph-lowsun)"/><rect x="1.5" y="9.6" width="10" height="1.2" rx=".6" fill="var(--glyph-lowsun)"/></svg>',
  moon: '<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M8.9 9.6A4 4 0 0 1 5 2.6a4 4 0 1 0 3.9 7z" fill="var(--glyph-moon)"/></svg>',
};

function readoutText() {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const pos = store.dayPosition(store.todayKey());
  return pos ? `day ${pos.day} of ${pos.lengthDays} · ${time}` : time;
}

let readoutBand = null;
function paintReadout() {
  const band = hourBand(new Date().getHours());
  if (band !== readoutBand) { $('#readout-glyph').innerHTML = GLYPHS[band]; readoutBand = band; }
  $('#readout-text').textContent = readoutText();
}

function typeReadout() {
  const el = $('#readout-text');
  const text = readoutText();
  if (env.reducedMotion) { paintReadout(); return; }
  paintReadout();
  el.textContent = '';
  el.classList.add('is-typing');
  let i = 0;
  const step = tokenMs('--type-char');
  const t = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) {
      clearInterval(t);
      setTimeout(() => el.classList.remove('is-typing'), 350);
    }
  }, step);
}

function startClock() {
  const tick = () => {
    paintReadout();
    setTimeout(tick, 60000 - (Date.now() % 60000) + 50);   // re-sync on the minute boundary
  };
  setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) paintReadout(); });
}

// ---- live chip (manual §16.11) ----
let chipTimer = null;
function morphChip(code) {
  const chip = $('#live-chip');
  $('.live-text', chip).textContent = `→ ${code}`;
  chip.classList.add('is-morphed');
  clearTimeout(chipTimer);
  chipTimer = setTimeout(() => chip.classList.remove('is-morphed'), tokenMs('--chip-hold'));
}

// ---- auto-update (sw.js explains the steps) ----
// A new version waits until it is safe to swap: no movement count running, nothing being
// typed, no sheet open. It swaps while the app is hidden, or at launch.
function safeToSwap() {
  if (store.runningSession()) return false;
  const a = document.activeElement;
  if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false;
  if (document.querySelector('[role="dialog"]')) return false;
  return true;
}

function initUpdates() {
  if (!('serviceWorker' in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;   // first install: nothing to reload
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const trySwap = () => { if (reg.waiting && safeToSwap()) reg.waiting.postMessage('take-over'); };
    trySwap();   // launch: a version that arrived last time goes in now
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && document.hidden) trySwap(); });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) trySwap();
      else reg.update().catch(() => {});   // back on screen: look for a new version
    });
  }).catch(() => { /* offline copy unavailable; the app still runs */ });
}

// ---- boot ----
function boot() {
  const data = store.load();
  applySettingsToHtml(data);
  html.dataset.standalone = String(env.standalone);
  initAtmosphere($('#world'));
  initAudio(data.settings.sound);
  initUpdates();

  // The app runs in a browser tab too (owner's call). Note: on iPhone, Safari and the
  // Home Screen app keep separate records, so readings do not move between them.

  // Phase 5: if an alert is owed, paint it here, before the ball (manual §28.4).

  store.subscribe((d) => {
    applySettingsToHtml(d);
    paintReadout();
    if (current === 'today') renderToday();
  });

  document.querySelectorAll('#nav [data-go]').forEach((b) =>
    b.addEventListener('click', () => { pour(b); go(b.dataset.go); }));

  runEntry({
    ready: document.fonts ? document.fonts.ready : Promise.resolve(),
    reduced: env.reducedMotion,
    mount: () => {
      html.dataset.entered = 'true';
      $('#nav').hidden = false;
      go('today', { boot: true });
      typeReadout();
      startClock();
    },
  });
}

boot();
