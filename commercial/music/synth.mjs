// Tiny synthesis engine shared by every soundtrack. No samples, no dependencies.
// Each soundtrack creates a session, places notes and effects in time, then calls render().
//
//   const s = session({ seconds: 30 });
//   s.kick(0.5); s.epiano(1, 0.6, 62, 0.3);
//   s.render({ out: 'public/music/x.wav', mix: 0.5 });

import fs from 'node:fs';
import path from 'node:path';

export function session({ seconds, seed = 20261004, sr = 44100 }) {
  const SR = sr;
  const LEN = Math.round(seconds * SR);

  // Deterministic noise, so every build produces the same file
  let state = seed;
  const rnd = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

  // Buses: "dry" goes straight to the mix, "wet" also feeds the reverb; "duck" is the kick sidechain
  const bus = () => [new Float32Array(LEN), new Float32Array(LEN)];
  const dry = bus();
  const wet = bus();
  const duck = new Float32Array(LEN).fill(1);

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const add = (b, i, l, r) => { if (i >= 0 && i < LEN) { b[0][i] += l; b[1][i] += r; } };
  const pan = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)]; // -1..1

  function blepSaw(phase, dt) {
    let v = 2 * phase - 1;
    if (phase < dt) { const t = phase / dt; v -= t + t - t * t - 1; }
    else if (phase > 1 - dt) { const t = (phase - 1) / dt; v -= t * t + t + t + 1; }
    return v;
  }

  // ================= instruments used by Noir =================

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

  function kick(t0, gain = 1, { duckDepth = 0.55, base = 44, sweep = 90, decay = 0.22 } = {}) {
    const n0 = Math.round(t0 * SR), n = Math.round(0.45 * SR);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const f = base + sweep * Math.exp(-t / 0.035);
      ph += 2 * Math.PI * f / SR;
      const s = (Math.sin(ph) * Math.exp(-t / decay) + (i < 90 ? rnd() * 0.25 * (1 - i / 90) : 0)) * gain;
      add(dry, n0 + i, s, s);
    }
    const m = Math.round(0.3 * SR);
    for (let i = 0; i < m && n0 + i < LEN; i++) duck[n0 + i] = Math.min(duck[n0 + i], 1 - duckDepth * Math.exp(-(i / SR) / 0.09));
  }

  function clap(t0, gain = 1) {
    const n0 = Math.round(t0 * SR), n = Math.round(0.25 * SR);
    let hp = 0, lp = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const burst = t < 0.03 ? Math.exp(-((t % 0.01) / 0.003)) : Math.exp(-(t - 0.03) / 0.07);
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

  function hit(t0, gain = 1) {
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

  function click(t0, gain = 0.12) {
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
      const fc = 300 * Math.pow(20, p);
      const F = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR);
      const x = rnd();
      low += F * band; const high = x - low - 0.5 * band; band += F * high;
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

  // ================= extra instruments (Sage, Pop) =================

  /** Two-operator FM electric piano: bell-ish attack that mellows into a warm tone. */
  function epiano(t0, dur, m, gain, p = 0) {
    const f = mtof(m), n0 = Math.round(t0 * SR), n = Math.round((dur + 0.6) * SR);
    const [pl, pr] = pan(p);
    let pc = 0, pm = 0, pt = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      pc += 2 * Math.PI * f / SR; pm += 2 * Math.PI * f / SR; pt += 2 * Math.PI * f * 14 / SR;
      const index = 1.4 * Math.exp(-t / 0.35) + 0.25;
      const tine = 0.12 * Math.sin(pt) * Math.exp(-t / 0.02);
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 1.6) * (t < dur ? 1 : Math.exp(-(t - dur) / 0.15));
      const s = (Math.sin(pc + index * Math.sin(pm)) + tine) * env * gain;
      add(wet, n0 + i, s * pl, s * pr);
    }
  }

  /** Marimba: sine with a quick inharmonic overtone. */
  function marimba(t0, m, gain, p = 0) {
    const f = mtof(m), n0 = Math.round(t0 * SR), n = Math.round(0.9 * SR);
    const [pl, pr] = pan(p);
    let a = 0, b = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      a += 2 * Math.PI * f / SR; b += 2 * Math.PI * f * 3.93 / SR;
      const s = (Math.sin(a) * Math.exp(-t / 0.28) + 0.35 * Math.sin(b) * Math.exp(-t / 0.03)) * Math.min(1, t / 0.002) * gain;
      add(wet, n0 + i, s * pl, s * pr);
    }
  }

  /** Warm sustained sine/triangle pad (softer than the saw pad). */
  function warmPad(t0, dur, notes, gain) {
    const n0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    notes.forEach((m, vi) => {
      [-5, 5].forEach((cents, oi) => {
        const f = mtof(m) * Math.pow(2, cents / 1200);
        let ph = vi * 0.7 + oi;
        const [pl, pr] = pan(oi ? 0.5 : -0.5);
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          ph += 2 * Math.PI * f / SR;
          const env = Math.min(1, t / 0.6) * Math.min(1, Math.max(0, (dur - t) / 0.8));
          const s = (Math.sin(ph) + 0.18 * Math.sin(3 * ph) + 0.06 * Math.sin(5 * ph)) * env * gain;
          add(wet, n0 + i, s * pl, s * pr);
        }
      });
    });
  }

  /** Rimshot / woodblock tick. */
  function rim(t0, gain = 1, p = -0.2) {
    const n0 = Math.round(t0 * SR), n = Math.round(0.08 * SR);
    const [pl, pr] = pan(p);
    let a = 0, b = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      a += 2 * Math.PI * 820 / SR; b += 2 * Math.PI * 1710 / SR;
      const s = (Math.sin(a) + 0.6 * Math.sin(b) + rnd() * 0.3) * Math.exp(-t / 0.012) * gain;
      add(wet, n0 + i, s * pl, s * pr);
    }
  }

  /** Shaker: band-limited noise with a soft attack. */
  function shaker(t0, gain = 1, p = 0.4) {
    const n0 = Math.round(t0 * SR), n = Math.round(0.09 * SR);
    const [pl, pr] = pan(p);
    let h = 0, l = 0, lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR, x = rnd();
      h = 0.7 * (h + x - l); l = x; lp += 0.5 * (h - lp);
      const s = lp * Math.min(1, t / 0.012) * Math.exp(-t / 0.03) * gain;
      add(dry, n0 + i, s * pl, s * pr);
    }
  }

  /** Short detuned-saw chord stab, low-passed. */
  function stab(t0, notes, gain, dur = 0.16, p = 0) {
    const n0 = Math.round(t0 * SR), n = Math.round((dur + 0.08) * SR);
    const [pl, pr] = pan(p);
    notes.forEach((m, vi) => [-10, 10].forEach((c) => {
      const f = mtof(m) * Math.pow(2, c / 1200), dt = f / SR;
      let ph = (vi * 0.37) % 1, lp1 = 0, lp2 = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        ph += dt; if (ph >= 1) ph -= 1;
        const cutoff = 600 + 3400 * Math.exp(-t / 0.06);
        const a = 1 - Math.exp(-2 * Math.PI * cutoff / SR);
        lp1 += a * (blepSaw(ph, dt) - lp1); lp2 += a * (lp1 - lp2);
        const env = Math.min(1, t / 0.003) * (t < dur ? 1 : Math.exp(-(t - dur) / 0.02));
        const s = lp2 * env * gain;
        add(wet, n0 + i, s * pl, s * pr);
      }
    }));
  }

  /** Bell / glockenspiel for melodic hooks. */
  function bell(t0, m, gain, p = 0, dur = 1.2) {
    const f = mtof(m), n0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    const [pl, pr] = pan(p);
    const parts = [[1, 1, 0.9], [2.76, 0.45, 0.35], [5.4, 0.25, 0.18], [8.93, 0.12, 0.08]];
    const ph = parts.map(() => 0);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      let s = 0;
      parts.forEach(([r, a, d], k) => { ph[k] += 2 * Math.PI * f * r / SR; s += Math.sin(ph[k]) * a * Math.exp(-t / d); });
      s *= Math.min(1, t / 0.002) * gain;
      add(wet, n0 + i, s * pl, s * pr);
    }
  }

  /** Bouncy synth bass with a quick filter pluck. */
  function funkBass(t0, dur, m, gain) {
    const f = mtof(m), dt = f / SR, n0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    let ph = 0, lp1 = 0, lp2 = 0, sub = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ph += dt; if (ph >= 1) ph -= 1;
      sub += 2 * Math.PI * f / SR;
      const cutoff = 180 + 1600 * Math.exp(-t / 0.05);
      const a = 1 - Math.exp(-2 * Math.PI * cutoff / SR);
      lp1 += a * (blepSaw(ph, dt) - lp1); lp2 += a * (lp1 - lp2);
      const env = Math.min(1, t / 0.004) * Math.min(1, (dur - t) / 0.02);
      const s = Math.tanh(1.5 * (lp2 * 0.8 + Math.sin(sub) * 0.7)) * env * gain;
      add(dry, n0 + i, s, s);
    }
  }

  // ---------- cartoon / UI sound effects ----------

  /** Air whoosh: band-pass noise that sweeps up then down. */
  function whoosh(t0, dur = 0.5, gain = 1, p0 = -0.6, p1 = 0.6) {
    const n0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    let low = 0, band = 0;
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const fc = 400 + 3600 * Math.sin(Math.PI * k);
      const F = 2 * Math.sin(Math.PI * fc / SR);
      const x = rnd();
      low += F * band; const high = x - low - 0.7 * band; band += F * high;
      const amp = Math.sin(Math.PI * k) ** 1.5 * gain;
      const [pl, pr] = pan(p0 + (p1 - p0) * k);
      add(wet, n0 + i, band * amp * pl, band * amp * pr);
    }
  }

  /** "Boing": a sine with a wobbling, rising pitch. */
  function boing(t0, gain = 1, from = 140, to = 520) {
    const n0 = Math.round(t0 * SR), n = Math.round(0.45 * SR);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR, k = i / n;
      const f = (from + (to - from) * Math.sqrt(k)) * (1 + 0.08 * Math.sin(2 * Math.PI * 18 * t));
      ph += 2 * Math.PI * f / SR;
      const s = Math.sin(ph) * Math.exp(-t / 0.18) * Math.min(1, t / 0.003) * gain;
      add(wet, n0 + i, s, s);
    }
  }

  /** Bubble "pop" blip. */
  function popFx(t0, gain = 1, pitch = 900, p = 0) {
    const n0 = Math.round(t0 * SR), n = Math.round(0.09 * SR);
    const [pl, pr] = pan(p);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ph += 2 * Math.PI * pitch * (1 + 1.6 * (1 - Math.exp(-t / 0.015))) / SR;
      const s = Math.sin(ph) * Math.exp(-t / 0.025) * Math.min(1, t / 0.001) * gain;
      add(wet, n0 + i, s * pl, s * pr);
    }
  }

  /** Splat: wet noise burst plus a low thud. */
  function splat(t0, gain = 1) {
    const n0 = Math.round(t0 * SR), n = Math.round(0.4 * SR);
    let ph = 0, lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ph += 2 * Math.PI * (90 + 120 * Math.exp(-t / 0.02)) / SR;
      lp += 0.25 * (rnd() - lp);
      const s = (Math.sin(ph) * Math.exp(-t / 0.12) * 0.9 + lp * 1.8 * Math.exp(-t / 0.05)) * gain;
      add(wet, n0 + i, s, s);
    }
  }

  /** UI toggle click: two quick ticks. */
  function toggle(t0, gain = 1) {
    [0, 0.045].forEach((d, k) => {
      const n0 = Math.round((t0 + d) * SR), n = Math.round(0.03 * SR);
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        ph += 2 * Math.PI * (k ? 2400 : 1600) / SR;
        const s = Math.sin(ph) * Math.exp(-t / 0.006) * gain;
        add(dry, n0 + i, s, s);
      }
    });
  }

  /** Sparkle: a scatter of high bell plinks. */
  function sparkle(t0, dur = 0.8, gain = 1, count = 14, root = 84) {
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    for (let k = 0; k < count; k++) {
      const t = t0 + ((k + 0.5) / count) * dur + rnd() * 0.02;
      const m = root + scale[Math.floor((rnd() * 0.5 + 0.5) * scale.length) % scale.length];
      bell(t, m, gain * (0.6 + 0.4 * (1 - k / count)), rnd() * 0.8, 0.5);
    }
  }

  // ================= mix =================

  function reverb(inp, delays, fb, damp) {
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

  /**
   * Mix to stereo, soft-limit, normalise to -1 dBFS and write a 16-bit WAV.
   * mix: gain into the tanh limiter. send: reverb return level. fadeOut: seconds of tail fade.
   */
  function render({ out, mix = 0.5, send = 0.09, fadeOut = 2.2, fb = 0.8, damp = 0.28, label = '' }) {
    const rvL = reverb(wet[0], [1116, 1188, 1277, 1356], fb, damp);
    const rvR = reverb(wet[1], [1139, 1211, 1300, 1379], fb, damp);
    const L = new Float32Array(LEN), R = new Float32Array(LEN);
    let rawPeak = 0, peak = 0;
    for (let i = 0; i < LEN; i++) {
      const t = i / SR;
      const g = duck[i];
      let l = dry[0][i] + (wet[0][i] + rvL[i] * send) * (0.45 + 0.55 * g);
      let r = dry[1][i] + (wet[1][i] + rvR[i] * send) * (0.45 + 0.55 * g);
      rawPeak = Math.max(rawPeak, Math.abs(l * mix), Math.abs(r * mix));
      const fade = Math.min(1, t / 0.02) * Math.min(1, (seconds - t) / fadeOut);
      l = Math.tanh(l * mix) * fade; r = Math.tanh(r * mix) * fade;
      L[i] = l; R[i] = r; peak = Math.max(peak, Math.abs(l), Math.abs(r));
    }
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
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.concat([hdr, data]));
    console.log(`wrote ${path.relative(process.cwd(), out)}  ${seconds}s  ${label}  limiter input peak ${rawPeak.toFixed(2)}`);
  }

  return {
    SR, LEN, rnd, mtof,
    pad, pluck, kick, clap, hat, bassNote, hit, click, riser, impact,
    epiano, marimba, warmPad, rim, shaker, stab, bell, funkBass,
    whoosh, boing, popFx, splat, toggle, sparkle,
    render,
  };
}
