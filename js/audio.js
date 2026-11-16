// audio.js — synthesised sound, Web Audio only, no files (manual §19.1).
// Off until asked for. The AudioContext is created lazily. Everything is a no-op while off.

let on = false;
let ctx = null;
let bed = null;   // { master, nodes[] } while the ambient bed plays

function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function startBed() {
  const c = context();
  if (!c || bed) return;
  const t = c.currentTime;
  const master = c.createGain();
  master.gain.setValueAtTime(0, t);
  master.gain.linearRampToValueAtTime(0.05, t + 2.6);

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 440;
  lp.Q.value = 0.6;
  lp.connect(master);
  master.connect(c.destination);

  const voice = (type, freq, gain, cents) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = cents;
    g.gain.value = gain;
    o.connect(g); g.connect(lp);
    o.start(t);
    return o;
  };
  const oscs = [
    voice('sine', 55, 0.5, 0),
    voice('sine', 110, 0.34, 3),
    voice('triangle', 164.81, 0.10, -4),
  ];

  // a 0.07Hz breath sweeps the cutoff by plus or minus 130Hz
  const lfo = c.createOscillator();
  const depth = c.createGain();
  lfo.frequency.value = 0.07;
  depth.gain.value = 130;
  lfo.connect(depth); depth.connect(lp.frequency);
  lfo.start(t);

  bed = { master, nodes: [...oscs, lfo] };
}

function stopBed() {
  if (!bed || !ctx) { bed = null; return; }
  const { master, nodes } = bed;
  bed = null;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + 0.7);
  nodes.forEach((n) => { try { n.stop(t + 0.8); } catch { /* already stopped */ } });
  setTimeout(() => { try { master.disconnect(); } catch { /* gone */ } }, 1000);
}

/** Call once at launch with the saved setting. If on, the bed starts at the first touch (browsers need one). */
export function initAudio(wantOn) {
  on = !!wantOn;
  if (!on) return;
  const events = ['pointerdown', 'touchend', 'click'];
  const unlock = () => {
    if (!on) { off(); return; }
    startBed();
    if (ctx && ctx.state === 'running') off();
  };
  const off = () => events.forEach((e) => document.removeEventListener(e, unlock, true));
  events.forEach((e) => document.addEventListener(e, unlock, true));
}

/** Turn sound on. Call inside the tap that asked for it. */
export function enable() {
  on = true;
  startBed();
}

export function disable() {
  on = false;
  stopBed();
}

/** A room settling in: a sine falling 190 to 78Hz in 0.13s, peak 0.11, gone in 0.17s. */
export function thup() {
  if (!on || !ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(190, t);
  o.frequency.exponentialRampToValueAtTime(78, t + 0.13);
  g.gain.setValueAtTime(0.11, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
  o.connect(g); g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.2);
}

/** A rare reward: 880Hz and 1318.5Hz (half level, 40ms late), peak 0.06, 1s decay. */
export function chime() {
  if (!on || !ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  [[880, 0.06, 0], [1318.5, 0.03, 0.04]].forEach(([freq, peak, delay]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.linearRampToValueAtTime(peak, t + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1);
    o.connect(g); g.connect(ctx.destination);
    o.start(t + delay);
    o.stop(t + delay + 1.05);
  });
}
