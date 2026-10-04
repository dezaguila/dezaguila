# Dez: the 36-second intro

A product-style commercial for the portfolio, built in code with [Remotion](https://www.remotion.dev) (React for video), with an original soundtrack synthesised in code.

The commercial has its own look, deliberately separate from the site: cinematic black, bone white and signal yellow, set in Instrument Serif, Space Grotesk and JetBrains Mono. It reuses the site's *content*, not its components or styles.

| Composition | Size | Use |
|---|---|---|
| `DezCommercial` | 1920×1080, 30 fps, 36 s | Portfolio site, YouTube, LinkedIn |
| `DezCommercialVertical` | 1080×1920, 30 fps, 36 s | Reels, Shorts, TikTok |

## Structure

120 BPM, so 1 beat = 15 frames and 1 bar = 2 s. Every cut lands on a downbeat, and all cue points live in one place: `src/timeline.json`, read by both the video and the music.

| Time | Scene | Music | File |
|---|---|---|---|
| 0–8 s | "Sound familiar?" typed, then three problems land on hits | Pads, typing ticks, hits at 2/4/6 s, riser | `src/scenes/Problems.tsx` |
| 8–12 s | "Meet Dez." with sonar rings on each kick | Impact, beat drops in | `src/scenes/Meet.tsx` |
| 12–18 s | I plan → AI assists → I deliver; "AI is the tool. The judgment is mine." | Full groove | `src/scenes/How.tsx` |
| 18–24 s | Four services, one per three beats, with a morphing wireframe | Full groove | `src/scenes/Services.tsx` |
| 24–28 s | Count-up stats and a 2015 → 2020 → 2023 career track | Full groove | `src/scenes/Proof.tsx` |
| 28–32 s | Week row and a rising sun: "Weekends are for your project." | Breakdown, riser | `src/scenes/Weekend.tsx` |
| 32–36 s | "Let's build it." and the email address | Final impact, chord rings out | `src/scenes/End.tsx` |

Shared pieces: `src/brand.ts` (palette, type, timing) and `src/kit.tsx` (reveals, HUD, grain, font loading, QA check).

## Run it

Requires Node.js 18+ and ffmpeg (`sudo pacman -S nodejs npm ffmpeg` on Arch).

```bash
cd commercial
npm install
npm run studio            # compose the music, then open the live preview with a timeline
npm run render            # music → render → docs/media/dez-commercial.mp4 (H.264 + AAC) and .webm (VP9 + Opus)
npm run poster            # docs/media/dez-commercial-poster.jpg
npm run render:vertical   # out/dez-commercial-vertical.mp4 (not committed)
npm run check             # QA: flags any clipped or off-frame text, frame by frame
```

The first render downloads Remotion's headless Chrome. To use one you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`.

## Music

`music/compose.mjs` synthesises the whole track from scratch, with no samples and no dependencies: PolyBLEP saw pads, Karplus–Strong plucks, a synth bass with kick sidechain, drums, risers, impacts and a Freeverb-style reverb. It writes `public/music/theme.wav` (generated, not committed). Because it's original and generated, there are no licensing issues.

It's mastered to about −16 LUFS with a −1 dBFS peak. Change the arrangement in `compose.mjs` and the cue timings in `src/timeline.json`.

## Quality checks

- `npm run check` renders every frame in a QA mode that measures each visible line of text. It fails if any text is cut off by a parent box or runs off the frame. Text animations here never use masking (`overflow: hidden`), the technique that previously clipped descenders like the "g" in "bug". Use `FRAMES=300-360 npm run check` to check a range.
- The web encodes use H.264 High at level 4.0 with fast start, which matches the codec hint on the site's `<source>`, plus a VP9/Opus WebM for browsers without H.264.

## Notes

- **Fonts:** Instrument Serif, Space Grotesk and JetBrains Mono are bundled in `public/fonts` under the SIL Open Font License (licence texts alongside), so every render looks the same on any machine.
- **Remotion license:** free for individuals (this project), for-profit companies with up to 3 employees, and non-profits. Larger companies need a company license; see [remotion.dev/license](https://www.remotion.dev/license).
