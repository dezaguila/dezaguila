import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { fb, FONT, FONTS, P, TL } from './brand';
import { boing, Bot, Bug, Bulb, Check, Confetti, Cursor, Dez, Toggle } from './props';
import { ease, p, Reveal, TextCheck, useFonts, useLayout, Words } from '../shared/kit';

type L = ReturnType<typeof useLayout>;
const C = TL.cues;

/** Scene with a circle-wipe entrance from `origin` (percent). */
const Scene: React.FC<{ f: number; start: number; end: number; bg: string; color: string; origin: [number, number]; children: React.ReactNode }> = ({ f, start, end, bg, color, origin, children }) => {
  const a = fb(start), b = fb(end);
  if (f < a - 10 || f >= b) return null;
  const r = start === 0 ? 150 : p(f, a - 10, a, ease) * 150;
  return (
    <AbsoluteFill style={{ background: bg, color, clipPath: `circle(${r}% at ${origin[0]}% ${origin[1]}%)` }}>
      {children}
    </AbsoluteFill>
  );
};

const Headline: React.FC<{ text: string; at: number; size: number; color?: string; accent?: string[]; accentColor?: string; top: number; L: L }> = ({ text, at, size, color, accent = [], accentColor, top, L }) => (
  <div style={{ position: 'absolute', left: L.pad, right: L.pad, top, textAlign: 'center' }}>
    <Words text={text} at={at} stagger={2} style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.04, color }}
      wordStyle={(w) => (accent.includes(w) ? { color: accentColor } : undefined)} />
  </div>
);

// ---------- 1. Got a bug? ----------
const BugScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, width, height } = L;
  const words = ['Got', 'a', 'bug?'];
  const bugSize = v(420, 420) * u;
  const walk = p(f, fb(C.bugIn), fb(C.cursorIn), (x) => x);
  const bugX = width + 100 * u + (width / 2 - bugSize / 2 - width - 100 * u) * ease(walk);
  const bugY = height * v(0.5, 0.5);
  const squash = p(f, fb(C.squash), fb(C.squash) + 5);
  const target = { x: width / 2 + 20 * u, y: bugY + bugSize * 0.3 };
  const ck = p(f, fb(C.cursorIn), fb(C.squash) - 3, ease);
  const curX = -150 * u + (target.x + 150 * u) * ck, curY = height + 100 * u + (target.y - height - 100 * u) * ck;
  const press = f >= fb(C.squash) - 1 && f < fb(C.squash) + 5 ? 1 : 0;
  const fixed = boing(f, fb(C.fixed));
  return (
    <>
      <div style={{ position: 'absolute', left: L.pad, right: L.pad, top: height * v(0.16, 0.2), display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: `0 ${36 * u}px` }}>
        {words.map((w, i) => {
          const k = boing(f, fb(C.slam[i]));
          return (
            <span key={w} style={{ display: 'inline-block', fontSize: v(230, 200) * u, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05, color: i === 2 ? P.coral : P.ink, transform: `scale(${2.1 - 1.1 * k}) rotate(${(1 - k) * -10}deg)`, opacity: k > 0 ? 1 : 0 }}>{w}</span>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: bugX, top: bugY, opacity: 1 - p(f, fb(7.2), fb(7.8)) }}>
        <Bug f={f} size={bugSize} walking={walk > 0 && walk < 1} squash={squash} />
      </div>
      <Confetti f={f} at={fb(C.squash)} x={width / 2} y={bugY + bugSize * 0.4} u={u} />
      <div style={{ position: 'absolute', left: width / 2, top: bugY - 40 * u, transform: `translate(-50%, -50%) scale(${fixed}) rotate(-8deg)`, opacity: fixed > 0 ? 1 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 * u, background: P.mint, color: P.ink, fontSize: v(64, 60) * u, fontWeight: 800, padding: `${14 * u}px ${34 * u}px`, borderRadius: 999, border: `${6 * u}px solid ${P.ink}` }}>
          <Check size={56 * u} color={P.ink} /> Fixed
        </div>
      </div>
      {ck > 0 && f < fb(7.6) && <div style={{ position: 'absolute', left: curX, top: curY }}><Cursor size={110 * u} press={press} ring={p(f, fb(C.squash), fb(C.squash) + 14, (x) => x)} /></div>}
    </>
  );
};

// ---------- 2. Stuck on an old version? ----------
const BLOCKS = [
  { old: 'Java 8', now: 'Java 21' },
  { old: 'Spring 4', now: 'Spring Boot 3' },
  { old: 'Legacy server', now: 'Modern runtime' },
];
const UpgradeScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, width, height } = L;
  const bw = v(760, 860) * u, bh = v(140, 140) * u;
  return (
    <>
      <Headline L={L} text="Stuck on an old version?" at={fb(8.3)} size={v(118, 100) * u} color={P.white} accent={['old']} accentColor={P.lemon} top={height * v(0.1, 0.14)} />
      <div style={{ position: 'absolute', left: width / 2 - bw / 2, top: height * v(0.36, 0.4), display: 'flex', flexDirection: 'column', gap: 22 * u }}>
        {BLOCKS.map((b, i) => {
          const drop = boing(f, fb(9 + i * 0.5), 11);
          const upAt = fb(C.boings[2 - i]);
          const q = p(f, upAt, upAt + 10, (x) => x);
          const done = f >= upAt + 5;
          const wobble = done ? 0 : Math.sin(f * 0.3 + i * 1.7) * 2.2;
          return (
            <div key={b.old} style={{
              width: bw, height: bh, borderRadius: 30 * u, border: `${6 * u}px solid ${P.ink}`, background: done ? P.mint : P.white, color: P.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${36 * u}px`, boxSizing: 'border-box',
              fontSize: v(66, 62) * u, fontWeight: 800, letterSpacing: '-0.02em',
              transform: `translateY(${(1 - drop) * -700 * u - Math.sin(Math.PI * q) * 90 * u}px) rotate(${wobble}deg)`, opacity: drop > 0 ? 1 : 0,
              boxShadow: `0 ${10 * u}px 0 ${P.ink}`,
            }}>
              <span>{done ? b.now : b.old}</span>
              {done && <Check size={64 * u} color={P.ink} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: L.pad, right: L.pad, top: height * v(0.84, 0.76), textAlign: 'center' }}>
        <Reveal at={fb(C.upgraded)}><div style={{ fontSize: v(70, 64) * u, fontWeight: 800, color: P.lemon }}>Upgraded. Nothing broke.</div></Reveal>
      </div>
    </>
  );
};

// ---------- 3. Got a side project idea? ----------
const IdeaScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, vertical, width, height } = L;
  const on = p(f, fb(C.bulb), fb(C.bulb) + 6);
  const bulbK = boing(f, fb(C.bulb) - 4);
  const ww = v(760, 820) * u, wh = v(480, 520) * u;
  const part = (i: number) => boing(f, fb(C.parts[i]), 10);
  const from = (i: number) => [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, 1], [1, -1]][i];
  const fly = (i: number): React.CSSProperties => {
    const k = part(i), [dx, dy] = from(i);
    return { transform: `translate(${(1 - k) * dx * 500 * u}px, ${(1 - k) * dy * 400 * u}px) rotate(${(1 - k) * 20 * dx}deg)`, opacity: k > 0 ? 1 : 0 };
  };
  return (
    <>
      <Headline L={L} text="Got a side project idea?" at={fb(16.3)} size={v(118, 100) * u} color={P.ink} accent={['idea?']} accentColor={P.blue} top={height * v(0.08, 0.12)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: height * v(0.32, 0.3), display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: v(110, 60) * u }}>
        <div style={{ transform: `scale(${bulbK})` }}><Bulb size={v(320, 300) * u} on={on} f={f} /></div>
        <div style={{ position: 'relative', width: ww, height: wh }}>
          <div style={{ position: 'absolute', inset: 0, background: P.white, borderRadius: 36 * u, border: `${6 * u}px solid ${P.ink}`, boxShadow: `0 ${14 * u}px 0 ${P.ink}`, ...fly(0) }} />
          <div style={{ position: 'absolute', left: 30 * u, top: 26 * u, display: 'flex', gap: 12 * u, ...fly(1) }}>
            {[P.coral, P.lemon, P.mint].map((c) => <div key={c} style={{ width: 24 * u, height: 24 * u, borderRadius: '50%', background: c, border: `${4 * u}px solid ${P.ink}` }} />)}
          </div>
          <div style={{ position: 'absolute', left: 30 * u, right: 30 * u, top: 80 * u, height: wh * 0.32, borderRadius: 22 * u, background: P.blue, ...fly(2) }} />
          <div style={{ position: 'absolute', left: 30 * u, width: ww * 0.42, bottom: 110 * u, height: wh * 0.24, borderRadius: 22 * u, background: P.coral, ...fly(3) }} />
          <div style={{ position: 'absolute', right: 30 * u, width: ww * 0.42, bottom: 110 * u, height: wh * 0.24, borderRadius: 22 * u, background: P.mint, ...fly(4) }} />
          <div style={{ position: 'absolute', right: 30 * u, bottom: 28 * u, padding: `${14 * u}px ${30 * u}px`, borderRadius: 999, background: P.ink, color: P.white, fontSize: 34 * u, fontWeight: 800, ...fly(5) }}>Ship it</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: L.pad, right: L.pad, top: height * v(0.84, 0.86), textAlign: 'center' }}>
        <Reveal at={fb(C.shipped)}><div style={{ fontSize: v(70, 64) * u, fontWeight: 800 }}>From idea to <span style={{ color: P.blue }}>shipped.</span></div></Reveal>
      </div>
    </>
  );
};

// ---------- 4. Meet Dez! ----------
const CHIPS = [
  { t: 'Java', h: [0.12, 0.2], v: [0.08, 0.2] },
  { t: 'Spring', h: [0.74, 0.74], v: [0.6, 0.76] },
  { t: 'SQL', h: [0.14, 0.72], v: [0.1, 0.72] },
  { t: 'AI tools', h: [0.44, 0.82], v: [0.36, 0.84] },
];
const MeetScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, width, height } = L;
  const letters = 'Meet Dez!'.split('');
  const badge = boing(f, fb(C.badge));
  return (
    <>
      {CHIPS.map((c, i) => {
        const k = boing(f, fb(C.chips[i]));
        const [x, y] = v(c.h, c.v);
        return (
          <div key={c.t} style={{ position: 'absolute', left: width * x, top: height * y + Math.sin(f * 0.12 + i) * 10 * u, transform: `scale(${k}) rotate(${(i % 2 ? 6 : -6)}deg)`, background: P.white, color: P.ink, fontSize: v(44, 42) * u, fontWeight: 800, padding: `${12 * u}px ${28 * u}px`, borderRadius: 999, border: `${5 * u}px solid ${P.ink}`, whiteSpace: 'nowrap' }}>{c.t}</div>
        );
      })}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', fontSize: v(280, 210) * u, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.05, color: P.white }}>
            {letters.map((ch, i) => {
              const k = boing(f, fb(C.letters) + i * 2);
              return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', color: ch === '!' ? P.lemon : P.white, transform: `translateY(${(1 - k) * -260 * u}px) rotate(${(1 - k) * (i % 2 ? 14 : -14)}deg)`, opacity: k > 0 ? 1 : 0 }}>{ch}</span>;
            })}
          </div>
          <div style={{ position: 'absolute', right: v(-250, -60) * u, top: v(-200, -230) * u, width: v(230, 200) * u, height: v(230, 200) * u, borderRadius: '50%', background: P.lemon, color: P.ink, border: `${6 * u}px solid ${P.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${badge}) rotate(${12 + Math.sin(f * 0.08) * 6}deg)`, opacity: badge > 0 ? 1 : 0 }}>
            <div style={{ fontSize: v(86, 76) * u, fontWeight: 800, lineHeight: 1 }}>10+</div>
            <div style={{ fontSize: v(28, 26) * u, fontWeight: 800, letterSpacing: '0.12em' }}>YEARS</div>
          </div>
          <Reveal at={fb(27)}><div style={{ textAlign: 'center', fontSize: v(56, 50) * u, fontWeight: 700, color: P.white, marginTop: 10 * u }}>Senior software engineer who ships.</div></Reveal>
        </div>
      </AbsoluteFill>
    </>
  );
};

// ---------- 5. How I work: AI does the legwork, I make the calls ----------
const HowScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, width, height } = L;
  const ground = height * v(0.9, 0.84);
  const size = v(380, 340) * u;
  const walk = p(f, fb(C.carry), fb(C.carry + 2), (x) => x);
  const botX = width * v(0.84, 0.8) + (width * v(0.6, 0.58) - width * v(0.84, 0.8)) * ease(walk);
  const hop = walk > 0 && walk < 1 ? Math.abs(Math.sin(walk * Math.PI * 4)) * 30 * u : 0;
  const placed = f >= fb(C.carry + 2.5);
  const boxS = v(190, 170) * u;
  const boxX = placed ? width * 0.47 - boxS / 2 : botX - boxS * 0.8;
  const boxY = placed ? ground - boxS : ground - size * 0.9 - hop;
  const stamp = boing(f, fb(C.approve), 10, 200);
  const five = p(f, fb(C.highfive), fb(C.highfive) + 6);
  const capTop = height * v(0.12, 0.14);
  const caption = (text: string, at: number, out?: number, color = P.ink) => (
    <div style={{ position: 'absolute', left: L.pad, right: L.pad, top: capTop, textAlign: 'center' }}>
      <Reveal at={at} out={out}><div style={{ fontSize: v(112, 92) * u, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color }}>{text}</div></Reveal>
    </div>
  );
  return (
    <>
      {caption('AI does the legwork.', fb(C.carry) - 4, fb(C.approve) - 12)}
      {caption('I make the calls.', fb(C.approve) - 1, fb(C.highfive) - 11)}
      {caption('Engineer-led. AI-assisted.', fb(C.highfive), undefined, P.white)}
      <div style={{ position: 'absolute', left: 0, right: 0, top: ground, height: 6 * u, background: P.ink, opacity: 0.25 }} />
      <div style={{ position: 'absolute', left: width * v(0.2, 0.12) + five * 40 * u, top: ground - size * 1.3 }}><Dez size={size} lean={five * 12} /></div>
      <div style={{ position: 'absolute', left: botX - size / 2 - five * 40 * u, top: ground - size * 1.3 - hop }}><Bot size={size} f={f} lean={-five * 12} /></div>
      <div style={{ position: 'absolute', left: boxX, top: boxY, width: boxS, height: boxS, background: P.lemon, border: `${6 * u}px solid ${P.ink}`, borderRadius: 16 * u, display: 'grid', placeItems: 'center', fontSize: 30 * u, fontWeight: 800, color: P.ink }}>
        TASK
        {stamp > 0 && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(-14deg) scale(${2.6 - 1.6 * stamp})`, border: `${6 * u}px solid ${P.coral}`, color: P.coral, background: 'rgba(255,255,255,.9)', fontSize: 34 * u, fontWeight: 800, padding: `${6 * u}px ${14 * u}px`, borderRadius: 10 * u, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>APPROVED</div>
        )}
      </div>
      <Confetti f={f} at={fb(C.highfive)} x={width * 0.45} y={ground - size * 1.2} count={30} power={0.7} u={u} />
    </>
  );
};

// ---------- 6. Services slot machine ----------
const SERVICES = ['Java & Spring', 'APIs', 'Bug hunts', 'Upgrades', 'Migrations', 'Databases', 'Reports', 'Integrations'];
const CARD = [P.blue, P.coral, P.lemon, P.mint, P.lilac, P.blue, P.coral, P.lemon];
const ServicesScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, height } = L;
  const flips = C.flips.map(fb);
  const idx = Math.max(0, flips.reduce((a, t, i) => (f >= t - 1 ? i : a), 0));
  const k = p(f, flips[idx] - 1, flips[idx] + 5);
  const bg = CARD[idx], dark = bg === P.lemon || bg === P.mint;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 46 * u }}>
      <Reveal at={fb(40) - 6}><div style={{ fontSize: v(60, 54) * u, fontWeight: 800, color: P.lemon }}>I can help with</div></Reveal>
      <div style={{ perspective: 1400 * u }}>
        <div style={{
          width: v(1240, 980) * u, height: v(300, 300) * u, borderRadius: 48 * u, background: bg, color: dark ? P.ink : P.white,
          display: 'grid', placeItems: 'center', fontSize: v(132, 112) * u, fontWeight: 800, letterSpacing: '-0.04em',
          transform: `rotateX(${(1 - k) * -85}deg)`, transformOrigin: '50% 100%', boxShadow: `0 ${16 * u}px 0 rgba(255,255,255,.12)`,
        }}>{SERVICES[idx]}</div>
      </div>
      <div style={{ display: 'flex', gap: 14 * u }}>
        {SERVICES.map((_, i) => <div key={i} style={{ width: (i === idx ? 44 : 16) * u, height: 16 * u, borderRadius: 99, background: i <= idx ? CARD[i] : 'rgba(255,255,255,.2)' }} />)}
      </div>
      <div style={{ position: 'absolute', bottom: height * 0.1, fontSize: v(40, 38) * u, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
        <Reveal at={fb(44)}>…and the bugs nobody else can find.</Reveal>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Weekend mode ----------
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WeekendScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, vertical } = L;
  const on = p(f, fb(C.toggle), fb(C.toggle) + 6);
  const swell = p(f, fb(54), fb(56), (x) => x * x);
  const tile = v(170, 128) * u;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 60 * u, transform: `scale(${1 + swell * 0.06}) rotate(${Math.sin(f * 2.3) * swell * 0.8}deg)` }}>
      <Reveal at={fb(48) + 2}>
        <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 40 * u }}>
          <div style={{ fontSize: v(150, 130) * u, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05 }}>Weekend mode</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 * u }}>
            <Toggle k={on} w={v(250, 230) * u} />
            <div style={{ fontSize: v(64, 60) * u, fontWeight: 800, opacity: on }}>ON</div>
          </div>
        </div>
      </Reveal>
      <div style={{ display: 'flex', gap: 16 * u }}>
        {DAYS.map((d, i) => {
          const weekend = i >= 5;
          const st = weekend ? boing(f, fb(C.stickers[i - 5]), 9, 200) : 0;
          return (
            <Reveal key={d} at={fb(48.5) + i * 2}>
              <div style={{ position: 'relative', width: tile, height: tile, borderRadius: 30 * u, background: P.white, border: `${5 * u}px solid ${P.ink}`, display: 'grid', placeItems: 'center', fontSize: v(40, 30) * u, fontWeight: 800, color: weekend ? P.ink : 'rgba(23,20,31,.4)' }}>
                {d.toUpperCase()}
                {st > 0 && (
                  <div style={{ position: 'absolute', right: -tile * 0.28, top: -tile * 0.32, width: tile * 0.52, height: tile * 0.52, borderRadius: '50%', background: P.lemon, border: `${5 * u}px solid ${P.ink}`, display: 'grid', placeItems: 'center', transform: `scale(${2.2 - 1.2 * st}) rotate(${(1 - st) * 40}deg)` }}>
                    <Check size={tile * 0.42} color={P.ink} stroke={16} />
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal at={fb(53.5)}><div style={{ fontSize: v(58, 52) * u, fontWeight: 800, textAlign: 'center', padding: `0 ${L.pad}px` }}>Open to side projects. Mainly weekends.</div></Reveal>
    </AbsoluteFill>
  );
};

// ---------- 8. Call to action ----------
const CtaScene: React.FC<{ f: number; L: L }> = ({ f, L }) => {
  const { u, v, width, height } = L;
  const btn = boing(f, fb(58), 10);
  const click = fb(C.ctaClick);
  const ck = p(f, fb(58.5), click - 2, ease);
  const target = { x: width / 2 + v(160, 120) * u, y: height * v(0.62, 0.58) + 20 * u };
  const curX = width + 120 * u + (target.x - width - 120 * u) * ck, curY = height + 120 * u + (target.y - height - 120 * u) * ck;
  const press = f >= click - 1 && f < click + 5 ? 1 : 0;
  return (
    <>
      <Headline L={L} text="Let's build something great." at={fb(56.3)} size={v(150, 128) * u} color={P.ink} accent={['great.']} accentColor={P.blue} top={height * v(0.2, 0.2)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: height * v(0.56, 0.52), display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${btn * (press ? 0.94 : 1)})`, opacity: btn > 0 ? 1 : 0, background: P.blue, color: P.white, fontSize: v(66, 56) * u, fontWeight: 800, padding: `${28 * u}px ${56 * u}px`, borderRadius: 999, border: `${6 * u}px solid ${P.ink}`, boxShadow: `0 ${12 * u}px 0 ${P.ink}`, whiteSpace: 'nowrap' }}>
          dezaguila@proton.me
        </div>
      </div>
      <Confetti f={f} at={click} x={width / 2} y={height * v(0.6, 0.56)} count={80} power={1.35} u={u} />
      <div style={{ position: 'absolute', left: L.pad, right: L.pad, top: height * v(0.76, 0.7), textAlign: 'center' }}>
        <Reveal at={fb(C.tagline)}><div style={{ fontSize: v(46, 42) * u, fontWeight: 800 }}>Engineer-led. AI-assisted.</div></Reveal>
        <Reveal at={fb(C.tagline) + 6}><div style={{ fontSize: v(32, 30) * u, fontWeight: 600, color: 'rgba(23,20,31,.6)', marginTop: 10 * u }}>Dez Aguila · Senior software engineer</div></Reveal>
      </div>
      {ck > 0 && <div style={{ position: 'absolute', left: curX, top: curY, opacity: 1 - p(f, click + 14, click + 24) }}><Cursor size={110 * u} press={press} ring={p(f, click, click + 14, (x) => x)} /></div>}
    </>
  );
};

// ---------- composition ----------
export const Pop: React.FC = () => {
  useFonts(FONTS);
  const f = useCurrentFrame();
  const L = useLayout();
  const sc = TL.scenes;
  return (
    <AbsoluteFill style={{ background: P.cream, fontFamily: FONT, overflow: 'hidden' }}>
      <Scene f={f} start={sc.bug[0]} end={sc.bug[1]} bg={P.cream} color={P.ink} origin={[50, 50]}><BugScene f={f} L={L} /></Scene>
      <Scene f={f} start={sc.upgrade[0]} end={sc.upgrade[1]} bg={P.blue} color={P.white} origin={[50, 62]}><UpgradeScene f={f} L={L} /></Scene>
      <Scene f={f} start={sc.idea[0]} end={sc.idea[1]} bg={P.lemon} color={P.ink} origin={[85, 15]}><IdeaScene f={f} L={L} /></Scene>
      <Scene f={f} start={sc.meet[0]} end={sc.meet[1]} bg={P.coral} color={P.white} origin={[15, 85]}><MeetScene f={f} L={L} /></Scene>
      <Scene f={f} start={sc.how[0]} end={sc.how[1]} bg={P.lilac} color={P.ink} origin={[50, 50]}><HowScene f={f} L={L} /></Scene>
      <Scene f={f} start={sc.services[0]} end={sc.services[1]} bg={P.ink} color={P.white} origin={[85, 85]}><ServicesScene f={f} L={L} /></Scene>
      <Scene f={f} start={sc.weekend[0]} end={sc.weekend[1]} bg={P.mint} color={P.ink} origin={[15, 15]}><WeekendScene f={f} L={L} /></Scene>
      <Scene f={f} start={sc.cta[0]} end={sc.cta[1] + 1} bg={P.cream} color={P.ink} origin={[50, 50]}><CtaScene f={f} L={L} /></Scene>
      <Audio src={staticFile('music/pop.wav')} />
      <TextCheck />
    </AbsoluteFill>
  );
};
