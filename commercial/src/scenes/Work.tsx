import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';
import { Label, pop, prog, Rise, Scene, useUnit } from '../ui';

// Generic example code: not from any employer or client.
const CODE: [string, string][] = [
  ['k', '@Service'],
  ['k', 'public class InvoiceService {'],
  ['c', '  // validate, settle, persist'],
  ['t', '  public Invoice settle(Invoice inv) {'],
  ['t', '    rules.validate(inv);'],
  ['t', '    return repo.save(inv.markPaid());'],
  ['t', '  }'],
  ['k', '}'],
];
const CHARS = CODE.reduce((n, [, l]) => n + l.length, 0);

const STEPS = [
  { t: 'I plan', s: 'scope, design, decisions', human: true },
  { t: 'AI assists', s: 'research, boilerplate, tests', human: false },
  { t: 'I deliver', s: 'reviewed, tested, documented', human: true },
];

export const Work: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useUnit();

  // Which loop step is active: plan (0-50), assist (50-110, while code types), deliver (110+)
  const active = f < 50 ? 0 : f < 110 ? 1 : 2;
  const typed = Math.floor(interpolate(f, [50, 108], [0, CHARS], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const review = prog(f, 112, 128);
  const pass = pop(f, fps, 132, 12);

  let left = typed;
  const colour = { k: C.leaf, c: '#7f9a8b', t: C.cream };

  return (
    <Scene dur={dur} bg={C.forest}>
      <AbsoluteFill style={{ padding: vertical ? `${120 * u}px ${70 * u}px` : `${90 * u}px ${130 * u}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 44 * u, color: C.cream }}>
        <div>
          <Rise at={0}><Label color={C.gold}>How I work</Label></Rise>
          <Rise at={6}>
            <div style={{ fontSize: (vertical ? 84 : 96) * u, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.02, marginTop: 12 * u }}>
              Engineer-led. <span style={{ color: C.leaf, whiteSpace: 'nowrap' }}>AI-assisted.</span>
            </div>
          </Rise>
        </div>

        <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 40 * u, alignItems: 'stretch' }}>
          {/* Loop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 * u, width: vertical ? '100%' : 560 * u }}>
            {STEPS.map((st, i) => {
              const on = active === i;
              const appear = pop(f, fps, 14 + i * 6);
              const bg = on ? (st.human ? C.gold : C.leaf) : 'rgba(255,255,255,.07)';
              return (
                <div key={st.t} style={{ display: 'flex', alignItems: 'center', gap: 22 * u, padding: `${24 * u}px ${28 * u}px`, borderRadius: 24 * u, background: bg, color: on ? C.deep : C.cream, transform: `translateX(${(1 - appear) * -60 * u}px) scale(${on ? 1.03 : 1})`, opacity: appear, transition: 'none' }}>
                  <div style={{ width: 56 * u, height: 56 * u, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 28 * u, fontWeight: 800, background: on ? 'rgba(22,38,30,.12)' : 'rgba(255,255,255,.08)', flex: 'none' }}>
                    {i < active ? '✓' : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 34 * u, fontWeight: 800, letterSpacing: '-0.02em' }}>{st.t}</div>
                    <div style={{ fontSize: 22 * u, opacity: 0.75 }}>{st.s}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editor */}
          <div style={{ flex: 1, borderRadius: 28 * u, background: C.deep, border: `${2 * u}px solid rgba(255,255,255,.08)`, overflow: 'hidden', position: 'relative', opacity: prog(f, 20, 34), minHeight: (vertical ? 520 : 0) * u }}>
            <div style={{ display: 'flex', gap: 10 * u, padding: `${18 * u}px ${22 * u}px`, borderBottom: `${2 * u}px solid rgba(255,255,255,.06)` }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 16 * u, height: 16 * u, borderRadius: '50%', background: c }} />)}
              <div style={{ marginLeft: 16 * u, fontSize: 20 * u, color: '#7f9a8b', fontFamily: 'ui-monospace, Menlo, monospace' }}>InvoiceService.java</div>
            </div>
            <div style={{ padding: `${26 * u}px ${30 * u}px`, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: (vertical ? 27 : 29) * u, lineHeight: 1.6, whiteSpace: 'pre' }}>
              {CODE.map(([kind, line], i) => {
                const shown = line.slice(0, Math.max(0, left));
                left -= line.length;
                const reviewed = review > i / CODE.length;
                return (
                  <div key={i} style={{ color: colour[kind as 'k' | 'c' | 't'], background: reviewed && f > 112 ? 'rgba(233,196,106,.10)' : 'transparent', borderLeft: `${4 * u}px solid ${reviewed && f > 112 ? C.gold : 'transparent'}`, paddingLeft: 14 * u, minHeight: '1.6em' }}>
                    {shown}
                    {f >= 50 && f < 110 && shown.length < line.length && shown.length > 0 ? <span style={{ background: C.leaf, color: C.deep }}>{' '}</span> : null}
                  </div>
                );
              })}
            </div>
            <div style={{ position: 'absolute', right: 26 * u, bottom: 26 * u, padding: `${14 * u}px ${22 * u}px`, borderRadius: 999, background: C.leaf, color: C.deep, fontWeight: 800, fontSize: 24 * u, transform: `scale(${pass})`, opacity: Math.min(1, pass * 1.5) }}>
              ✓ Reviewed · tests passing
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
