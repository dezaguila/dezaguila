import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { K, MONO, SANS, SERIF } from '../brand';
import { p, Reveal, useLayout } from '../kit';

const STEP = 45;
const ITEMS = [
  { t: 'Java & Spring builds', s: 'Features, APIs, batch jobs and integrations.' },
  { t: 'Bug hunts & rescues', s: 'The issues nobody else can reproduce.' },
  { t: 'Upgrades & migrations', s: 'Java, frameworks and app servers, moved forward safely.' },
  { t: 'Databases & integrations', s: 'SQL, reports, REST and SOAP between systems.' },
];

// Morphing wireframe: each service gets a shape; points are resampled so any shape can tween to any other.
const N = 96;
const polygon = (sides: number, rot = -Math.PI / 2) => Array.from({ length: N }, (_, i) => {
  const t = i / N, seg = Math.floor(t * sides), lt = t * sides - seg;
  const a1 = rot + (seg / sides) * Math.PI * 2, a2 = rot + ((seg + 1) / sides) * Math.PI * 2;
  return [Math.cos(a1) + (Math.cos(a2) - Math.cos(a1)) * lt, Math.sin(a1) + (Math.sin(a2) - Math.sin(a1)) * lt];
});
const circle = Array.from({ length: N }, (_, i) => [Math.cos((i / N) * Math.PI * 2 - Math.PI / 2), Math.sin((i / N) * Math.PI * 2 - Math.PI / 2)]);
const SHAPES = [circle, polygon(4, -Math.PI / 4), polygon(3), polygon(6)];

const Morph: React.FC<{ f: number; size: number; u: number }> = ({ f, size, u }) => {
  const idx = Math.min(SHAPES.length - 1, Math.floor(f / STEP));
  const k = idx === 0 ? 1 : p(f, idx * STEP - 4, idx * STEP + 10);
  const from = SHAPES[Math.max(0, idx - 1)], to = SHAPES[idx];
  const rot = f * 0.6;
  const r = size * 0.38;
  const pts = to.map((pt, i) => [from[i][0] + (pt[0] - from[i][0]) * k, from[i][1] + (pt[1] - from[i][1]) * k]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${size / 2 + x * r} ${size / 2 + y * r}`).join(' ') + 'Z';
  const orbit = (f / 90) * Math.PI * 2;
  return (
    <svg width={size} height={size} style={{ overflow: 'visible', transform: `rotate(${rot}deg)` }}>
      <circle cx={size / 2} cy={size / 2} r={r * 1.25} fill="none" stroke={K.faint} strokeWidth={1.5 * u} strokeDasharray={`${4 * u} ${10 * u}`} />
      <path d={d} fill="none" stroke={K.bone} strokeWidth={3 * u} strokeLinejoin="round" />
      <path d={d} fill={K.signal} opacity={0.08} />
      <circle cx={size / 2 + Math.cos(orbit) * r * 1.25} cy={size / 2 + Math.sin(orbit) * r * 1.25} r={9 * u} fill={K.signal} />
    </svg>
  );
};

export const Services: React.FC = () => {
  const f = useCurrentFrame();
  const { u, pad, v, vertical, width } = useLayout();
  const idx = Math.min(ITEMS.length - 1, Math.floor(f / STEP));
  const shapeSize = v(560, 520) * u;

  return (
    <AbsoluteFill style={{ background: K.ink }}>
      <div style={{ position: 'absolute', left: pad, top: v(150, 210) * u, fontFamily: MONO, fontSize: v(22, 26) * u, letterSpacing: '0.16em', color: K.dim }}>
        WHAT I BUILD &amp; FIX
      </div>
      <AbsoluteFill style={{ flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'flex-start' : 'center', justifyContent: vertical ? 'center' : 'space-between', padding: `0 ${pad}px`, gap: 50 * u }}>
        <div style={{ position: 'relative', width: v(1040 * u, width - pad * 2), height: v(460, 470) * u }}>
          {ITEMS.map((it, i) => (
            <Reveal key={it.t} at={i * STEP - 3} out={i < ITEMS.length - 1 ? (i + 1) * STEP - 8 : undefined} dur={12} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: v(30, 32) * u, color: K.signal, letterSpacing: '0.1em' }}>
                {String(i + 1).padStart(2, '0')} <span style={{ color: K.dim }}>/ 04</span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: v(150, 136) * u, lineHeight: 1.06, color: K.bone, marginTop: 16 * u }}>{it.t}</div>
              <div style={{ fontFamily: SANS, fontSize: v(38, 40) * u, color: K.dim, marginTop: 22 * u, maxWidth: 900 * u }}>{it.s}</div>
            </Reveal>
          ))}
        </div>
        <div style={{ alignSelf: vertical ? 'center' : undefined, opacity: p(f, 0, 12) }}>
          <Morph f={f} size={shapeSize} u={u} />
        </div>
      </AbsoluteFill>
      {/* progress ticks along the bottom, one per service */}
      <div style={{ position: 'absolute', left: pad, right: pad, bottom: v(150, 210) * u, display: 'flex', gap: 14 * u }}>
        {ITEMS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4 * u, background: K.faint }}>
            <div style={{ height: '100%', width: `${(i < idx ? 1 : i === idx ? p(f, i * STEP, (i + 1) * STEP, (x) => x) : 0) * 100}%`, background: K.signal }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
