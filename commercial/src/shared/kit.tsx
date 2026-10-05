import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill, cancelRender, continueRender, delayRender, Easing, getInputProps, interpolate,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
/** Shared animation kit used by every commercial. All compositions run at 30 fps. */
export const FPS = 30;

export const ease = Easing.bezier(0.16, 1, 0.3, 1);       // fast out, long settle
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const p = (f: number, a: number, b: number, e = ease) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const springAt = (f: number, at: number, damping = 16, stiffness = 140) =>
  spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 0.8 } });

/** Layout helper: `u` is 1 at 1920 px wide (16:9) and scaled for 9:16 so type stays legible. */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const u = vertical ? width / 1180 : width / 1920;
  const pad = vertical ? 80 * u : 130 * u;
  return { u, vertical, width, height, pad, v: <T,>(h: T, vv: T) => (vertical ? vv : h) };
};

/**
 * Reveal without clipping: fade + rise + de-blur. Never uses overflow:hidden, so descenders
 * (g, j, p, y) and italic overhangs can't be cut off.
 */
export const Reveal: React.FC<{ at: number; out?: number; dur?: number; dist?: number; children: React.ReactNode; style?: React.CSSProperties; block?: boolean }> = ({
  at, out, dur = 14, dist = 0.35, children, style, block = true,
}) => {
  const f = useCurrentFrame();
  const i = p(f, at, at + dur);
  const o = out === undefined ? 0 : p(f, out, out + 10, easeIn);
  const Tag = block ? 'div' : 'span';
  return (
    <Tag style={{
      display: block ? 'block' : 'inline-block',
      opacity: i * (1 - o),
      transform: `translateY(${(1 - i) * dist - o * dist * 0.6}em)`,
      filter: `blur(${(1 - i) * 10 + o * 8}px)`,
      ...style,
    }}>{children}</Tag>
  );
};

/** Word-by-word reveal. Words wrap naturally and are never masked. */
export const Words: React.FC<{ text: string; at: number; out?: number; stagger?: number; style?: React.CSSProperties; wordStyle?: (w: string, i: number) => React.CSSProperties | undefined }> = ({
  text, at, out, stagger = 3, style, wordStyle,
}) => {
  const words = text.split(' ');
  return (
    <div style={style}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <Reveal block={false} at={at + i * stagger} out={out === undefined ? undefined : out + i * 1.5} style={wordStyle?.(w, i)}>{w}</Reveal>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </div>
  );
};

/** Full-frame flash used on musical impacts. */
export const Flash: React.FC<{ at: number; color: string; len?: number }> = ({ at, color, len = 8 }) => {
  const f = useCurrentFrame();
  const o = f < at ? 0 : 1 - p(f, at, at + len, Easing.out(Easing.quad));
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o }} /> : null;
};

/** Film grain: deterministic, refreshed every other frame (cheaper to encode, more filmic). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity, mixBlendMode: 'screen' }}>
      <svg width="100%" height="100%">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 2) % 12} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

export type FontSpec = { family: string; file: string; descriptors?: FontFaceDescriptors };

/** Loads bundled fonts (from public/fonts) before the first frame renders. */
export const useFonts = (fonts: FontSpec[]) => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    const faces = fonts.map((ft) => new FontFace(ft.family, `url(${staticFile(`fonts/${ft.file}`)})`, ft.descriptors));
    Promise.all(faces.map((ff) => ff.load()))
      .then((loaded) => { loaded.forEach((ff) => document.fonts.add(ff)); continueRender(handle); })
      .catch((e) => cancelRender(e));
    // fonts is a static list per commercial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
};

/**
 * QA mode (inputProps.check = true): after each frame paints, measures every visible text run and
 * logs any that are cut off by an ancestor with overflow clipping or that fall outside the frame.
 * Elements marked data-check-region="idle" (e.g. tiles the camera isn't resting on) skip the frame check.
 */
export const TextCheck: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const on = Boolean((getInputProps() as { check?: boolean }).check);
  useEffect(() => {
    if (!on) return;
    const h = delayRender(`check ${f}`);
    let tries = 0;
    const measure = () => {
      // Wait until the page has its real size; a tab that is mid-resize would give bogus positions.
      if (document.documentElement.clientWidth < width * 0.99 && tries++ < 20) { requestAnimationFrame(measure); return; }
      const issues: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const margin = 4;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const txt = (n.textContent ?? '').trim();
        const el = n.parentElement;
        if (!txt || !el) continue;
        let op = 1;
        for (let a: HTMLElement | null = el; a; a = a.parentElement) op *= parseFloat(getComputedStyle(a).opacity || '1');
        if (op < 0.15) continue;
        const range = document.createRange(); range.selectNodeContents(n);
        for (const r of Array.from(range.getClientRects())) {
          if (r.width < 1 || r.height < 1) continue;
          // With a moving camera, only text in a region the camera is resting on must be fully in frame.
          const region = el.closest('[data-check-region]');
          const frameMatters = !region || region.getAttribute('data-check-region') === 'active';
          if (frameMatters && (r.left < -margin || r.top < -margin || r.right > width + margin || r.bottom > height + margin))
            issues.push(`OFF-FRAME "${txt.slice(0, 40)}" [${r.left | 0},${r.top | 0},${r.right | 0},${r.bottom | 0}]`);
          for (let a: HTMLElement | null = el; a; a = a.parentElement) { // include the text's own box
            const cs = getComputedStyle(a);
            if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
            const b = a.getBoundingClientRect();
            if (b.width >= width - 1 && b.height >= height - 1) continue; // full-frame scene containers
            if (r.top < b.top - 1 || r.bottom > b.bottom + 1 || r.left < b.left - 1 || r.right > b.right + 1)
              issues.push(`CLIPPED "${txt.slice(0, 40)}" by <${a.tagName.toLowerCase()} class="${a.className}">`);
          }
        }
      }
      console.log(`TEXTCHECK ${f} ${JSON.stringify(issues)}`);
      continueRender(h);
    };
    requestAnimationFrame(() => requestAnimationFrame(measure));
  }, [f, on, width, height]);
  return null;
};
