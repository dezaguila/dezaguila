// Pop soundtrack: 128 BPM, C major, 30 s. Funk-pop groove plus cartoon sound effects.
// Cue points (in beats) come from src/pop/timeline.json, the same file the animation reads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { session } from './synth.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = JSON.parse(fs.readFileSync(path.join(root, 'src/pop/timeline.json'), 'utf8'));
const s = session({ seconds: T.seconds, seed: 128 });
const BEAT = 60 / T.bpm, BAR = BEAT * 4;
const b2s = (beat) => beat * BEAT;           // beat -> seconds
const C = T.cues;

const CH = {
  C: { notes: [60, 64, 67], bass: 36, hook: [79, 76, 72, 76, 79, 81, 79, 76] },
  Am: { notes: [57, 60, 64], bass: 33, hook: [76, 72, 69, 72, 76, 79, 76, 72] },
  F: { notes: [53, 57, 60], bass: 29, hook: [77, 72, 69, 72, 77, 81, 77, 72] },
  G: { notes: [55, 59, 62], bass: 31, hook: [79, 74, 71, 74, 79, 83, 79, 74] },
};
const PROG = ['C', 'Am', 'F', 'G'];
const BARS = T.beats / 4;
const section = (b) => (b < 2 ? 'intro' : b < 12 ? 'main' : b < 14 ? 'break' : 'final');
const HOOK_MASK = [1, 0, 1, 1, 0, 1, 1, 0];

for (let b = 0; b < BARS; b++) {
  const t = b * BAR, c = CH[PROG[b % 4]], sc = section(b);
  const lastBar = b === BARS - 1;

  // Chord stabs on the off-beats ("and" of 1 and 3); short and bright
  const stabGain = { intro: 0.06, main: 0.08, break: 0.045, final: 0.085 }[sc];
  if (!lastBar) [0.5, 2.5].forEach((q) => s.stab(t + q * BEAT, c.notes, stabGain, 0.14, q < 1 ? -0.3 : 0.3));

  // Drums
  for (let q = 0; q < 4; q++) {
    const tb = t + q * BEAT;
    const groove = sc === 'main' || (sc === 'final' && !(lastBar && q >= 2));
    if (groove) s.kick(tb, 0.68, { duckDepth: 0.45, base: 48, sweep: 110, decay: 0.2 });
    if (groove && (q === 1 || q === 3)) s.clap(tb, 0.6);
    if (groove || (sc === 'intro' && b === 1)) s.hat(tb + BEAT / 2, 0.32, 0.06, 0.35); // open-ish off-beat hat
    if (groove && b >= 4) { s.hat(tb + BEAT / 4, 0.1, 0.02, -0.3); s.hat(tb + BEAT * 0.75, 0.1, 0.02, -0.3); }
    if (sc === 'break') s.shaker(tb + BEAT / 2, 0.14);
  }

  // Bass: bouncy octave 8ths in the groove; held notes in the breakdown
  if (sc === 'main' || (sc === 'final' && !lastBar)) {
    [[0, 0], [0.5, 12], [1, 0], [1.75, 12], [2, 0], [2.5, 12], [3, 7], [3.5, 12]].forEach(([q, o]) => s.funkBass(t + q * BEAT, BEAT * 0.42, c.bass + o, 0.3));
  }
  if (sc === 'break') s.funkBass(t, BAR * 0.95, c.bass, 0.09);

  // Bell hook from the "idea" scene (bar 4) on; sparser in the breakdown
  if ((sc === 'main' && b >= 4) || (sc === 'final' && !lastBar)) c.hook.forEach((m, k) => HOOK_MASK[k] && s.bell(t + k * BEAT / 2, m, 0.12, k % 2 ? 0.4 : -0.4, 0.6));
  if (sc === 'break') [0, 3].forEach((k) => s.bell(t + k * BEAT / 2, c.hook[k], 0.08, 0, 1.4));
}

// Intro "tick-tock" while the bug crawls in (beat 3 to 8), with a clap fill into the groove
for (let beat = 3; beat < 8; beat++) {
  s.rim(b2s(beat), 0.28, beat % 2 ? 0.3 : -0.3);
  s.shaker(b2s(beat + 0.5), 0.16);
  if (beat < 6) s.funkBass(b2s(beat), BEAT * 0.4, CH.C.bass + (beat % 2 ? 12 : 0), 0.2);
}
[7, 7.25, 7.5, 7.75].forEach((beat, k) => s.clap(b2s(beat), 0.25 + k * 0.1));

// Final chord on the last half-bar
const endT = b2s(T.beats - 2);
s.stab(endT, [60, 64, 67, 72], 0.08, 0.6);
[72, 76, 79, 84].forEach((m, k) => s.bell(endT + k * 0.04, m, 0.1, (k - 1.5) * 0.3, 1.0));
s.kick(endT, 0.9, { duckDepth: 0.3 });

// ---------- sound effects, locked to the animation cues ----------
C.slam.forEach((beat, i) => { s.kick(b2s(beat), 0.85, { duckDepth: 0.2, base: 52, sweep: 120 }); s.stab(b2s(beat), CH.C.notes.map((m) => m + 12 * (i === 2 ? 1 : 0)), 0.07, 0.12); });
for (let beat = C.bugIn; beat < C.cursorIn; beat += 0.25) s.click(b2s(beat), 0.09);       // tiny footsteps
s.whoosh(b2s(C.cursorIn), b2s(C.squash - C.cursorIn), 0.35, -0.7, 0);                       // cursor flies in
s.splat(b2s(C.squash), 0.9);
s.sparkle(b2s(C.squash) + 0.05, 0.6, 0.06, 10, 84);
s.popFx(b2s(C.fixed), 0.4, 700);

C.boings.forEach((beat, i) => s.boing(b2s(beat), 0.32, 130 + i * 40, 420 + i * 90));
s.popFx(b2s(C.upgraded), 0.25, 900);

s.popFx(b2s(C.bulb), 0.45, 600);
s.bell(b2s(C.bulb) + 0.02, 96, 0.08, 0, 0.8);
C.parts.forEach((beat, i) => s.popFx(b2s(beat), 0.3, 600 + i * 120, (i % 2 ? 0.5 : -0.5)));
s.whoosh(b2s(C.shipped) - 0.15, 0.4, 0.2, 0.6, -0.6);

'Meet Dez!'.split('').forEach((ch, i) => ch !== ' ' && s.popFx(b2s(C.letters) + (i * 2) / T.fps, 0.16, 800 + i * 70, (i - 4) * 0.15));
s.boing(b2s(C.badge), 0.28, 200, 600);
C.chips.forEach((beat, i) => s.popFx(b2s(beat), 0.22, 1000 + i * 150, i % 2 ? 0.6 : -0.6));

for (let k = 0; k < 4; k++) s.rim(b2s(C.carry) + k * b2s(0.5), 0.3, 0.4 - k * 0.2);         // robot hops
s.hit(b2s(C.approve), 0.6);                                                                  // stamp
s.clap(b2s(C.approve), 0.5);
s.clap(b2s(C.highfive), 0.7);
s.sparkle(b2s(C.highfive), 0.5, 0.06, 8, 86);

C.flips.forEach((beat, i) => s.popFx(b2s(beat), 0.2, 700 + i * 60, (i % 2 ? 0.4 : -0.4)));

s.toggle(b2s(C.toggle), 0.35);
C.stickers.forEach((beat, i) => { s.popFx(b2s(beat), 0.32, 650 + i * 150); s.bell(b2s(beat), 84 + i * 3, 0.07, 0.3, 0.6); });
s.riser(b2s(C.riser[0]), b2s(C.riser[1]), 0.4);

s.whoosh(b2s(58.5), b2s(C.ctaClick - 58.5), 0.3, 0.7, 0);
s.popFx(b2s(C.ctaClick), 0.5, 760);
s.sparkle(b2s(C.ctaClick), 1.0, 0.08, 16, 84);

s.render({ out: path.join(root, 'public/music/pop.wav'), mix: 0.55, send: 0.07, fadeOut: 0.9, fb: 0.78, damp: 0.3, label: `${T.bpm} BPM C major` });
