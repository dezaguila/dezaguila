import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';
import { Ambient, Label, pop, prog, Rise, Scene, useUnit } from '../ui';

export const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useUnit();
  const card = pop(f, fps, 2, 13);
  const wave = Math.sin(prog(f, 22, 50) * Math.PI * 4) * 18;
  return (
    <Scene dur={dur} bg={`linear-gradient(150deg, ${C.mist}, ${C.mint})`}>
      <Ambient color={C.green} opacity={0.07} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 60 * u }}>
        <div
          style={{
            width: (vertical ? 820 : 640) * u,
            height: (vertical ? 560 : 640) * u,
            borderRadius: 48 * u,
            background: `linear-gradient(160deg, #3d7a5c, ${C.green} 50%, ${C.forest})`,
            color: C.cream,
            padding: 56 * u,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: `scale(${0.6 + card * 0.4}) rotate(${(1 - card) * -6}deg)`,
            opacity: Math.min(1, card * 1.4),
            boxShadow: `0 ${40 * u}px ${90 * u}px -${40 * u}px rgba(22,38,30,.6)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -80 * u, top: -80 * u, width: 300 * u, height: 300 * u, borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%', background: 'rgba(255,255,255,.16)', transform: `rotate(${f * 1.2}deg)` }} />
          <Label color="rgba(245,243,234,.75)">
            Hello <span style={{ display: 'inline-block', transform: `rotate(${wave}deg)`, transformOrigin: '70% 70%' }}>👋</span>
          </Label>
          <div>
            <Rise at={12}><div style={{ fontSize: 150 * u, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.95 }}>I'm Dez.</div></Rise>
            <Rise at={20}><div style={{ fontSize: 30 * u, fontWeight: 700, marginTop: 18 * u }}>David Son Aguila on paper...<br />Dez to clients and teammates.</div></Rise>
          </div>
        </div>
        <div style={{ maxWidth: (vertical ? 820 : 620) * u }}>
          <Rise at={26}><Label color={C.green}>Senior Software Engineer</Label></Rise>
          <Rise at={32}><div style={{ fontSize: 64 * u, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginTop: 14 * u }}>10+ years building software businesses rely on.</div></Rise>
          <Rise at={40}><div style={{ fontSize: 28 * u, color: C.body, marginTop: 20 * u }}>Manila, PH · remote for clients in APAC, EU &amp; US</div></Rise>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
