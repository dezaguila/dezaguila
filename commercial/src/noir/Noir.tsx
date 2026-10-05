import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { FONTS, K, sec, TL } from './brand';
import { Grain, TextCheck, useFonts } from '../shared/kit';
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

/** Noir: cinematic kinetic type on black. Hard cuts on downbeats. */
export const Noir: React.FC = () => {
  useFonts(FONTS);
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
      <Grain />
      <Audio src={staticFile('music/noir.wav')} />
      <TextCheck />
    </AbsoluteFill>
  );
};
