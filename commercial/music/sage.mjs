// Sage soundtrack: 100 BPM, D major, 31.2 s. Warm electric piano, marimba hook, soft drums.
// Cue points (tile builds, camera moves, the final reveal) come from src/sage/timeline.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { session } from './synth.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = JSON.parse(fs.readFileSync(path.join(root, 'src/sage/timeline.json'), 'utf8'));
const SECONDS = T.frames / T.fps;
const s = session({ seconds: SECONDS, seed: 1002 });
const BEAT = 60 / T.bpm, BAR = BEAT * 4;
const sec = (frame) => frame / T.fps;

const CH = {
  D: { notes: [62, 66, 69], bass: 38 },
  Bm: { notes: [59, 62, 66], bass: 35 },
  G: { notes: [55, 59, 62], bass: 31 },
  A: { notes: [57, 61, 64], bass: 33 },
  Em: { notes: [55, 59, 64], bass: 40 },
  D9: { notes: [62, 66, 69, 76], bass: 38 },
};
// Bar 10 lifts on A; bar 11 resolves to D exactly when the camera pulls back to show the whole board.
const PROG = ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A', 'Em', 'G', 'A', 'D9', 'D9'];
const section = (b) => (b < 2 ? 'intro' : b < 4 ? 'build' : b < 10 ? 'main' : b === 10 ? 'lift' : 'end');

for (let b = 0; b < T.bars; b++) {
  const t = b * BAR, c = CH[PROG[b]], sc = section(b);

  // Warm pad under everything
  s.warmPad(t, BAR + 0.6, c.notes, { intro: 0.045, build: 0.045, main: 0.045, lift: 0.055, end: 0.06 }[sc]);

  // Electric piano comping: on the one and the "and" of three
  const ep = sc === 'end' ? 0.13 : 0.11;
  if (sc !== 'end') {
    c.notes.forEach((m, k) => s.epiano(t, BEAT * 1.4, m, ep, (k - 1) * 0.3));
    c.notes.forEach((m, k) => s.epiano(t + BEAT * 2.5, BEAT, m, ep * 0.8, (k - 1) * 0.3));
  } else if (b === 11) {
    // final chord, rolled
    c.notes.forEach((m, k) => s.epiano(t + k * 0.05, BAR * 1.6, m, ep, (k - 1.5) * 0.3));
  }

  // Marimba hook from the "build" section onwards
  if (sc === 'build' || sc === 'main' || sc === 'lift') {
    const top = c.notes.map((m) => m + 12);
    const pattern = [[0, 2], [1.5, 0], [2, 1], [3, 2], [3.5, 1]];
    pattern.forEach(([beat, idx], k) => s.marimba(t + beat * BEAT, top[idx], sc === 'build' ? 0.12 : 0.16, k % 2 ? 0.35 : -0.35));
  }
  if (b === 11) [0, 0.5, 1, 1.5, 2].forEach((beat, k) => s.marimba(t + beat * BEAT, [74, 78, 81, 86, 88][k], 0.14, (k - 2) * 0.3));

  // Drums: gentle, and they step aside for the lift
  for (let q = 0; q < 4; q++) {
    const tb = t + q * BEAT;
    if ((sc === 'build' && q === 0) || (sc === 'main' && (q === 0 || q === 2))) s.kick(tb, 0.5, { duckDepth: 0.3, base: 50, sweep: 70, decay: 0.18 });
    if (sc === 'main' && q === 1) s.kick(tb + BEAT * 0.5, 0.28, { duckDepth: 0.15, base: 52, sweep: 60, decay: 0.12 });
    if ((sc === 'build' || sc === 'main') && (q === 1 || q === 3)) s.rim(tb, 0.32);
    if (sc === 'build' || sc === 'main' || sc === 'lift') { s.shaker(tb, 0.16); s.shaker(tb + BEAT / 2, sc === 'lift' ? 0.2 : 0.12, -0.3); }
  }

  // Bass: round quarter notes in the main section, long notes at the end
  if (sc === 'main') [0, 1, 2, 3].forEach((q) => s.bassNote(t + q * BEAT, BEAT * 0.9, c.bass + (q === 3 ? 7 : 0), 0.16));
  if (sc === 'build') s.bassNote(t, BAR * 0.95, c.bass, 0.12);
  if (sc === 'end') s.bassNote(t, BAR, c.bass, 0.16);
}

// Lift into the reveal
const reveal = sec(TL_shot('*'));
s.riser(reveal - BAR, reveal, 0.32);
s.sparkle(reveal, 1.2, 0.07, 16, 86);

// UI-ish cues: a soft pop as each tile builds, a faint whoosh as the camera glides
Object.entries(T.builds).forEach(([id, frame], k) => s.popFx(sec(frame) + 0.12, id.length > 1 ? 0.12 : 0.2, id.length > 1 ? 1100 : 760, ((k % 3) - 1) * 0.4));
T.shots.slice(1).forEach((shot) => s.whoosh(sec(shot.at - T.move), sec(T.move) + 0.15, 0.14));

s.render({ out: path.join(root, 'public/music/sage.wav'), mix: 0.55, send: 0.14, fadeOut: 1.4, fb: 0.82, damp: 0.35, label: `${T.bpm} BPM D major` });

function TL_shot(focus) { return T.shots.find((x) => x.focus[0] === focus).at; }
