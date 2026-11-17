// atmosphere.js — the L1 world: room colour, hour tint, drifting blobs, corner web, touch bloom.
// Manual §11.3, §11.6, §12.2, §13.3, §13.5, §28.7. All values live in tokens.css; motion in motion.css.

const html = document.documentElement;
const NS_ROOMS = ['today', 'history', 'report', 'settings'];
const BLOBS = ['peach', 'lavender', 'mint', 'paleblue', 'coral'];

let world = null;
let fogs = {};
let zTop = 1;
let currentRoom = null;
let hourTimer = null;

const tok = (name) => getComputedStyle(html).getPropertyValue(name).trim();

// ---- colour helpers: blend a room colour 18% toward the hour tint (manual §11.6) ----
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function hourTint(h) {
  if (h >= 5 && h < 9) return tok('--hour-dawn');
  if (h >= 9 && h < 16) return tok('--hour-day');
  if (h >= 16 && h < 19) return tok('--hour-golden');
  return tok('--hour-night');
}
function paintFog() {
  const tint = hourTint(new Date().getHours());
  const blend = parseFloat(tok('--hour-blend')) || 0;
  NS_ROOMS.forEach((r) => {
    const base = tok(`--room-${r}`);
    if (fogs[r] && base) fogs[r].style.background = mix(base, tint, blend);
  });
}
function scheduleHour() {
  clearTimeout(hourTimer);
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 1, 0);
  hourTimer = setTimeout(() => { paintFog(); scheduleHour(); }, next - now);
}

// ---- the corner web: a few capillary lines rooted bottom-right, dissolving by a radial mask ----
const WEB_SVG = `
<svg viewBox="0 0 300 300" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="web-fade" cx="300" cy="300" r="340" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="var(--c-card-white)" stop-opacity="1"/>
      <stop offset="0.6" stop-color="var(--c-card-white)" stop-opacity="0.85"/>
      <stop offset="1" stop-color="var(--c-card-white)" stop-opacity="0"/>
    </radialGradient>
    <mask id="web-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
      <rect x="0" y="0" width="300" height="300" fill="url(#web-fade)"/>
    </mask>
    <radialGradient id="web-blue" cx="300" cy="300" r="240" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="var(--a-blue)" stop-opacity="1"/>
      <stop offset="1" stop-color="var(--a-blue)" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="web-terra" cx="300" cy="300" r="190" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="var(--a-terra)" stop-opacity="1"/>
      <stop offset="1" stop-color="var(--a-terra)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g mask="url(#web-mask)">
    <g class="wb"><circle class="wb-glow" cx="300" cy="300" r="240" fill="url(#web-blue)"/>
      <g class="web-lines wb-lines">
        <path d="M300 300 C268 268 236 252 206 214 C190 194 184 168 168 140"/>
        <path class="thin" d="M206 214 C180 214 150 206 126 218"/>
        <path class="thin" d="M236 252 C222 262 200 266 176 262"/>
        <path d="M300 300 C282 262 276 228 250 196 C238 180 236 156 222 132"/>
        <path class="thin" d="M250 196 C268 176 270 150 262 122"/>
        <path d="M300 300 C262 292 228 296 194 280 C170 270 150 276 126 264"/>
        <path class="thin" d="M228 296 C212 284 200 262 190 242"/>
      </g></g>
    <g class="wt"><circle class="wt-wash" cx="300" cy="300" r="190" fill="url(#web-terra)"/>
      <g class="web-lines wt-lines">
        <path d="M300 300 C276 280 262 256 246 228 C234 208 214 196 196 170"/>
        <path class="thin" d="M262 256 C240 256 222 246 204 252"/>
        <path d="M300 300 C290 270 300 240 288 206 C282 186 288 160 280 138"/>
        <path class="thin" d="M288 206 C270 200 252 184 244 160"/>
      </g></g>
  </g>
</svg>`;

export function initAtmosphere(worldEl) {
  world = worldEl;
  world.replaceChildren();
  const add = (cls, parent = world) => {
    const d = document.createElement('div');
    d.className = cls;
    parent.append(d);
    return d;
  };
  add('w-base');
  fogs = {};
  NS_ROOMS.forEach((r) => { fogs[r] = add('w-fog', world); });
  const amb = add('w-amb');
  const blobs = add('blobs', amb);
  BLOBS.forEach((n) => add(`blob blob--${n}`, blobs).append(document.createElement('i')));
  add('w-glow');
  const web = add('web', amb);
  web.innerHTML = WEB_SVG;

  paintFog();
  scheduleHour();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { paintFog(); scheduleHour(); } });
  document.addEventListener('pointerdown', touchBloom, { passive: true });
  if (!world.dataset.room) world.dataset.room = html.dataset.room || 'today';
  setRoom(world.dataset.room, { instant: true });
}

export function setRoom(name, { instant = false } = {}) {
  if (!world || !NS_ROOMS.includes(name)) return;
  if (instant) world.classList.add('is-instant');
  world.dataset.room = name;
  NS_ROOMS.forEach((r) => {
    if (!fogs[r]) return;
    if (r === name) {
      fogs[r].style.zIndex = String(++zTop);   // the incoming fog stacks above the outgoing one
      fogs[r].classList.add('is-on');
    } else {
      fogs[r].classList.remove('is-on');
    }
  });
  currentRoom = name;
  if (instant) {
    void world.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => world.classList.remove('is-instant')));
  }
}

// ---- bare-screen touch bloom (manual §13.3) ----
const INTERACTIVE = 'button, input, select, textarea, label, a, [role]';
function touchBloom(e) {
  if (!(e.target instanceof Element)) return;
  if (e.target.closest(INTERACTIVE) || e.target.closest('#entry')) return;
  const size = parseFloat(tok('--bloom-size')) || 48;
  const b = document.createElement('div');
  b.className = 'bloom';
  b.style.left = `${e.clientX - size / 2}px`;
  b.style.top = `${e.clientY - size / 2}px`;
  document.body.append(b);
  const done = () => b.remove();
  b.addEventListener('animationend', done, { once: true });
  setTimeout(done, 1500);
}
