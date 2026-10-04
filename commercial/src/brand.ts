// Visual identity for the commercial. Deliberately different from the portfolio site:
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

export type SceneKey = keyof typeof TL.scenes;
export const SCENE_ORDER: SceneKey[] = ['problems', 'meet', 'how', 'services', 'proof', 'weekend', 'end'];
export const SCENE_LABEL: Record<SceneKey, string> = {
  problems: 'The problem', meet: 'Meet Dez', how: 'How I work', services: 'What I do',
  proof: 'Track record', weekend: 'Availability', end: 'Get in touch',
};
