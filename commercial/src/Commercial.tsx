import React, { useEffect, useState } from 'react';
import { AbsoluteFill, cancelRender, continueRender, delayRender, Sequence, staticFile } from 'remotion';
import { C, SCENES } from './theme';
import { Hook } from './scenes/Hook';
import { Intro } from './scenes/Intro';
import { Work } from './scenes/Work';
import { Services } from './scenes/Services';
import { Proof } from './scenes/Proof';
import { Weekend } from './scenes/Weekend';
import { Cta } from './scenes/Cta';

/** Waits for the bundled Manrope font so no frame renders with a fallback font. */
const useFont = () => {
  const [handle] = useState(() => delayRender('Loading Manrope'));
  useEffect(() => {
    const font = new FontFace('Manrope', `url(${staticFile('fonts/Manrope-latin.woff2')}) format('woff2')`, { weight: '200 800' });
    font.load()
      .then(() => { document.fonts.add(font); continueRender(handle); })
      .catch((err) => cancelRender(err));
  }, [handle]);
};

const OVERLAP = 12;

const PARTS = [
  [Hook, SCENES.hook],
  [Intro, SCENES.intro],
  [Work, SCENES.work],
  [Services, SCENES.services],
  [Proof, SCENES.proof],
  [Weekend, SCENES.weekend],
  [Cta, SCENES.cta],
] as const;

export const Commercial: React.FC = () => {
  useFont();
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {PARTS.map(([Part, t], i) => {
        // Each scene runs a little past its slot so the next one crossfades in on top of it.
        const dur = i === PARTS.length - 1 ? t.dur : t.dur + OVERLAP;
        return (
          <Sequence key={t.from} from={t.from} durationInFrames={dur} name={Part.name}>
            <Part dur={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
