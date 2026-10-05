// Sage: follows the portfolio's own look (Sage Mist palette, Manrope, bento tiles).
import { interpolate, Easing } from 'remotion';
import timeline from './timeline.json';

export const TL = timeline;
export const TOTAL = TL.frames;
export const BEAT = (60 / TL.bpm) * TL.fps; // 18 frames

export const S = {
  mist: '#f3f6f2',
  tile: '#ffffff',
  ink: '#1d2a24',
  body: '#56635c',
  muted: '#7c877f',
  line: '#e1e8e2',
  green: '#2f6b4f',
  soft: '#e3eee7',
  softLine: '#c4dccd',
  forest: '#23392f',
  leaf: '#9fd3b4',
  gold: '#e9c46a',
  copper: '#b8772f',
  cream: '#f5f3ea',
  hero: 'linear-gradient(150deg, #dce9df, #c9dccf)',
  me: 'linear-gradient(160deg, #3d7a5c, #2f6b4f 50%, #23392f)',
};

export const FONT = 'Manrope, system-ui, sans-serif';
export const FONTS = [{ family: 'Manrope', file: 'Manrope.woff2', descriptors: { weight: '200 800' } }];

export type TileId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type Rect = { x: number; y: number; w: number; h: number };

// Board layouts in board pixels. The camera scales the board, so tile content is authored once.
export const LAYOUT: Record<'h' | 'v', { w: number; h: number; tiles: Record<TileId, Rect> }> = {
  h: {
    w: 2740, h: 1680,
    tiles: {
      A: { x: 0, y: 0, w: 640, h: 760 },
      B: { x: 680, y: 0, w: 1320, h: 760 },
      E: { x: 2040, y: 0, w: 700, h: 360 },
      F: { x: 2040, y: 400, w: 700, h: 360 },
      C: { x: 0, y: 800, w: 1100, h: 880 },
      D: { x: 1140, y: 800, w: 860, h: 880 },
      G: { x: 2040, y: 800, w: 700, h: 420 },
      H: { x: 2040, y: 1260, w: 700, h: 420 },
    },
  },
  // 9:16: one narrow column, so the camera can fill the phone screen with each tile
  v: {
    w: 900, h: 6750,
    tiles: {
      A: { x: 0, y: 0, w: 900, h: 700 },
      B: { x: 0, y: 740, w: 900, h: 1150 },
      C: { x: 0, y: 1930, w: 900, h: 1250 },
      D: { x: 0, y: 3220, w: 900, h: 1250 },
      E: { x: 0, y: 4510, w: 900, h: 440 },
      F: { x: 0, y: 4990, w: 900, h: 440 },
      G: { x: 0, y: 5470, w: 900, h: 600 },
      H: { x: 0, y: 6110, w: 900, h: 640 },
    },
  },
};

const union = (rs: Rect[]): Rect => {
  const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
};

export type Camera = { cx: number; cy: number; s: number; settled: boolean; focus: string[] };

/** Camera at frame f: holds on each shot, then glides to the next over `move` frames. */
export const camera = (f: number, width: number, height: number, vertical: boolean): Camera => {
  const L = LAYOUT[vertical ? 'v' : 'h'];
  const target = (focus: string[]) => {
    const r = focus[0] === '*' ? { x: 0, y: 0, w: L.w, h: L.h } : union(focus.map((k) => L.tiles[k as TileId]));
    const fill = focus[0] === '*' ? 0.92 : 0.84;
    return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, s: Math.min((width * fill) / r.w, (height * (focus[0] === '*' ? 0.92 : 0.8)) / r.h) };
  };
  const shots = TL.shots;
  // i = the shot we are at, or gliding towards (its move window has started)
  let i = 0;
  for (let k = 1; k < shots.length; k++) if (f >= shots[k].at - TL.move) i = k;
  const dest = target(shots[i].focus);
  if (i > 0 && f < shots[i].at) {
    const from = target(shots[i - 1].focus);
    const k = interpolate(f, [shots[i].at - TL.move, shots[i].at], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1) });
    // Glide in log-scale so zooming feels even
    const s = Math.exp(Math.log(from.s) + (Math.log(dest.s) - Math.log(from.s)) * k);
    return { cx: from.cx + (dest.cx - from.cx) * k, cy: from.cy + (dest.cy - from.cy) * k, s, settled: false, focus: [] };
  }
  return { ...dest, settled: true, focus: shots[i].focus };
};
