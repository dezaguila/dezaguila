// Pop: playful but professional. Bright palette, chunky type, characters and cartoon physics.
import timeline from './timeline.json';

export const TL = timeline;
export const BEAT_F = (TL.fps * 60) / TL.bpm;            // 14.0625 frames per beat
export const fb = (beat: number) => Math.round(beat * BEAT_F); // beat -> frame
export const TOTAL = TL.seconds * TL.fps;                  // 900 frames

export const P = {
  cream: '#fff6e9',
  ink: '#17141f',
  blue: '#3a5bff',
  coral: '#ff5a3c',
  lemon: '#ffd84d',
  mint: '#2fd69a',
  lilac: '#a98bff',
  white: '#ffffff',
};
export const CONFETTI = [P.blue, P.coral, P.lemon, P.mint, P.lilac];

export const FONT = '"Bricolage Grotesque", system-ui, sans-serif';
export const FONTS = [{ family: 'Bricolage Grotesque', file: 'BricolageGrotesque.woff2', descriptors: { weight: '200 800' } }];
