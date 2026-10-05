import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { camera, FONT, FONTS, LAYOUT, Rect, S, TileId, TL } from './brand';
import { ease, p, Reveal, springAt, TextCheck, useFonts, Words } from '../shared/kit';

const B = TL.builds;

// ---------- building blocks ----------

const Label: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = S.muted, style }) => (
  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, ...style }}>{children}</div>
);

const Tile: React.FC<{ id: TileId; rect: Rect; build: number; active: boolean; bg?: string; color?: string; border?: string; pad?: number; children: React.ReactNode }> = ({
  id, rect, build, active, bg = S.tile, color = S.ink, border = S.line, pad = 52, children,
}) => {
  const f = useCurrentFrame();
  const k = springAt(f, build, 15, 120);
  if (f < build) return null;
  return (
    <div data-check-region={active ? 'active' : 'idle'} data-tile={id} style={{
      position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h,
      borderRadius: 48, background: bg, color, border: `2px solid ${border}`, padding: pad, boxSizing: 'border-box',
      transform: `translateY(${(1 - k) * 60}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 1.4),
      boxShadow: `0 ${30 * k}px ${80 * k}px -40px rgba(29,42,36,.35)`,
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
    </div>
  );
};

/** Simple line icons drawn on as the tile builds. */
const Icon: React.FC<{ kind: 'cup' | 'bug' | 'up' | 'db'; at: number; color: string }> = ({ kind, at, color }) => {
  const f = useCurrentFrame();
  const k = p(f, at, at + 22);
  const d: Record<string, string> = {
    cup: 'M14 26 h30 v16 a12 12 0 0 1 -12 12 h-6 a12 12 0 0 1 -12 -12 Z M44 30 h4 a6 6 0 0 1 0 12 h-4 M22 10 q4 5 0 10 M32 10 q4 5 0 10',
    bug: 'M27 14 a13 13 0 1 1 0 26 a13 13 0 1 1 0 -26 Z M37 37 L52 52 M21 27 h12 M27 21 v12',
    up: 'M12 46 l20 10 l20 -10 M12 36 l20 10 l20 -10 M32 8 v26 M22 18 l10 -10 l10 10',
    db: 'M12 16 a20 7 0 1 0 40 0 a20 7 0 1 0 -40 0 Z M12 16 v32 a20 7 0 0 0 40 0 v-32 M12 32 a20 7 0 0 0 40 0',
  };
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" style={{ flex: 'none' }}>
      <path d={d[kind]} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
    </svg>
  );
};

const Count: React.FC<{ to: number; at: number; suffix: string; color: string }> = ({ to, at, suffix, color }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [at, at + 30], [0, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }));
  return <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05, color }}>{n}{suffix}</div>;
};

// ---------- tile contents ----------

const Hello: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%', background: 'rgba(255,255,255,.14)', transform: `rotate(${f * 0.8}deg)` }} />
      <Reveal at={B.A + 8}><Label color="rgba(245,243,234,.78)">Hello there</Label></Reveal>
      <div style={{ marginTop: 'auto' }}>
        <Reveal at={B.A + 14}><div style={{ fontSize: 150, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>I'm Dez.</div></Reveal>
        <Reveal at={B.A + 26}><div style={{ fontSize: 32, fontWeight: 700, marginTop: 22, lineHeight: 1.35 }}>David Son Aguila on paper...<br />Dez to clients and teammates.</div></Reveal>
        <Reveal at={B.A + 36}><div style={{ fontSize: 26, opacity: 0.8, marginTop: 14, lineHeight: 1.4 }}>Manila, PH · GMT+8</div></Reveal>
      </div>
    </>
  );
};

const Intro: React.FC = () => (
  <>
    <Reveal at={B.B + 10}><Label color={S.body}>Senior Software Engineer · Open to weekend projects</Label></Reveal>
    <Words
      text="Enterprise-grade software, engineer-led and AI-assisted."
      at={B.B + 16} stagger={3}
      style={{ fontSize: 92, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.06, marginTop: 26 }}
      wordStyle={(w) => (['engineer-led', 'AI-assisted.'].includes(w) ? { color: S.green } : undefined)}
    />
    <Reveal at={B.B + 44}><div style={{ fontSize: 30, color: S.body, marginTop: 28, lineHeight: 1.5, maxWidth: 980 }}>10+ years building business-critical Java systems at Accenture, IBM and Infor.</div></Reveal>
    <Reveal at={B.B + 54} style={{ marginTop: 'auto' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ background: S.green, color: '#fff', fontWeight: 700, fontSize: 28, padding: '20px 30px', borderRadius: 20 }}>Tell me about your project →</div>
        <div style={{ background: 'rgba(29,42,36,.08)', fontWeight: 700, fontSize: 28, padding: '20px 30px', borderRadius: 20 }}>See my work</div>
      </div>
    </Reveal>
  </>
);

const NODES = [
  { t: 'I plan', s: 'scope, design, decisions', human: true, at: TL.how.plan },
  { t: 'AI assists', s: 'research, boilerplate, tests', human: false, at: TL.how.assist },
  { t: 'I deliver', s: 'reviewed, tested, documented', human: true, at: TL.how.deliver },
];

const How: React.FC = () => {
  const f = useCurrentFrame();
  const active = f >= TL.how.line ? -1 : NODES.reduce((a, n, i) => (f >= n.at ? i : a), -1);
  return (
    <>
      <Reveal at={B.C + 10}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ background: S.gold, color: S.forest, fontSize: 18, fontWeight: 800, letterSpacing: '0.1em', padding: '6px 14px', borderRadius: 99 }}>MY EDGE</span>
          <Label color="rgba(245,243,234,.6)">How I work</Label>
        </div>
      </Reveal>
      <Reveal at={B.C + 16}><div style={{ fontSize: 84, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.06, marginTop: 28 }}>I do the engineering.<br />AI is one of my tools.</div></Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 14, alignItems: 'stretch', marginTop: 'auto' }}>
        {NODES.map((n, i) => {
          const on = active === i, done = f >= TL.how.line || (active > i);
          const bg = on ? (n.human ? S.gold : S.leaf) : 'rgba(255,255,255,.07)';
          return (
            <React.Fragment key={n.t}>
              <Reveal at={B.C + 24 + i * 4} style={{ display: 'flex' }}>
                <div style={{ flex: 1, minHeight: 150, borderRadius: 28, padding: '24px 26px', background: bg, color: on ? S.forest : S.cream, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 34, fontWeight: 800 }}>{done && !on ? '✓ ' : ''}{n.t}</div>
                  <div style={{ fontSize: 24, opacity: 0.85, marginTop: 6 }}>{n.s}</div>
                </div>
              </Reveal>
              {i < 2 && <div style={{ alignSelf: 'center', fontSize: 34, fontWeight: 800, color: 'rgba(245,243,234,.45)' }}>→</div>}
            </React.Fragment>
          );
        })}
      </div>
      <Reveal at={TL.how.line}><div style={{ fontSize: 34, fontWeight: 700, color: S.gold, marginTop: 28 }}>AI is my tool. The judgment is mine.</div></Reveal>
    </>
  );
};

const SERVICES = [
  { k: 'cup', t: 'Java & Spring builds', s: 'APIs, batch jobs, integrations.', at: B.D1 },
  { k: 'bug', t: 'Bug fixing & rescue', s: 'The issues nobody can reproduce.', at: B.D2 },
  { k: 'up', t: 'Upgrades & migrations', s: 'Moved forward without breakage.', at: B.D3 },
  { k: 'db', t: 'Databases & reports', s: 'SQL, reports, REST and SOAP.', at: B.D4 },
] as const;

const Services: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Reveal at={B.D + 8}><Label color={S.green}>What I can do for you</Label></Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 24, marginTop: 28, flex: 1 }}>
        {SERVICES.map((sv, i) => {
          const k = springAt(f, sv.at, 13, 140);
          const lead = i === 0;
          return (
            <div key={sv.t} style={{
              borderRadius: 32, padding: 30, background: lead ? S.soft : S.mist, border: `2px solid ${lead ? S.softLine : S.line}`,
              display: 'flex', flexDirection: 'column', gap: 16, opacity: f < sv.at ? 0 : Math.min(1, k * 1.5), transform: `scale(${0.85 + 0.15 * k})`,
            }}>
              <Icon kind={sv.k} at={sv.at + 4} color={S.green} />
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 'auto' }}>{sv.t}</div>
              <div style={{ fontSize: 25, color: S.body, lineHeight: 1.4 }}>{sv.s}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const Years: React.FC = () => (
  <>
    <Reveal at={B.E + 8}><Label>Experience</Label></Reveal>
    <div style={{ marginTop: 'auto' }}>
      <Count to={10} at={B.E + 10} suffix="+ yrs" color={S.green} />
      <Reveal at={B.E + 20}><div style={{ fontSize: 26, color: S.body, marginTop: 6 }}>across Accenture, IBM Consulting and Infor</div></Reveal>
    </div>
  </>
);

const Apps: React.FC = () => (
  <>
    <Reveal at={B.F + 8}><Label>Modernization at scale</Label></Reveal>
    <div style={{ marginTop: 'auto' }}>
      <Count to={10} at={B.F + 10} suffix="+ apps" color={S.copper} />
      <Reveal at={B.F + 20}><div style={{ fontSize: 26, color: S.body, marginTop: 6 }}>upgraded across different frameworks</div></Reveal>
    </div>
  </>
);

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const Availability: React.FC = () => {
  const f = useCurrentFrame();
  const lit = p(f, TL.lit, TL.lit + 12);
  const pulse = (f % 36) / 36;
  return (
    <>
      <Reveal at={B.G + 8}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: S.green, boxShadow: `0 0 0 ${pulse * 14}px rgba(47,107,79,${0.35 * (1 - pulse)})` }} />
          <Label>Availability</Label>
        </div>
      </Reveal>
      <Reveal at={B.G + 14}><div style={{ fontSize: 50, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 18 }}>Open to side projects</div></Reveal>
      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        {DAYS.map((d, i) => {
          const weekend = i >= 5;
          return (
            <Reveal key={d} at={B.G + 20 + i * 2} style={{ flex: 1 }}>
              <div style={{
                textAlign: 'center', fontSize: 20, fontWeight: 800, letterSpacing: '0.04em', padding: '16px 0', borderRadius: 16,
                background: weekend ? `rgba(47,107,79,${0.08 + lit * 0.92})` : S.mist, color: weekend && lit > 0.5 ? '#fff' : S.muted,
              }}>{d.toUpperCase()}</div>
            </Reveal>
          );
        })}
      </div>
      <Reveal at={TL.lit + 6}><div style={{ fontSize: 24, color: S.body, marginTop: 16 }}>Mainly on weekends.</div></Reveal>
    </>
  );
};

const Contact: React.FC = () => {
  const f = useCurrentFrame();
  const glow = TL.shots[TL.shots.length - 1].at;
  const g = p(f, glow, glow + 20);
  return (
    <>
      <Reveal at={B.H + 8}><Label>Say hello</Label></Reveal>
      <Reveal at={B.H + 14}><div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, marginTop: 16 }}>Have a side project in mind? Let's talk.</div></Reveal>
      <Reveal at={glow + 8}><div style={{ fontSize: 26, color: S.body, marginTop: 16 }}>Engineer-led. AI-assisted.</div></Reveal>
      <Reveal at={B.H + 24} style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: g > 0.5 ? S.green : S.tile, color: g > 0.5 ? '#fff' : S.ink, border: `2px solid ${S.line}`, borderRadius: 22, padding: '20px 24px', fontSize: 30, fontWeight: 800, boxShadow: `0 ${16 * g}px ${40 * g}px -16px rgba(47,107,79,.6)` }}>
          dezaguila@proton.me <span>↗</span>
        </div>
      </Reveal>
    </>
  );
};

// ---------- composition ----------

export const Sage: React.FC = () => {
  useFonts(FONTS);
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const L = LAYOUT[vertical ? 'v' : 'h'];
  const cam = camera(f, width, height, vertical);
  const isActive = (id: TileId) => cam.settled && (cam.focus.includes('*') || cam.focus.includes(id));
  const t = L.tiles;
  const end = p(f, TL.frames - 18, TL.frames);

  return (
    <AbsoluteFill style={{ background: S.mist, fontFamily: FONT, color: S.ink, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: L.w, height: L.h, transformOrigin: '0 0', transform: `translate(${width / 2}px, ${height / 2}px) scale(${cam.s}) translate(${-cam.cx}px, ${-cam.cy}px)` }}>
        {/* Dot grid backdrop that moves with the board */}
        <div style={{ position: 'absolute', left: -3000, top: -3000, width: L.w + 6000, height: L.h + 6000, backgroundImage: `radial-gradient(${S.softLine} 2.2px, transparent 2.6px)`, backgroundSize: '48px 48px', opacity: 0.55 }} />
        <Tile id="A" rect={t.A} build={B.A} active={isActive('A')} bg={S.me} color={S.cream} border="transparent"><Hello /></Tile>
        <Tile id="B" rect={t.B} build={B.B} active={isActive('B')} bg={S.hero} border="transparent"><Intro /></Tile>
        <Tile id="C" rect={t.C} build={B.C} active={isActive('C')} bg={S.forest} color={S.cream} border="transparent"><How /></Tile>
        <Tile id="D" rect={t.D} build={B.D} active={isActive('D')}><Services /></Tile>
        <Tile id="E" rect={t.E} build={B.E} active={isActive('E')}><Years /></Tile>
        <Tile id="F" rect={t.F} build={B.F} active={isActive('F')}><Apps /></Tile>
        <Tile id="G" rect={t.G} build={B.G} active={isActive('G')}><Availability /></Tile>
        <Tile id="H" rect={t.H} build={B.H} active={isActive('H')} bg={S.soft} border={S.softLine}><Contact /></Tile>
      </div>
      <AbsoluteFill style={{ background: S.mist, opacity: end, pointerEvents: 'none' }} />
      <Audio src={staticFile('music/sage.wav')} />
      <TextCheck />
    </AbsoluteFill>
  );
};

