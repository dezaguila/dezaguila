import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { K, MONO, SANS, SERIF } from '../brand';
import { p, Reveal, useLayout } from '../../shared/kit';

// 45 frames (3 beats) per step: plan, assist, deliver; then the closing line.
const STEP = 45;
const PHASES = [
  { n: '01', k: 'Plan', a: 'I', b: 'plan.', sub: 'Scope, design, decisions.' },
  { n: '02', k: 'Assist', a: 'AI', b: 'assists.', sub: 'Research, boilerplate, tests.' },
  { n: '03', k: 'Deliver', a: 'I', b: 'deliver.', sub: 'Reviewed, tested, documented.' },
];
// Generic tokens for the "AI assists" stream: not from any real codebase.
const TOKENS = ['class', 'record', 'stream()', '@Test', 'map', 'filter', 'Optional', 'async', 'SELECT', 'JOIN', 'retry', 'cache', 'validate', 'return', 'List<T>', 'assert', 'build', 'deploy', 'log.info', 'try', 'catch', 'final', 'var', 'interface'];

const Blueprint: React.FC<{ f: number; w: number; h: number; u: number }> = ({ f, w, h, u }) => {
  const d = (a: number) => p(f, a, a + 16);
  const boxes = [
    { x: 0.08, y: 0.18, label: 'CLIENT', at: 6 },
    { x: 0.4, y: 0.46, label: 'SERVICE', at: 12 },
    { x: 0.72, y: 0.18, label: 'DATA', at: 18 },
  ];
  const bw = w * 0.22, bh = h * 0.2;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={(w / 8) * i} y1={0} x2={(w / 8) * i} y2={h * d(i)} stroke={K.faint} strokeWidth={1} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} y1={(h / 6) * i} x1={0} y2={(h / 6) * i} x2={w * d(i + 2)} stroke={K.faint} strokeWidth={1} />
      ))}
      {[[0, 1], [1, 2]].map(([a, b], i) => {
        const A = boxes[a], B = boxes[b], k = d(22 + i * 4);
        const x1 = A.x * w + bw / 2, y1 = A.y * h + bh, x2 = B.x * w + bw / 2, y2 = B.y * h;
        return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={K.signal} strokeWidth={2 * u} strokeDasharray={`${6 * u} ${6 * u}`} />;
      })}
      {boxes.map((b) => {
        const k = d(b.at), per = 2 * (bw + bh);
        return (
          <g key={b.label}>
            <rect x={b.x * w} y={b.y * h} width={bw} height={bh} fill="none" stroke={K.bone} strokeWidth={2 * u} strokeDasharray={per} strokeDashoffset={per * (1 - k)} />
            <text x={b.x * w + bw / 2} y={b.y * h + bh / 2} fill={K.bone} opacity={p(f, b.at + 8, b.at + 16)} fontFamily={MONO} fontSize={20 * u} letterSpacing={3 * u} textAnchor="middle" dominantBaseline="middle">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

const Stream: React.FC<{ f: number; w: number; h: number; u: number }> = ({ f, w, h, u }) => {
  const cols = 4, rowH = 46 * u, rows = Math.floor(h / rowH);
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const speed = 2.2 + (c % 3) * 0.9;
        // y wraps inside the box, so tokens never leave the frame; edges fade instead of being masked
        const y = (((r * rowH - f * speed * u) % h) + h) % h;
        const edge = Math.min(y / (h * 0.18), (h - rowH - y) / (h * 0.18), 1);
        const tok = TOKENS[(i * 7 + c * 3) % TOKENS.length];
        const hot = (i * 13 + Math.floor(f / 6)) % 17 === 0;
        return (
          <div key={i} style={{
            position: 'absolute', left: (w / cols) * c, top: y, fontFamily: MONO, fontSize: 23 * u,
            color: hot ? K.bone : K.sky, opacity: Math.max(0, edge) * (hot ? 1 : 0.55), whiteSpace: 'nowrap',
          }}>{tok}</div>
        );
      })}
    </div>
  );
};

const Check: React.FC<{ f: number; w: number; h: number; u: number }> = ({ f, w, h, u }) => {
  const k = p(f, 4, 22);
  const s = Math.min(w, h) * 0.7;
  const len = 1.3 * s;
  return (
    <div style={{ width: w, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 * u }}>
      <svg width={s} height={s * 0.7} viewBox="0 0 100 70" style={{ overflow: 'visible' }}>
        <path d="M6 38 L36 64 L94 6" fill="none" stroke={K.signal} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={len} strokeDashoffset={len * (1 - k)} pathLength={len} />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 22 * u, letterSpacing: '0.2em', color: K.signal, border: `${2 * u}px solid ${K.signal}`, padding: `${12 * u}px ${20 * u}px`, opacity: p(f, 18, 28), transform: `rotate(-3deg) scale(${1.2 - 0.2 * p(f, 18, 28)})` }}>
        SHIPPED
      </div>
    </div>
  );
};

export const How: React.FC = () => {
  const f = useCurrentFrame();
  const { u, pad, v, vertical, width, height } = useLayout();
  const step = Math.min(3, Math.floor(f / STEP));
  const local = f - step * STEP;
  const visW = v(700 * u, width - pad * 2);
  const visH = v(560 * u, 620 * u);
  const closing = step === 3;
  const visOpacity = closing ? 1 - p(local, 0, 10) : 1;

  return (
    <AbsoluteFill style={{ background: K.ink }}>
      {/* Step index */}
      <div style={{ position: 'absolute', left: pad, top: v(150, 210) * u, display: 'flex', gap: 34 * u, fontFamily: MONO, fontSize: v(22, 26) * u, letterSpacing: '0.16em' }}>
        {PHASES.map((ph, i) => (
          <div key={ph.n} style={{ color: i === step ? K.signal : i < step ? K.bone : K.dim, transition: 'none' }}>
            {ph.n} {ph.k.toUpperCase()}
          </div>
        ))}
      </div>

      <AbsoluteFill style={{ flexDirection: vertical ? 'column-reverse' : 'row', alignItems: vertical ? 'flex-start' : 'center', justifyContent: vertical ? 'center' : 'space-between', padding: `0 ${pad}px`, gap: 60 * u }}>
        {/* Statement */}
        <div style={{ position: 'relative', width: v(880 * u, width - pad * 2), height: v(420, 380) * u }}>
          {PHASES.map((ph, i) => (
            <Reveal key={ph.n} at={i * STEP - 3} out={(i + 1) * STEP - 13} dur={12} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: SERIF, fontSize: v(210, 190) * u, lineHeight: 1.05, color: K.bone }}>
                <span style={{ color: ph.a === 'AI' ? K.sky : K.signal, fontStyle: 'italic' }}>{ph.a}</span> {ph.b}
              </div>
              <div style={{ fontFamily: SANS, fontSize: v(40, 42) * u, color: K.dim, marginTop: 18 * u }}>{ph.sub}</div>
            </Reveal>
          ))}
        </div>
        {/* Visual for the current step */}
        <div style={{ width: visW, height: visH, opacity: visOpacity, position: 'relative' }}>
          {step === 0 && <Blueprint f={local} w={visW} h={visH} u={u} />}
          {step === 1 && <Stream f={local} w={visW} h={visH} u={u} />}
          {step === 2 && <Check f={local} w={visW} h={visH} u={u} />}
        </div>
      </AbsoluteFill>

      {/* Closing line */}
      {closing && (
        <AbsoluteFill style={{ justifyContent: 'center', padding: `0 ${pad}px` }}>
          <Reveal at={3 * STEP - 2} dur={12}>
            <div style={{ fontFamily: SERIF, fontSize: v(150, 130) * u, lineHeight: 1.1, color: K.bone }}>
              <span style={{ color: K.sky }}>AI</span> is the tool.
            </div>
          </Reveal>
          <Reveal at={3 * STEP + 12} dur={12}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: v(150, 130) * u, lineHeight: 1.1, color: K.signal }}>
              The judgment is mine.
            </div>
          </Reveal>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
