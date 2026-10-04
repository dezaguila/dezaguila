import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';
import { Ambient, Label, pop, Rise, Scene, useUnit } from '../ui';

const Count: React.FC<{ to: number; at: number; suffix: string; color: string; label: string }> = ({ to, at, suffix, color, label }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useUnit();
  const p = pop(f, fps, at, 16);
  const n = Math.round(interpolate(f, [at, at + 36], [0, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 60 * u}px)` }}>
      <div style={{ fontSize: 220 * u, fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 0.9, color }}>{n}{suffix}</div>
      <div style={{ fontSize: 34 * u, fontWeight: 700, color: C.body, marginTop: 16 * u }}>{label}</div>
    </div>
  );
};

export const Proof: React.FC<{ dur: number }> = ({ dur }) => {
  const { u, vertical } = useUnit();
  return (
    <Scene dur={dur} bg={`linear-gradient(150deg, ${C.mint}, ${C.mint2})`}>
      <Ambient color={C.green} opacity={0.08} />
      <AbsoluteFill style={{ justifyContent: 'center', padding: vertical ? `0 ${80 * u}px` : `0 ${150 * u}px`, gap: 56 * u }}>
        <Rise at={0}><Label color={C.green}>Track record</Label></Rise>
        <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 70 * u : 140 * u }}>
          <Count to={10} at={6} suffix="+" color={C.green} label="years in enterprise software" />
          <Count to={10} at={16} suffix="+" color={C.copper} label="apps modernized in one upgrade" />
        </div>
        <Rise at={40}>
          <div style={{ fontSize: 40 * u, fontWeight: 800, letterSpacing: '-0.02em', color: C.ink }}>
            Accenture <span style={{ color: C.green }}>·</span> IBM Consulting <span style={{ color: C.green }}>·</span> Infor
          </div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
};
