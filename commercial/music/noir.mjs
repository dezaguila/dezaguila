// Noir soundtrack: 120 BPM, A minor, 36 s. Cue points come from src/noir/timeline.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { session } from './synth.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = JSON.parse(fs.readFileSync(path.join(root, 'src/noir/timeline.json'), 'utf8'));
const s = session({ seconds: T.seconds });
const BEAT = 60 / T.bpm, BAR = BEAT * 4;

const CH = {
  Am: { notes: [57, 60, 64], bass: 33 },
  F: { notes: [53, 57, 60], bass: 29 },
  C: { notes: [55, 60, 64], bass: 36 },
  G: { notes: [55, 59, 62], bass: 31 },
  Am9: { notes: [57, 60, 64, 71], bass: 33 },
};
const PROG = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'F', 'G', 'Am9', 'Am9'];
const section = (b) => (b < 4 ? 'intro' : b < 14 ? 'main' : b < 16 ? 'break' : 'end');

for (let b = 0; b < T.bars; b++) {
  const t = b * BAR, c = CH[PROG[b]], sec = section(b);

  const padGain = { intro: 0.08 + 0.015 * b, main: 0.11, break: 0.1, end: 0.12 }[sec];
  s.pad(t, b === T.bars - 1 ? BAR : BAR + 0.5, c.notes, padGain);

  const arp = [0, 1, 2, 1, 0 + 3, 2, 1, 2].map((k) => (k < c.notes.length ? c.notes[k] : c.notes[0] + 12) + 12);
  if (sec === 'intro' && b >= 2) arp.forEach((m, k) => s.pluck(t + k * BEAT / 2, m, 0.24 + 0.06 * (b - 2), k % 2 ? 0.5 : -0.5));
  if (sec === 'main') arp.forEach((m, k) => s.pluck(t + k * BEAT / 2, m, 0.36, k % 2 ? 0.55 : -0.55));
  if (sec === 'break') [0, 2, 4, 6].forEach((k) => s.pluck(t + k * BEAT / 2, arp[k], 0.3, k % 4 ? 0.4 : -0.4, 1.4));
  if (sec === 'end') (b === 16 ? [0, 2, 4, 6] : [0, 4]).forEach((k) => s.pluck(t + k * BEAT / 2, arp[k], 0.3, k % 4 ? 0.4 : -0.4, 1.8));

  for (let q = 0; q < 4; q++) {
    const tb = t + q * BEAT;
    if (sec === 'main') s.kick(tb, 0.75);
    if (sec === 'main' && b >= 6 && (q === 1 || q === 3)) s.clap(tb, 0.55);
    if ((sec === 'intro' && b >= 1) || sec === 'main') s.hat(tb + BEAT / 2, sec === 'intro' ? 0.18 : 0.3);
    if (sec === 'main' && b >= 8) s.hat(tb + BEAT * 0.75, 0.12, 0.02, -0.3);
  }

  if (sec === 'main') for (let e = 0; e < 8; e++) s.bassNote(t + e * BEAT / 2, BEAT / 2 - 0.02, c.bass + (e % 2 ? 12 : 0), 0.24);
  if (sec === 'break') s.bassNote(t, BAR - 0.05, c.bass, 0.22);
  if (sec === 'end') s.bassNote(t, b === T.bars - 1 ? BAR : BAR - 0.02, c.bass, 0.26);
}

const typ = T.typing;
for (let k = 0; k < typ.text.length; k++) if (typ.text[k] !== ' ') s.click(typ.start + (k * typ.framesPerChar) / T.fps);
T.hits.forEach((h) => s.hit(h, 0.6));
T.risers.forEach(([a, b]) => s.riser(a, b, 0.55));
T.impacts.forEach((t) => s.impact(t, 0.6));
T.impacts.forEach((t) => s.kick(t, 0.9));

s.render({ out: path.join(root, 'public/music/noir.wav'), mix: 0.5, label: `${T.bpm} BPM A minor` });
