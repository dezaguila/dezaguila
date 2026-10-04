import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C } from '../theme';
import { Ambient, Label, prog, Rise, Scene, useUnit } from '../ui';

const LINES = ['A bug nobody can reproduce.', 'An upgrade nobody wants to touch.', 'A deadline that won\'t move.'];

export const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { u, vertical } = useUnit();
  const strike = (i: number) => prog(f, 52 + i * 6, 66 + i * 6);
  const out = prog(f, 78, 98);
  return (
    <Scene dur={dur} bg={C.deep} fadeIn={1}>
      <Ambient color={C.leaf} opacity={0.06} />
      <AbsoluteFill style={{ justifyContent: 'center', padding: `0 ${vertical ? 80 * u : 160 * u}px`, transform: `scale(${1 - out * 0.06})`, opacity: 1 - out }}>
        <Rise at={2}><Label color={C.leaf}>Sound familiar?</Label></Rise>
        <div style={{ height: 30 * u }} />
        {LINES.map((l, i) => (
          <Rise key={l} at={10 + i * 12}>
            <div style={{ position: 'relative', fontSize: (vertical ? 76 : 88) * u, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.12, color: C.cream }}>
              {l}
              {/* Transparent copy on top: its background draws the strike over every wrapped line */}
              <div aria-hidden style={{ position: 'absolute', inset: 0, color: 'transparent' }}>
                <span style={{
                  backgroundImage: `linear-gradient(${C.gold}, ${C.gold})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '0 56%',
                  backgroundSize: `${strike(i) * 100}% ${9 * u}px`,
                  WebkitBoxDecorationBreak: 'clone',
                  boxDecorationBreak: 'clone',
                }}>{l}</span>
              </div>
            </div>
          </Rise>
        ))}
      </AbsoluteFill>
    </Scene>
  );
};
