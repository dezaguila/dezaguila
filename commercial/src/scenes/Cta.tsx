import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';
import { Ambient, pop, prog, Rise, Scene, useUnit } from '../ui';

export const Cta: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useUnit();
  const btn = pop(f, fps, 30, 12);
  const shine = prog(f, 50, 80);
  return (
    <Scene dur={dur} bg={`linear-gradient(150deg, ${C.mist}, ${C.mint})`}>
      <Ambient color={C.green} opacity={0.08} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 34 * u, padding: `0 ${70 * u}px` }}>
        <Rise at={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 * u, justifyContent: 'center', fontSize: 34 * u, fontWeight: 800 }}>
            <div style={{ width: 18 * u, height: 18 * u, borderRadius: '50%', background: C.green }} />Dez Aguila
          </div>
        </Rise>
        <Rise at={8}>
          <div style={{ fontSize: (vertical ? 92 : 110) * u, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>
            Have a side project<br />in mind? <span style={{ color: C.green }}>Let's talk.</span>
          </div>
        </Rise>
        <div
          style={{
            marginTop: 10 * u, padding: `${30 * u}px ${54 * u}px`, borderRadius: 26 * u, background: C.green, color: '#fff',
            fontSize: (vertical ? 44 : 52) * u, fontWeight: 800, letterSpacing: '-0.01em', position: 'relative', overflow: 'hidden',
            transform: `scale(${btn})`, boxShadow: `0 ${30 * u}px ${60 * u}px -${30 * u}px rgba(47,107,79,.8)`,
          }}
        >
          dezaguila@proton.me
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: '30%', left: `${-40 + shine * 150}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)', transform: 'skewX(-20deg)' }} />
        </div>
        <Rise at={44}><div style={{ fontSize: 32 * u, fontWeight: 700, color: C.body }}>Engineer-led. AI-assisted. Reviewed by a human.</div></Rise>
        <div style={{ position: 'absolute', bottom: 48 * u, fontSize: 22 * u, color: C.muted, opacity: prog(f, 60, 75) }}>Built with AI ✦</div>
      </AbsoluteFill>
    </Scene>
  );
};
