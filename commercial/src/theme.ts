// Sage Mist palette, shared with the portfolio site (docs/index.html).
export const C = {
  mist: '#f3f6f2',
  mint: '#dce9df',
  mint2: '#c9dccf',
  tile: '#ffffff',
  ink: '#1d2a24',
  body: '#56635c',
  muted: '#7c877f',
  line: '#e1e8e2',
  green: '#2f6b4f',
  forest: '#23392f',
  deep: '#16261e',
  leaf: '#9fd3b4',
  gold: '#e9c46a',
  copper: '#b8772f',
  cream: '#f5f3ea',
};

export const FONT = 'Manrope, system-ui, sans-serif';

export const FPS = 30;

// Scene timings in frames (30 fps). Total: 900 frames = 30 s.
export const SCENES = {
  hook: { from: 0, dur: 110 },
  intro: { from: 110, dur: 100 },
  work: { from: 210, dur: 180 },
  services: { from: 390, dur: 170 },
  proof: { from: 560, dur: 120 },
  weekend: { from: 680, dur: 100 },
  cta: { from: 780, dur: 120 },
} as const;

export const TOTAL = 900;
