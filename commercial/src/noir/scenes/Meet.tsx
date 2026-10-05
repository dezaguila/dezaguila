import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BEAT, K, MONO, SANS, SERIF } from '../brand';
import { Flash, p, Reveal, springAt, useLayout } from '../../shared/kit';

/** Opens on the 8 s impact. Sonar rings pulse on every kick. */
export const Meet: React.FC = () => {
  const f = useCurrentFrame();
  const { u, v, width, height } = useLayout();
  const land = springAt(f, 0, 13, 120);
  const rings = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => k * BEAT).filter((t) => t <= f);
  const maxR = Math.hypot(width, height) / 2;

  return (
    <AbsoluteFill style={{ background: K.ink, alignItems: 'center', justifyContent: 'center' }}>
      {rings.map((t) => {
        const k = p(f, t, t + BEAT * 2.5);
        return (
          <div key={t} style={{
            position: 'absolute', width: k * maxR * 2, height: k * maxR * 2, borderRadius: '50%',
            border: `${1.5 * u}px solid ${K.bone}`, opacity: (1 - k) * 0.25,
          }} />
        );
      })}

      <div style={{ textAlign: 'center', position: 'relative' }}>
        <Reveal at={2} dur={10}>
          <div style={{ fontFamily: MONO, fontSize: v(26, 30) * u, letterSpacing: '0.3em', color: K.dim, textTransform: 'uppercase' }}>Meet</div>
        </Reveal>
        <div style={{
          fontFamily: SERIF, fontStyle: 'italic', fontSize: v(330, 300) * u, lineHeight: 1.05, color: K.bone,
          transform: `scale(${1.25 - land * 0.25})`, opacity: Math.min(1, land * 1.6), letterSpacing: '-0.02em',
          padding: `0 ${30 * u}px`,
        }}>
          Dez<span style={{ color: K.signal }}>.</span>
        </div>
        <Reveal at={28}>
          <div style={{ fontFamily: SANS, fontSize: v(40, 42) * u, fontWeight: 500, color: K.bone, marginTop: 6 * u }}>
            Senior software engineer · 10+ years
          </div>
        </Reveal>
        <Reveal at={46}>
          <div style={{ fontFamily: MONO, fontSize: v(22, 26) * u, letterSpacing: '0.16em', color: K.dim, marginTop: 22 * u, textTransform: 'uppercase' }}>
            David Son Aguila — Manila, PH
          </div>
        </Reveal>
      </div>
      <Flash at={0} len={9} color={K.bone} />
    </AbsoluteFill>
  );
};
