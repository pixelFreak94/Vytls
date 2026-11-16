// audio.js — synthesised sound, Web Audio only, no files (manual §19.1).
// Off until asked for. The AudioContext is created lazily. Everything is a no-op while off.
//
// iPhone notes:
// - iOS mutes web audio when the ring/silent switch is on, unless the audio session is
//   'playback'. We ask for that, so sound plays on silent too (owner's call).
// - The phone speaker barely plays below ~200Hz, so every voice sits an octave or more above
//   the manual's original 55Hz bed (owner's call). Still near-silence: if it reads as a
//   "UI sound", it is too loud.
// - iOS can leave the context 'interrupted' after a call or a trip to the Home Screen;
//   it is resumed on return and on the next touch.

const LEVEL = 0.16;          // master level of the whole soundscape
const CHORD_SECONDS = 14;    // how long each pad chord holds
const BELL_MIN = 6, BELL_MAX = 13;   // seconds between the rare toned notes

// A slow, unresolved progression in D, voiced in the speaker's range (Hz).
const CHORDS = [
  [146.83, 220.00, 277.18, 329.63, 440.00],   // Dmaj9
  [123.47, 185.00, 246.94, 293.66, 369.99],   // Bm11
  [196.00, 246.94, 293.66, 369.99, 440.00],   // Gmaj7
  [164.81, 220.00, 277.18, 329.63, 493.88],   // A/E add9
];
const BELL_NOTES = [587.33, 659.25, 739.99, 880.00, 987.77, 1108.73];   // D major pentatonic, high

let on = false;
let ctx = null;
let out = null;      // master gain → destination
let wet = null;      // reverb send
let music = null;    // { gain, timers[], voices[] } while the soundscape plays

function setSession() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* older iOS */ }
}

function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    setSession();
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 1;
    out.connect(ctx.destination);
    wet = ctx.createConvolver();
    wet.buffer = impulse(ctx, 4.2);
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.55;
    wet.connect(wetGain); wetGain.connect(out);
    unlockBuffer();
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  return ctx;
}

// iOS needs a sound started inside the touch before it opens the output.
function unlockBuffer() {
  try {
    const b = ctx.createBuffer(1, 1, 22050);
    const s = ctx.createBufferSource();
    s.buffer = b; s.connect(ctx.destination); s.start(0);
  } catch { /* fine */ }
}

// A soft synthetic room: decaying stereo noise, generated, no file.
function impulse(c, seconds) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

// ---- the soundscape: pad + water + rare toned notes ----

function padVoice(c, dest, freq, t, hold, gain) {
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + hold * 0.4);
  g.gain.linearRampToValueAtTime(gain * 0.8, t + hold * 0.8);
  g.gain.linearRampToValueAtTime(0, t + hold * 1.35);   // overlaps the next chord
  g.connect(dest);
  const oscs = [-5, 5].map((cents, i) => {
    const o = c.createOscillator();
    o.type = i ? 'triangle' : 'sine';
    o.frequency.value = freq;
    o.detune.value = cents;
    o.connect(g);
    o.start(t);
    o.stop(t + hold * 1.4);
    return o;
  });
  return oscs;
}

function playChord(i) {
  if (!music) return;
  const c = ctx;
  const t = c.currentTime + 0.05;
  CHORDS[i % CHORDS.length].forEach((f, k) => padVoice(c, music.pad, f, t, CHORD_SECONDS, k === 0 ? 0.16 : 0.09));
  music.timers.push(setTimeout(() => playChord(i + 1), CHORD_SECONDS * 1000));
}

function bell() {
  if (!music) return;
  const c = ctx;
  const t = c.currentTime + 0.05;
  const f = BELL_NOTES[Math.floor(Math.random() * BELL_NOTES.length)];
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.25);           // toned, not struck: no click
  g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
  g.connect(music.gain); g.connect(wet);
  [[f, 1], [f * 2.01, 0.25]].forEach(([freq, lvl]) => {
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = 'sine'; o.frequency.value = freq; og.gain.value = lvl;
    o.connect(og); og.connect(g);
    o.start(t); o.stop(t + 5.1);
  });
  const next = BELL_MIN + Math.random() * (BELL_MAX - BELL_MIN);
  music.timers.push(setTimeout(bell, next * 1000));
}

function water(c, dest) {
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf; src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.8;
  const g = c.createGain(); g.gain.value = 0.018;
  const lfo = c.createOscillator(); const depth = c.createGain();
  lfo.frequency.value = 0.09; depth.gain.value = 450;      // the breath of moving water
  lfo.connect(depth); depth.connect(bp.frequency);
  src.connect(bp); bp.connect(g); g.connect(dest);
  src.start(); lfo.start();
  return [src, lfo];
}

function startMusic() {
  const c = context();
  if (!c || music) return;
  const t = c.currentTime;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(LEVEL, t + 3);
  gain.connect(out);

  const pad = c.createBiquadFilter();       // soften the pad, with a slow breath on the cutoff
  pad.type = 'lowpass'; pad.frequency.value = 1400; pad.Q.value = 0.5;
  pad.connect(gain); pad.connect(wet);
  const lfo = c.createOscillator(); const depth = c.createGain();
  lfo.frequency.value = 0.07; depth.gain.value = 400;
  lfo.connect(depth); depth.connect(pad.frequency); lfo.start(t);

  music = { gain, pad, timers: [], sources: [lfo, ...water(c, gain)] };
  playChord(0);
  music.timers.push(setTimeout(bell, 4000));
}

function stopMusic() {
  if (!music || !ctx) { music = null; return; }
  const { gain, timers, sources } = music;
  music = null;
  timers.forEach(clearTimeout);
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.7);
  sources.forEach((n) => { try { n.stop(t + 0.8); } catch { /* already stopped */ } });
  setTimeout(() => { try { gain.disconnect(); } catch { /* gone */ } }, 1500);
}

// ---- lifecycle ----

const TOUCH = ['pointerdown', 'touchend', 'click'];
function onTouch() {
  if (!on) return;
  context();
  if (!music) startMusic();
}

let wired = false;
function wire() {
  if (wired) return;
  wired = true;
  // Every touch nudges a stopped or interrupted context back to life (cheap when running).
  TOUCH.forEach((e) => document.addEventListener(e, onTouch, true));
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !on) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
}

/** Call once at launch with the saved setting. If on, sound starts at the first touch (browsers need one). */
export function initAudio(wantOn) {
  on = !!wantOn;
  wire();
}

/** Turn sound on. Call inside the tap that asked for it. */
export function enable() {
  on = true;
  wire();
  startMusic();
}

export function disable() {
  on = false;
  stopMusic();
}

function ready() { return on && ctx && ctx.state === 'running'; }

/** A room settling in: a soft sine falling 380 to 156Hz in 0.13s, gone in 0.2s. */
export function thup() {
  if (!ready()) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(380, t);
  o.frequency.exponentialRampToValueAtTime(156, t + 0.13);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.14, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g); g.connect(out); g.connect(wet);
  o.start(t);
  o.stop(t + 0.25);
}

/** A rare reward: 880Hz and 1318.5Hz (half level, 40ms late), 1.4s decay into the room. */
export function chime() {
  if (!ready()) return;
  const t = ctx.currentTime;
  [[880, 0.08, 0], [1318.5, 0.04, 0.04]].forEach(([freq, peak, delay]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.linearRampToValueAtTime(peak, t + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.4);
    o.connect(g); g.connect(out); g.connect(wet);
    o.start(t + delay);
    o.stop(t + delay + 1.45);
  });
}
