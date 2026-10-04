// Original soundtrack for the commercial, synthesised from scratch (no samples, no dependencies).
// Usage: node music/compose.mjs [out.wav]   (default: public/music/theme.wav)
//
// 120 BPM in A minor. Bars are 2 s, so every cut in the video lands on a downbeat.
// Cue points (hits, risers, impacts, typing) come from src/timeline.json.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = JSON.parse(fs.readFileSync(path.join(root, 'src/timeline.json'), 'utf8'));
const OUT = process.argv[2] ?? path.join(root, 'public/music/theme.wav');

const SR = 44100;
const LEN = Math.round(T.seconds * SR);
const BEAT = 60 / T.bpm;
const BAR = BEAT * 4;

// ---------- deterministic noise ----------
let seed = 20261004;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

// ---------- buses (stereo) ----------
const bus = () => [new Float32Array(LEN), new Float32Array(LEN)];
const dry = bus();   // kick, bass, hats, clicks
const wet = bus();   // pads, plucks, claps, hits, impacts (sent to reverb)
const duck = new Float32Array(LEN).fill(1); // sidechain gain from kick

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (b, i, l, r) => { if (i >= 0 && i < LEN) { b[0][i] += l; b[1][i] += r; } };
const pan = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)]; // -1..1

// ---------- harmony ----------
const CH = {
  Am: { notes: [57, 60, 64], bass: 33 },
  F: { notes: [53, 57, 60], bass: 29 },
  C: { notes: [55, 60, 64], bass: 36 },
  G: { notes: [55, 59, 62], bass: 31 },
  Am9: { notes: [57, 60, 64, 71], bass: 33 },
};
const PROG = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'F', 'G', 'Am9', 'Am9'];

// Section helpers (bar index, 0-based)
const sec = (b) => (b < 4 ? 'intro' : b < 14 ? 'main' : b < 16 ? 'break' : 'end');

// ---------- instruments ----------
// Band-limited saw (PolyBLEP)
function blepSaw(phase, dt) {
  let v = 2 * phase - 1;
  if (phase < dt) { const t = phase / dt; v -= t + t - t * t - 1; }
  else if (phase > 1 - dt) { const t = (phase - 1) / dt; v -= t * t + t + t + 1; }
  return v;
}

function pad(t0, dur, notes, gain) {
  const n0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  const atk = 0.45, rel = 0.7;
  notes.forEach((m, vi) => {
    [-8, 0, 7].forEach((cents, oi) => {
      const f = mtof(m) * Math.pow(2, cents / 1200);
      const dt = f / SR;
      let ph = (vi * 0.31 + oi * 0.17) % 1, lp1 = 0, lp2 = 0;
      const [pl, pr] = pan((oi - 1) * 0.6);
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.min(1, t / atk) * Math.min(1, Math.max(0, (dur - t) / rel));
        ph += dt; if (ph >= 1) ph -= 1;
        const cutoff = 900 + 500 * Math.sin(2 * Math.PI * 0.11 * (t0 + t) + vi);
        const a = 1 - Math.exp(-2 * Math.PI * cutoff / SR);
        lp1 += a * (blepSaw(ph, dt) - lp1); lp2 += a * (lp1 - lp2);
        const s = lp2 * env * gain;
        add(wet, n0 + i, s * pl, s * pr);
      }
    });
  });
}

// Karplus-Strong pluck
function pluck(t0, m, gain, p = 0, dur = 0.9) {
  const f = mtof(m), N = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(N);
  let prev = 0;
  for (let i = 0; i < N; i++) { const x = rnd(); prev = 0.5 * x + 0.5 * prev; buf[i] = prev; }
  const n0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  const [pl, pr] = pan(p);
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const cur = buf[idx], nxt = buf[(idx + 1) % N];
    buf[idx] = 0.996 * 0.5 * (cur + nxt);
    idx = (idx + 1) % N;
    const env = Math.min(1, (n - i) / (0.05 * SR));
    const s = cur * gain * env;
    add(wet, n0 + i, s * pl, s * pr);
  }
}

function kick(t0, gain = 1) {
  const n0 = Math.round(t0 * SR), n = Math.round(0.45 * SR);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 44 + 90 * Math.exp(-t / 0.035);
    ph += 2 * Math.PI * f / SR;
    const s = (Math.sin(ph) * Math.exp(-t / 0.22) + (i < 90 ? rnd() * 0.25 * (1 - i / 90) : 0)) * gain;
    add(dry, n0 + i, s, s);
  }
  // sidechain: dip pads and bass right after each kick
  const m = Math.round(0.3 * SR);
  for (let i = 0; i < m && n0 + i < LEN; i++) duck[n0 + i] = Math.min(duck[n0 + i], 1 - 0.55 * Math.exp(-(i / SR) / 0.09));
}

function clap(t0, gain = 1) {
  const n0 = Math.round(t0 * SR), n = Math.round(0.25 * SR);
  let hp = 0, lp = 0, last = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const burst = t < 0.03 ? (Math.floor(t / 0.01) % 1 === 0 ? Math.exp(-((t % 0.01) / 0.003)) : 0) : Math.exp(-(t - 0.03) / 0.07);
    const x = rnd();
    hp = 0.85 * (hp + x - last); last = x;
    lp += 0.35 * (hp - lp);
    const s = lp * burst * gain;
    add(wet, n0 + i, s * 0.9, s);
  }
}

function hat(t0, gain = 1, decay = 0.035, p = 0.3) {
  const n0 = Math.round(t0 * SR), n = Math.round(decay * 6 * SR);
  let h1 = 0, h2 = 0, l1 = 0, l2 = 0;
  const [pl, pr] = pan(p);
  for (let i = 0; i < n; i++) {
    const x = rnd();
    h1 = 0.6 * (h1 + x - l1); l1 = x;
    h2 = 0.6 * (h2 + h1 - l2); l2 = h1;
    const s = h2 * Math.exp(-(i / SR) / decay) * gain;
    add(dry, n0 + i, s * pl, s * pr);
  }
}

function bassNote(t0, dur, m, gain) {
  const f = mtof(m), n0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += 2 * Math.PI * f / SR;
    const env = Math.min(1, t / 0.006) * (0.55 + 0.45 * Math.exp(-t / 0.12)) * Math.min(1, (dur - t) / 0.03);
    const s = Math.tanh(1.6 * (Math.sin(ph) + 0.35 * Math.sin(2 * ph))) * env * gain;
    add(dry, n0 + i, s, s);
  }
}

function hit(t0, gain = 1) { // soft low thump for on-screen text hits
  const n0 = Math.round(t0 * SR), n = Math.round(0.6 * SR);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += 2 * Math.PI * (58 + 50 * Math.exp(-t / 0.05)) / SR;
    lp += 0.08 * (rnd() - lp);
    const s = (Math.sin(ph) * Math.exp(-t / 0.3) + lp * 2.2 * Math.exp(-t / 0.08)) * gain;
    add(wet, n0 + i, s, s);
  }
}

function click(t0, gain = 0.12) { // typing tick
  const n0 = Math.round(t0 * SR), n = Math.round(0.012 * SR);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const x = rnd(), h = x - last; last = x;
    const s = h * Math.exp(-(i / SR) / 0.002) * gain;
    add(dry, n0 + i, s * 0.8, s);
  }
}

function riser(t0, t1, gain = 1) {
  const n0 = Math.round(t0 * SR), n = Math.round((t1 - t0) * SR);
  let low = 0, band = 0, ph = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const fc = 300 * Math.pow(20, p);                  // 300 Hz -> 6 kHz
    const F = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR);
    const x = rnd();
    low += F * band; const high = x - low - 0.5 * band; band += F * high; // state-variable filter
    ph += 2 * Math.PI * (180 * Math.pow(4, p)) / SR;
    const amp = Math.pow(p, 2.2) * gain;
    const s = (band * 0.9 + Math.sin(ph) * 0.12) * amp;
    add(wet, n0 + i, s * (1 - 0.3 * p), s * (0.7 + 0.3 * p));
  }
}

function impact(t0, gain = 1) {
  const n0 = Math.round(t0 * SR), n = Math.round(2.2 * SR);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += 2 * Math.PI * (34 + 40 * Math.exp(-t / 0.08)) / SR;
    const a = 0.02 + 0.5 * Math.exp(-t / 0.12);
    lp += a * (rnd() - lp);
    const s = (Math.sin(ph) * Math.exp(-t / 0.9) * 1.1 + lp * 1.4 * Math.exp(-t / 0.6)) * gain;
    add(wet, n0 + i, s, s * 0.97);
  }
}

// ---------- arrangement ----------
for (let b = 0; b < T.bars; b++) {
  const t = b * BAR, c = CH[PROG[b]], s = sec(b);

  // Pads (overlap into the next bar for legato)
  const padGain = { intro: 0.08 + 0.015 * b, main: 0.11, break: 0.1, end: 0.12 }[s];
  pad(t, b === T.bars - 1 ? BAR : BAR + 0.5, c.notes, padGain);

  // Arpeggio, an octave up, ping-pong panned
  const arp = [0, 1, 2, 1, 0 + 3, 2, 1, 2].map((k) => (k < c.notes.length ? c.notes[k] : c.notes[0] + 12) + 12);
  if (s === 'intro' && b >= 2) arp.forEach((m, k) => pluck(t + k * BEAT / 2, m, 0.24 + 0.06 * (b - 2), k % 2 ? 0.5 : -0.5));
  if (s === 'main') arp.forEach((m, k) => pluck(t + k * BEAT / 2, m, 0.36, k % 2 ? 0.55 : -0.55));
  if (s === 'break') [0, 2, 4, 6].forEach((k) => pluck(t + k * BEAT / 2, arp[k], 0.3, k % 4 ? 0.4 : -0.4, 1.4));
  if (s === 'end') (b === 16 ? [0, 2, 4, 6] : [0, 4]).forEach((k) => pluck(t + k * BEAT / 2, arp[k], 0.3, k % 4 ? 0.4 : -0.4, 1.8));

  // Drums
  for (let q = 0; q < 4; q++) {
    const tb = t + q * BEAT;
    if (s === 'main') kick(tb, 0.75);
    if (s === 'main' && b >= 6 && (q === 1 || q === 3)) clap(tb, 0.55);
    if ((s === 'intro' && b >= 1) || s === 'main') hat(tb + BEAT / 2, s === 'intro' ? 0.18 : 0.3);
    if (s === 'main' && b >= 8) hat(tb + BEAT * 0.75, 0.12, 0.02, -0.3);
  }

  // Bass: driving 8ths in the main section, long notes in the breakdown and ending
  if (s === 'main') for (let e = 0; e < 8; e++) bassNote(t + e * BEAT / 2, BEAT / 2 - 0.02, c.bass + (e % 2 ? 12 : 0), 0.24);
  if (s === 'break') bassNote(t, BAR - 0.05, c.bass, 0.22);
  if (s === 'end') bassNote(t, b === T.bars - 1 ? BAR : BAR - 0.02, c.bass, 0.26);
}

// Cue sounds from the shared timeline
const typ = T.typing;
for (let k = 0; k < typ.text.length; k++) if (typ.text[k] !== ' ') click(typ.start + (k * typ.framesPerChar) / T.fps);
T.hits.forEach((h) => hit(h, 0.6));
T.risers.forEach(([a, b]) => riser(a, b, 0.55));
T.impacts.forEach((t) => impact(t, 0.6));
T.impacts.forEach((t) => kick(t, 0.9));

// ---------- mix ----------
// Freeverb-style reverb on the wet bus
function reverb(inp, delays, fb = 0.8, damp = 0.28) {
  const out = new Float32Array(LEN);
  for (const d of delays) {
    const buf = new Float32Array(d); let i = 0, lp = 0;
    for (let n = 0; n < LEN; n++) {
      const y = buf[i];
      lp = y * (1 - damp) + lp * damp;
      buf[i] = inp[n] + lp * fb;
      out[n] += y;
      i = (i + 1) % d;
    }
  }
  for (const d of [556, 441]) {
    const buf = new Float32Array(d); let i = 0;
    for (let n = 0; n < LEN; n++) {
      const b = buf[i], x = out[n];
      out[n] = -x + b; buf[i] = x + b * 0.5; i = (i + 1) % d;
    }
  }
  return out;
}
const rvL = reverb(wet[0], [1116, 1188, 1277, 1356]);
const rvR = reverb(wet[1], [1139, 1211, 1300, 1379]);

const MIX = 0.5; // headroom into the soft limiter
const L = new Float32Array(LEN), R = new Float32Array(LEN);
let rawPeak = 0;
let peak = 0;
for (let i = 0; i < LEN; i++) {
  const t = i / SR;
  const g = duck[i];
  let l = dry[0][i] + (wet[0][i] + rvL[i] * 0.09) * (0.45 + 0.55 * g);
  let r = dry[1][i] + (wet[1][i] + rvR[i] * 0.09) * (0.45 + 0.55 * g);
  rawPeak = Math.max(rawPeak, Math.abs(l * MIX), Math.abs(r * MIX));
  const fade = Math.min(1, t / 0.02) * Math.min(1, (T.seconds - t) / 2.2);
  l = Math.tanh(l * MIX) * fade; r = Math.tanh(r * MIX) * fade;
  L[i] = l; R[i] = r; peak = Math.max(peak, Math.abs(l), Math.abs(r));
}

// Normalise to -1 dBFS and write 16-bit WAV
const norm = 0.891 / peak;
const data = Buffer.alloc(LEN * 4);
for (let i = 0; i < LEN; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8);
hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.concat([hdr, data]));
console.log(`wrote ${path.relative(process.cwd(), OUT)}  ${T.seconds}s  ${T.bpm} BPM  limiter input peak ${rawPeak.toFixed(2)}`);
