import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { K, MONO, SANS, SERIF } from '../brand';
import { Flash, p, Reveal, springAt, useLayout } from '../../shared/kit';

/** Opens on the 32 s impact; the music rings out to the end. */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const { u, v } = useLayout();
  const land = springAt(f, 0, 14, 110);
  const underline = p(f, 34, 56);
  const outro = p(f, 100, 120);

  return (
    <AbsoluteFill style={{ background: K.ink, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ opacity: 1 - outro }}>
        <div style={{ fontFamily: SERIF, fontSize: v(220, 190) * u, lineHeight: 1.05, color: K.bone, transform: `scale(${1.15 - land * 0.15})`, opacity: Math.min(1, land * 1.6) }}>
          Let's <span style={{ fontStyle: 'italic', color: K.signal }}>build</span> it.
        </div>
        <Reveal at={22}>
          <div style={{ display: 'inline-block', marginTop: 36 * u, fontFamily: MONO, fontSize: v(52, 44) * u, color: K.bone, letterSpacing: '0.02em' }}>
            dezaguila@proton.me
            <div style={{ height: 4 * u, marginTop: 10 * u, background: K.signal, width: `${underline * 100}%` }} />
          </div>
        </Reveal>
        <Reveal at={48}>
          <div style={{ fontFamily: SANS, fontSize: v(34, 34) * u, color: K.dim, marginTop: 34 * u }}>
            Dez Aguila · Engineer-led. AI-assisted.
          </div>
        </Reveal>
        <Reveal at={62}>
          <div style={{ fontFamily: MONO, fontSize: v(18, 20) * u, letterSpacing: '0.18em', color: K.dim, marginTop: 70 * u, textTransform: 'uppercase' }}>
            Music &amp; motion made in code · Built with AI
          </div>
        </Reveal>
      </div>
      <Flash at={0} len={10} color={K.bone} />
    </AbsoluteFill>
  );
};
