// Noir: visual identity. Deliberately different from the portfolio site:
// cinematic black, bone white and a signal-yellow accent, with a serif / grotesk / mono type system.
import timeline from './timeline.json';

export const TL = timeline;
export const FPS = TL.fps;
export const TOTAL = TL.seconds * TL.fps;            // 1080 frames
export const BEAT = (60 / TL.bpm) * TL.fps;          // 15 frames
export const BAR = BEAT * 4;                         // 60 frames
export const sec = (s: number) => Math.round(s * FPS);

export const K = {
  ink: '#0c0c0e',
  ink2: '#151519',
  bone: '#f1ece2',
  dim: 'rgba(241,236,226,.42)',
  faint: 'rgba(241,236,226,.12)',
  signal: '#ffd23f',
  sky: '#8fb3ff',
};

export const SERIF = '"Instrument Serif", Georgia, serif';
export const SANS = '"Space Grotesk", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';

export const FONTS = [
  { family: 'Instrument Serif', file: 'InstrumentSerif-Regular.woff2', descriptors: { style: 'normal' } },
  { family: 'Instrument Serif', file: 'InstrumentSerif-Italic.woff2', descriptors: { style: 'italic' } },
  { family: 'Space Grotesk', file: 'SpaceGrotesk.woff2', descriptors: { weight: '300 700' } },
  { family: 'JetBrains Mono', file: 'JetBrainsMono.woff2', descriptors: { weight: '100 800' } },
];
