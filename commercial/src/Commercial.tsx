import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { K, sec, TL, TOTAL } from './brand';
import { Grain, Hud, p, TextCheck, useFonts } from './kit';
import { Problems } from './scenes/Problems';
import { Meet } from './scenes/Meet';
import { How } from './scenes/How';
import { Services } from './scenes/Services';
import { Proof } from './scenes/Proof';
import { Weekend } from './scenes/Weekend';
import { End } from './scenes/End';

const SCENES = [
  ['problems', Problems], ['meet', Meet], ['how', How], ['services', Services],
  ['proof', Proof], ['weekend', Weekend], ['end', End],
] as const;

export const Commercial: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  // Hard cuts on downbeats; the HUD steps back during the finale.
  const hud = 1 - p(f, TOTAL - 40, TOTAL - 20);
  return (
    <AbsoluteFill style={{ background: K.ink }}>
      {SCENES.map(([key, Scene]) => {
        const [a, b] = TL.scenes[key];
        return (
          <Sequence key={key} from={sec(a)} durationInFrames={sec(b) - sec(a)} name={key}>
            <Scene />
          </Sequence>
        );
      })}
      <Hud opacity={hud} />
      <Grain />
      <Audio src={staticFile('music/theme.wav')} />
      <TextCheck />
    </AbsoluteFill>
  );
};
