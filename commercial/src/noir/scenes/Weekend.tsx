import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { K, MONO, SANS, SERIF } from '../brand';
import { easeIn, p, Reveal, useLayout } from '../../shared/kit';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The musical breakdown: calm, then a riser into the final impact. */
export const Weekend: React.FC = () => {
  const f = useCurrentFrame();
  const { u, pad, v, width, height } = useLayout();
  const horizon = height * v(0.66, 0.6);
  const rise = p(f, 20, 95);
  const swell = p(f, 98, 120, easeIn);                 // riser: the sun floods the frame
  const textOut = p(f, 92, 104, easeIn);
  const sunR = v(190, 170) * u * (1 + swell * 5);
  const sunY = horizon + sunR * 0.9 - rise * v(180, 200) * u;
  const lit = p(f, 26, 40);

  return (
    <AbsoluteFill style={{ background: K.ink }}>
      {/* Sun behind the horizon */}
      <div style={{
        position: 'absolute', left: width / 2 - sunR, top: sunY - sunR, width: sunR * 2, height: sunR * 2, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 45%, #ffe27a, ${K.signal} 55%, #f2a81d)`,
        boxShadow: `0 0 ${160 * u}px ${40 * u}px rgba(255,210,63,${0.25 + swell * 0.4})`,
      }} />
      {/* Ground below the horizon hides the lower half of the sun */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: horizon, bottom: 0, background: K.ink }} />
      <div style={{ position: 'absolute', left: pad, right: pad, top: horizon, height: 2 * u, background: K.bone, opacity: 0.5 * (1 - swell) }} />

      <div style={{ position: 'absolute', left: pad, right: pad, top: v(150, 210) * u, opacity: 1 - swell }}>
        <div style={{ fontFamily: MONO, fontSize: v(22, 26) * u, letterSpacing: '0.16em', color: K.dim }}>AVAILABILITY</div>
      </div>

      {/* Week row sits on the horizon */}
      <div style={{ position: 'absolute', left: pad, right: pad, top: horizon + 34 * u, display: 'flex', justifyContent: 'space-between', opacity: 1 - textOut }}>
        {DAYS.map((d, i) => {
          const weekend = i >= 5;
          return (
            <Reveal key={d} at={2 + i * 2} dur={10}>
              <div style={{ fontFamily: MONO, fontSize: v(30, 30) * u, letterSpacing: '0.12em', color: weekend ? (lit > 0.5 ? K.signal : K.dim) : 'rgba(241,236,226,.28)', fontWeight: weekend ? 700 : 400 }}>
                {d.toUpperCase()}
              </div>
              <div style={{ fontFamily: MONO, fontSize: v(18, 18) * u, color: K.dim, marginTop: 8 * u, opacity: weekend ? lit : 0.6 }}>
                {weekend ? 'your project' : 'day job'}
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Message above the horizon */}
      <div style={{ position: 'absolute', left: pad, right: pad, top: horizon - v(440, 680) * u, textAlign: 'center', opacity: 1 - textOut, textShadow: `0 ${4 * u}px ${30 * u}px ${K.ink}` }}>
        <Reveal at={30}>
          <div style={{ fontFamily: SERIF, fontSize: v(130, 116) * u, lineHeight: 1.08, color: K.bone }}>
            Weekends are for <span style={{ fontStyle: 'italic', color: K.signal }}>your project.</span>
          </div>
        </Reveal>
        <Reveal at={48}>
          <div style={{ fontFamily: SANS, fontSize: v(36, 38) * u, color: K.dim, marginTop: 20 * u }}>
            Open to side projects: fixed scope, fixes, light ongoing support.
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
