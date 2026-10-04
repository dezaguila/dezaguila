import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { K, MONO, SANS, SERIF } from '../brand';
import { ease, p, Reveal, springAt, useLayout } from '../kit';

/** Count-up: settles on the final value; the number sharpens as it lands. */
const Roll: React.FC<{ to: number; at: number; dur: number; size: number; color: string }> = ({ to, at, dur, size, color }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const n = Math.round(k * to);
  return (
    <div style={{ display: 'flex', fontFamily: SERIF, fontSize: size, lineHeight: 1.05, color, filter: `blur(${(1 - k) * 6}px)`, opacity: f < at ? 0 : 0.3 + 0.7 * k }}>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</span>
      <span style={{ color: K.signal }}>+</span>
    </div>
  );
};

const STATIONS = [
  { x: 0.08, year: '2015', name: 'Accenture' },
  { x: 0.5, year: '2020', name: 'IBM Consulting' },
  { x: 0.92, year: '2023', name: 'Infor' },
];

export const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const { u, pad, v, vertical, width } = useLayout();
  const line = p(f, 62, 104);
  const trackW = width - pad * 2;

  return (
    <AbsoluteFill style={{ background: K.ink }}>
      <div style={{ position: 'absolute', left: pad, top: v(150, 210) * u, fontFamily: MONO, fontSize: v(22, 26) * u, letterSpacing: '0.16em', color: K.dim }}>
        TRACK RECORD
      </div>
      <AbsoluteFill style={{ padding: `0 ${pad}px`, justifyContent: 'center', gap: v(70, 90) * u }}>
        <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: v(140, 60) * u }}>
          <div>
            <Roll to={10} at={2} dur={26} size={v(260, 240) * u} color={K.bone} />
            <Reveal at={14}><div style={{ fontFamily: SANS, fontSize: v(38, 40) * u, color: K.dim, marginTop: 8 * u }}>years in enterprise software</div></Reveal>
          </div>
          <div style={{ opacity: p(f, 26, 34) }}>
            <Roll to={10} at={28} dur={26} size={v(260, 240) * u} color={K.bone} />
            <Reveal at={40}><div style={{ fontFamily: SANS, fontSize: v(38, 40) * u, color: K.dim, marginTop: 8 * u }}>apps modernized in one upgrade</div></Reveal>
          </div>
        </div>

        {/* Career track */}
        <div style={{ position: 'relative', width: trackW, height: 120 * u }}>
          <div style={{ position: 'absolute', left: 0, top: 87 * u, height: 2 * u, width: trackW * line, background: K.bone, opacity: 0.6 }} />
          {STATIONS.map((s) => {
            const reach = springAt(f, 62 + s.x * 42, 12);
            const left = s.x * trackW;
            const align = s.x < 0.2 ? 'flex-start' : s.x > 0.8 ? 'flex-end' : 'center';
            return (
              <div key={s.name} style={{ position: 'absolute', left: Math.min(left, trackW - 1), top: 0, transform: `translateX(${align === 'center' ? '-50%' : align === 'flex-end' ? '-100%' : '0'})`, display: 'flex', flexDirection: 'column', alignItems: align, opacity: Math.min(1, reach * 1.5) }}>
                <div style={{ fontFamily: MONO, fontSize: v(22, 22) * u, letterSpacing: '0.14em', color: K.dim, whiteSpace: 'nowrap' }}>{s.year}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: v(30, 28) * u, color: K.bone, whiteSpace: 'nowrap', marginTop: 2 * u }}>{s.name}</div>
                <div style={{ width: 18 * u, height: 18 * u, borderRadius: '50%', background: s.name === 'Infor' ? K.signal : K.bone, marginTop: 10 * u, transform: `scale(${reach})` }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
