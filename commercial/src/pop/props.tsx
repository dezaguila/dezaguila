// Characters and props for Pop. Everything is SVG so it renders the same on any machine.
import React from 'react';
import { spring } from 'remotion';
import { CONFETTI, P } from './brand';
import { FPS } from '../shared/kit';

/** Bouncy spring with overshoot: 0 -> 1, overshooting a little. */
export const boing = (f: number, at: number, damping = 9, stiffness = 170) =>
  f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 0.6 } });

/** Check mark (instead of a font glyph that some fonts lack). */
export const Check: React.FC<{ size: number; color: string; stroke?: number }> = ({ size, color, stroke = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <path d="M18 54 L42 76 L84 26" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A friendly bug. Legs wiggle while it walks; squash flattens it. */
export const Bug: React.FC<{ f: number; size: number; walking: boolean; squash: number }> = ({ f, size, walking, squash }) => {
  const w = walking ? Math.sin(f * 1.2) * 14 : 0;
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 200 160" style={{ overflow: 'visible', transform: `scale(${1 + squash * 0.6}, ${1 - squash * 0.8})`, transformOrigin: '50% 100%' }}>
      {[-1, 0, 1].map((k) => (
        <g key={k} stroke={P.ink} strokeWidth={8} strokeLinecap="round" fill="none">
          <path d={`M${100 + k * 28} 96 q ${-30} ${10 + (k % 2 ? w : -w)} ${-48} ${34}`} />
          <path d={`M${100 + k * 28} 96 q ${30} ${10 + (k % 2 ? -w : w)} ${48} ${34}`} />
        </g>
      ))}
      <ellipse cx={100} cy={92} rx={62} ry={44} fill={P.coral} stroke={P.ink} strokeWidth={8} />
      <path d="M100 50 V136" stroke={P.ink} strokeWidth={6} />
      <circle cx={78} cy={84} r={9} fill={P.ink} /><circle cx={122} cy={104} r={8} fill={P.ink} /><circle cx={118} cy={74} r={6} fill={P.ink} />
      <circle cx={44} cy={70} r={26} fill={P.ink} />
      <circle cx={36} cy={64} r={7} fill={P.white} /><circle cx={50} cy={62} r={7} fill={P.white} />
      <path d="M32 48 q -10 -26 -26 -30 M46 46 q 4 -28 22 -34" stroke={P.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** Mouse pointer; `press` (0..1) squashes it and shows a click ring. */
export const Cursor: React.FC<{ size: number; press: number; ring: number }> = ({ size, press, ring }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    {ring > 0 && ring < 1 && (
      <div style={{ position: 'absolute', left: -size * 0.6 * ring, top: -size * 0.6 * ring, width: size * 1.2 * ring, height: size * 1.2 * ring, borderRadius: '50%', border: `${size * 0.06}px solid ${P.ink}`, opacity: 1 - ring }} />
    )}
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', transform: `scale(${1 - press * 0.15})`, transformOrigin: '10% 10%' }}>
      <path d="M8 4 L8 82 L28 64 L42 94 L58 87 L44 58 L72 58 Z" fill={P.white} stroke={P.ink} strokeWidth={7} strokeLinejoin="round" />
    </svg>
  </div>
);

/** Deterministic confetti burst from (x, y) starting at frame `at`. */
export const Confetti: React.FC<{ f: number; at: number; x: number; y: number; count?: number; power?: number; u: number }> = ({ f, at, x, y, count = 46, power = 1, u }) => {
  const t = f - at;
  if (t < 0 || t > 60) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i * 137.508 * Math.PI) / 180;
        const sp = (10 + ((i * 7) % 11)) * power * u;
        const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp - 9 * power * u;
        const px = x + vx * t, py = y + vy * t + 0.55 * u * t * t;
        const s = (12 + (i % 4) * 5) * u;
        return (
          <div key={i} style={{
            position: 'absolute', left: px, top: py, width: s, height: s * (i % 3 === 0 ? 1 : 0.5), borderRadius: i % 5 === 0 ? '50%' : 3 * u,
            background: CONFETTI[i % CONFETTI.length], transform: `rotate(${t * (8 + (i % 6) * 3)}deg)`, opacity: Math.min(1, (60 - t) / 18),
          }} />
        );
      })}
    </>
  );
};

/** Light bulb with rays. */
export const Bulb: React.FC<{ size: number; on: number; f: number }> = ({ size, on, f }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
    <g transform={`rotate(${f * 1.5} 100 82)`} opacity={on}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2, r1 = 78 + on * 6, r2 = 98 + on * 16;
        return <line key={i} x1={100 + Math.cos(a) * r1} y1={82 + Math.sin(a) * r1} x2={100 + Math.cos(a) * r2} y2={82 + Math.sin(a) * r2} stroke={P.ink} strokeWidth={9} strokeLinecap="round" />;
      })}
    </g>
    <circle cx={100} cy={82} r={58} fill={on > 0.5 ? P.white : '#f3e3a8'} stroke={P.ink} strokeWidth={8} />
    <path d="M84 100 q 16 -26 32 0" fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
    <rect x={76} y={136} width={48} height={16} rx={6} fill={P.ink} />
    <rect x={80} y={156} width={40} height={14} rx={6} fill={P.ink} />
  </svg>
);

/** Toggle switch; k: 0 = off, 1 = on. */
export const Toggle: React.FC<{ k: number; w: number }> = ({ k, w }) => {
  const h = w * 0.5, knob = h * 0.78;
  return (
    <div style={{ width: w, height: h, borderRadius: h, background: k > 0.5 ? P.ink : 'rgba(23,20,31,.18)', position: 'relative', flex: 'none' }}>
      <div style={{ position: 'absolute', top: (h - knob) / 2, left: (h - knob) / 2 + k * (w - h), width: knob, height: knob, borderRadius: '50%', background: k > 0.5 ? P.lemon : P.white, boxShadow: '0 6px 16px rgba(0,0,0,.25)' }} />
    </div>
  );
};

/** Dez: a friendly round character with glasses. */
export const Dez: React.FC<{ size: number; lean?: number }> = ({ size, lean = 0 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: 'visible', transform: `rotate(${lean}deg)`, transformOrigin: '50% 100%' }}>
    <rect x={40} y={140} width={120} height={120} rx={50} fill={P.blue} stroke={P.ink} strokeWidth={8} />
    <circle cx={100} cy={86} r={66} fill="#ffd9b8" stroke={P.ink} strokeWidth={8} />
    <path d="M38 76 q 10 -64 70 -58 q 52 6 56 56 q -28 -26 -70 -24 q -34 2 -56 26 Z" fill={P.ink} />
    <circle cx={76} cy={92} r={17} fill="none" stroke={P.ink} strokeWidth={6} /><circle cx={124} cy={92} r={17} fill="none" stroke={P.ink} strokeWidth={6} />
    <path d="M93 92 h14" stroke={P.ink} strokeWidth={6} />
    <circle cx={76} cy={93} r={5} fill={P.ink} /><circle cx={124} cy={93} r={5} fill={P.ink} />
    <path d="M80 122 q 20 16 40 0" fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

/** The AI helper robot. */
export const Bot: React.FC<{ size: number; f: number; lean?: number }> = ({ size, f, lean = 0 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: 'visible', transform: `rotate(${lean}deg)`, transformOrigin: '50% 100%' }}>
    <path d="M100 30 V8" stroke={P.ink} strokeWidth={7} />
    <circle cx={100} cy={8} r={10} fill={f % 20 < 10 ? P.lemon : P.coral} stroke={P.ink} strokeWidth={5} />
    <rect x={40} y={30} width={120} height={104} rx={30} fill={P.mint} stroke={P.ink} strokeWidth={8} />
    <rect x={60} y={58} width={80} height={44} rx={18} fill={P.ink} />
    <circle cx={82} cy={80} r={8} fill={P.mint} /><circle cx={118} cy={80} r={8} fill={P.mint} />
    <rect x={50} y={146} width={100} height={98} rx={26} fill={P.white} stroke={P.ink} strokeWidth={8} />
    <circle cx={100} cy={194} r={14} fill={P.lilac} stroke={P.ink} strokeWidth={5} />
  </svg>
);
