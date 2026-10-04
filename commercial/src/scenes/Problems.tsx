import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { K, MONO, SERIF, sec, TL } from '../brand';
import { p, easeIn, useLayout, Words } from '../kit';

const LINES = [
  { text: 'A bug nobody can reproduce.', key: 'reproduce.' },
  { text: 'An upgrade nobody wants to touch.', key: 'touch.' },
  { text: "A deadline that won't move.", key: 'move.' },
];

export const Problems: React.FC = () => {
  const f = useCurrentFrame();
  const { u, pad, v } = useLayout();
  const typ = TL.typing;
  const typeStart = sec(typ.start);
  const shown = Math.max(0, Math.min(typ.text.length, Math.floor((f - typeStart) / typ.framesPerChar) + 1));
  const caretOn = Math.floor(f / 8) % 2 === 0 || (f > typeStart && shown < typ.text.length);

  // Lines land on the musical hits (2 s, 4 s, 6 s); words start a few frames early so they settle on the beat.
  const hits = TL.hits.map(sec);
  const collapse = p(f, 212, 232, easeIn);            // riser: everything pulls into a line
  const beam = p(f, 222, 240, easeIn);

  return (
    <AbsoluteFill style={{ background: K.ink }}>
      <AbsoluteFill style={{
        padding: `0 ${pad}px`, justifyContent: 'center',
        transform: `scaleY(${1 - collapse * 0.92}) scaleX(${1 + collapse * 0.04})`,
        opacity: 1 - collapse, filter: `blur(${collapse * 14}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: v(26, 30) * u, letterSpacing: '0.18em', color: K.signal, marginBottom: 40 * u }}>
          {typ.text.slice(0, shown)}
          <span style={{ display: 'inline-block', width: '0.6em', height: '1.1em', marginLeft: 4 * u, verticalAlign: '-0.2em', background: K.signal, opacity: caretOn ? 1 : 0 }} />
        </div>
        {LINES.map((l, i) => {
          const at = hits[i] - 4;
          const later = hits[i + 1] !== undefined ? p(f, hits[i + 1] - 4, hits[i + 1] + 8) : 0;
          return (
            <Words
              key={l.text}
              text={l.text}
              at={at}
              stagger={2}
              style={{ fontFamily: SERIF, fontSize: v(118, 104) * u, lineHeight: 1.12, letterSpacing: '-0.01em', color: K.bone, opacity: 1 - later * 0.7, marginBottom: 10 * u }}
              wordStyle={(w) => (w === l.key ? { fontStyle: 'italic', color: K.signal } : undefined)}
            />
          );
        })}
      </AbsoluteFill>
      {/* The line of light the scene collapses into, right before the impact */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: `${beam * 100}%`, height: (2 + beam * 4) * u, background: K.signal, boxShadow: `0 0 ${40 * u}px ${K.signal}`, opacity: beam }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
