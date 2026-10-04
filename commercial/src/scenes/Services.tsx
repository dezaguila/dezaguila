import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';
import { Label, pop, prog, Rise, Scene, useUnit } from '../ui';

const ITEMS = [
  { i: '☕', t: 'Java & Spring development', s: 'Features, APIs, batch jobs and integrations, with tests and docs.' },
  { i: '🧩', t: 'Bug fixing & rescue', s: 'The issues nobody can reproduce, found with evidence and fixed.' },
  { i: '🧱', t: 'Upgrades & modernization', s: 'Java, frameworks and app servers moved forward safely.' },
  { i: '🗄️', t: 'Databases & integrations', s: 'SQL, reports, REST and SOAP between systems.' },
];

export const Services: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useUnit();
  // A highlight travels across the four tiles once they are in.
  const hl = Math.floor(prog(f, 60, 150) * 4.999);
  return (
    <Scene dur={dur} bg={C.mist}>
      <AbsoluteFill style={{ padding: vertical ? `${120 * u}px ${70 * u}px` : `${80 * u}px ${130 * u}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 44 * u }}>
        <div>
          <Rise at={0}><Label color={C.green}>What I can do for you</Label></Rise>
          <Rise at={6}><div style={{ fontSize: (vertical ? 80 : 90) * u, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02, marginTop: 12 * u }}>Senior-level work,<br />done right.</div></Rise>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: vertical ? '1fr' : '1fr 1fr', gap: 22 * u }}>
          {ITEMS.map((it, i) => {
            const p = pop(f, fps, 14 + i * 7, 13);
            const on = hl === i && f >= 60;
            return (
              <div
                key={it.t}
                style={{
                  display: 'flex', gap: 26 * u, alignItems: 'center',
                  padding: `${30 * u}px ${34 * u}px`, borderRadius: 30 * u,
                  background: on ? C.green : C.tile, color: on ? C.cream : C.ink,
                  border: `${2 * u}px solid ${on ? C.green : C.line}`,
                  transform: `translateY(${(1 - p) * 80 * u}px) scale(${0.9 + p * 0.1 + (on ? 0.02 : 0)})`,
                  opacity: Math.min(1, p * 1.3),
                  boxShadow: on ? `0 ${30 * u}px ${60 * u}px -${30 * u}px rgba(47,107,79,.7)` : 'none',
                }}
              >
                <div style={{ fontSize: 56 * u, width: 92 * u, height: 92 * u, borderRadius: 24 * u, display: 'grid', placeItems: 'center', background: on ? 'rgba(255,255,255,.12)' : C.mist, flex: 'none' }}>{it.i}</div>
                <div>
                  <div style={{ fontSize: 34 * u, fontWeight: 800, letterSpacing: '-0.02em' }}>{it.t}</div>
                  <div style={{ fontSize: 23 * u, opacity: on ? 0.85 : 1, color: on ? C.cream : C.body, marginTop: 4 * u }}>{it.s}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
