// entry.js — the ball as the loader (manual §15.2, §17.2, §28.4).
// Plays once per launch inside #entry. Timings come from tokens.css.

const html = document.documentElement;
const tokMs = (name) => {
  const v = getComputedStyle(html).getPropertyValue(name).trim();
  return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const BALL_SVG = `
<svg class="entry-ball" viewBox="0 0 72 72" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ball-top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--c-ball-hi-hi)"/><stop offset="1" style="stop-color:var(--a-terra)"/>
    </linearGradient>
    <linearGradient id="ball-bot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--c-ball-lo-hi)"/><stop offset="1" style="stop-color:var(--c-ball-lo)"/>
    </linearGradient>
    <radialGradient id="ball-sheen" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" style="stop-color:var(--ball-sheen)"/><stop offset="1" style="stop-color:var(--ball-sheen);stop-opacity:0"/>
    </radialGradient>
  </defs>
  <path d="M1 36 A35 35 0 0 1 71 36 Z" fill="url(#ball-top)"/>
  <path d="M1 36 A35 35 0 0 0 71 36 Z" fill="url(#ball-bot)"/>
  <circle cx="36" cy="36" r="35" fill="none" style="stroke:var(--g-hair)" stroke-width="1"/>
  <rect x="1" y="33" width="70" height="6" style="fill:var(--t-primary)"/>
  <circle cx="36" cy="36" r="10" style="fill:var(--t-primary)"/>
  <circle cx="36" cy="36" r="5.4" style="fill:var(--c-ball-lo-hi)"/>
  <circle class="glint" cx="36" cy="36" r="5.4" style="fill:var(--ball-glint)"/>
  <circle cx="36" cy="36" r="5.4" fill="none" style="stroke:var(--t-primary)" stroke-width="1.2"/>
  <ellipse cx="24" cy="20" rx="13" ry="8" transform="rotate(-35 24 20)" fill="url(#ball-sheen)"/>
</svg>`;

function build(el, reduced) {
  el.className = 'entry chrome' + (reduced ? ' is-reduced' : '');
  el.innerHTML = `
    <div class="entry-field grain"></div>
    <div class="entry-ripple">
      <div class="rp rp-drop" style="--k:0"></div>
      <div class="rp rp-ring" style="--k:0"></div>
      <div class="rp rp-ring" style="--k:1"></div>
      <div class="rp rp-ring" style="--k:2"></div>
    </div>
    <div class="entry-stage">
      <div class="entry-pop"><div class="entry-rock">${BALL_SVG}</div></div>
      <p class="label entry-label">vytls · initializing</p>
    </div>`;
}

export function runEntry({ ready, reduced, mount }) {
  const el = document.getElementById('entry');
  if (!el) { mount(); return Promise.resolve(); }
  build(el, reduced);
  const settled = Promise.resolve(ready).catch(() => {});

  if (reduced) {
    return settled.then(() => {
      mount();
      el.classList.add('is-fading');
      return wait(tokMs('--d-state'));
    }).then(() => { el.remove(); });
  }

  const minBeat = wait(tokMs('--entry-min'));
  return Promise.all([settled, minBeat]).then(() => {
    el.classList.add('is-catch');
    return wait(tokMs('--entry-mount-at'));
  }).then(() => {
    mount();
    return wait(tokMs('--entry-clear-at') - tokMs('--entry-mount-at'));
  }).then(() => { el.remove(); });
}
