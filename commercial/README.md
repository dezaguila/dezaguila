# Dez in 30 seconds

A 30-second, product-style commercial for the portfolio, built in code with [Remotion](https://www.remotion.dev) (React for video). It uses the portfolio's Sage Mist palette and only the generic content from the site.

| Composition | Size | Use |
|---|---|---|
| `DezCommercial` | 1920×1080, 30 fps | Portfolio site, YouTube, LinkedIn |
| `DezCommercialVertical` | 1080×1920, 30 fps | Reels, Shorts, TikTok |

## Scenes

| Time | Scene | File |
|---|---|---|
| 0–3.7 s | Hook: three common problems, struck through | `src/scenes/Hook.tsx` |
| 3.7–7 s | "I'm Dez." intro card | `src/scenes/Intro.tsx` |
| 7–13 s | Engineer-led, AI-assisted: plan → AI assists → deliver, with a code editor | `src/scenes/Work.tsx` |
| 13–18.7 s | Services grid | `src/scenes/Services.tsx` |
| 18.7–22.7 s | Track record counters | `src/scenes/Proof.tsx` |
| 22.7–26 s | Weekend availability | `src/scenes/Weekend.tsx` |
| 26–30 s | Call to action with email | `src/scenes/Cta.tsx` |

Timings live in `src/theme.ts`. Scenes overlap by 12 frames so each one crossfades into the next.

## Run it

Requires Node.js 18+ and ffmpeg (`sudo pacman -S nodejs npm ffmpeg` on Arch).

```bash
cd commercial
npm install
npm run studio            # live preview with a timeline in the browser
npm run render            # renders, then writes docs/media/dez-commercial.mp4 and .webm
npm run poster            # writes docs/media/dez-commercial-poster.jpg
npm run render:vertical   # writes out/dez-commercial-vertical.mp4 (not committed)
```

The first render downloads Remotion's headless Chrome. To use one you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`.

The `finish` step re-encodes the raw render for the web: H.264 `yuv420p` with fast start (plays everywhere and streams immediately), plus a VP9 WebM for browsers without H.264.

## Notes

- **Font:** Manrope is bundled in `public/fonts` under the SIL Open Font License (`public/fonts/OFL.txt`), so every render looks the same on any machine.
- **No audio:** the video is silent, which suits muted autoplay on the site. Add a licensed track with Remotion's `<Audio>` component if you want sound.
- **Remotion license:** free for individuals (this project), for-profit companies with up to 3 employees, and non-profits. Larger companies need a company license; see [remotion.dev/license](https://www.remotion.dev/license).
