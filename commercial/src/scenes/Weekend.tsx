import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';
import { Label, pop, prog, Rise, Scene, useUnit } from '../ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const Weekend: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useUnit();
  const lit = prog(f, 34, 48);
  const size = vertical ? 120 : 170;
  return (
    <Scene dur={dur} bg={C.forest}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 56 * u, color: C.cream, textAlign: 'center', padding: `0 ${60 * u}px` }}>
        <Rise at={0}><Label color={C.gold}>Availability</Label></Rise>
        <div style={{ display: 'flex', gap: 16 * u }}>
          {DAYS.map((d, i) => {
            const p = pop(f, fps, 6 + i * 3, 14);
            const weekend = i >= 5;
            return (
              <div
                key={d}
                style={{
                  width: size * u, height: size * 1.15 * u, borderRadius: 26 * u,
                  display: 'grid', placeItems: 'center',
                  fontSize: (vertical ? 28 : 36) * u, fontWeight: 800,
                  background: weekend ? `rgba(233,196,106,${0.08 + lit * 0.92})` : 'rgba(255,255,255,.06)',
                  color: weekend && lit > 0.5 ? C.deep : weekend ? C.cream : 'rgba(245,243,234,.4)',
                  transform: `translateY(${(1 - p) * 50 * u}px) scale(${weekend ? 1 + lit * 0.08 : 1})`,
                  opacity: Math.min(1, p * 1.3),
                  boxShadow: weekend ? `0 ${20 * u}px ${50 * u}px -${20 * u}px rgba(233,196,106,${lit * 0.8})` : 'none',
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
        <Rise at={44}>
          <div style={{ fontSize: (vertical ? 72 : 84) * u, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Open to <span style={{ color: C.gold }}>weekend</span> side projects.
          </div>
        </Rise>
        <Rise at={52}><div style={{ fontSize: 30 * u, color: 'rgba(245,243,234,.75)' }}>Fixed-scope builds · fixes &amp; short tasks · light ongoing support</div></Rise>
      </AbsoluteFill>
    </Scene>
  );
};
