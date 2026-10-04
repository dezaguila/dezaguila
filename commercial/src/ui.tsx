import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from './theme';

/** Scale unit: 1 at 1080px on the short side, so layouts work in 16:9 and 9:16. */
export const useUnit = () => {
  const { width, height } = useVideoConfig();
  return { u: Math.min(width, height) / 1080, vertical: height > width, width, height };
};

export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

/** 0→1 between two frames, eased and clamped. */
export const prog = (frame: number, start: number, end: number, e = ease) =>
  interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });

export const pop = (frame: number, fps: number, delay = 0, damping = 14) =>
  spring({ frame: frame - delay, fps, config: { damping, mass: 0.7, stiffness: 120 } });

/** Fades a scene in; scenes overlap, so the incoming one covers the outgoing one. */
export const Scene: React.FC<{ dur: number; bg: string; children: React.ReactNode; fadeIn?: number; fadeOut?: number }> = ({
  dur, bg, children, fadeIn = 12, fadeOut = 0,
}) => {
  const f = useCurrentFrame();
  const o = Math.min(prog(f, 0, fadeIn), fadeOut ? 1 - prog(f, dur - fadeOut, dur) : 1);
  return (
    <AbsoluteFill style={{ background: bg, fontFamily: FONT, color: C.ink, opacity: o, overflow: 'hidden' }}>
      {children}
    </AbsoluteFill>
  );
};

/** Text that slides up from behind a mask. */
export const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number }> = ({
  at, children, style, dist = 110,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 18);
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.08em', ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * dist}%)`, opacity: p }}>{children}</div>
    </div>
  );
};

/** Slowly drifting soft circles in the background. */
export const Ambient: React.FC<{ color: string; opacity?: number }> = ({ color, opacity = 0.18 }) => {
  const f = useCurrentFrame();
  const { u, width, height } = useUnit();
  const blobs = [
    { x: 0.82, y: 0.18, r: 420, s: 0.004, ph: 0 },
    { x: 0.12, y: 0.85, r: 360, s: 0.005, ph: 2 },
    { x: 0.55, y: 0.6, r: 220, s: 0.006, ph: 4 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x * width + Math.sin(f * b.s * 6 + b.ph) * 40 * u - b.r * u,
            top: b.y * height + Math.cos(f * b.s * 5 + b.ph) * 30 * u - b.r * u,
            width: b.r * 2 * u,
            height: b.r * 2 * u,
            borderRadius: '50%',
            border: `${70 * u}px solid ${color}`,
            opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const Tile: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { u } = useUnit();
  return (
    <div style={{ background: C.tile, borderRadius: 32 * u, border: `${2 * u}px solid ${C.line}`, padding: 36 * u, boxShadow: `0 ${24 * u}px ${60 * u}px -${30 * u}px rgba(29,42,36,.35)`, ...style }}>
      {children}
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.muted }) => {
  const { u } = useUnit();
  return <div style={{ fontSize: 22 * u, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color }}>{children}</div>;
};
