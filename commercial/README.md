# Dez: three short commercials

Three product-style commercials for the portfolio, built in code with [Remotion](https://www.remotion.dev) (React for video). Each has an original soundtrack synthesised in code. They share content (what Dez offers) but each has its own look, music and story, so there are real options to choose from.

| Commercial | Look | Music | Length |
|---|---|---|---|
| **Noir** | Cinematic black, bone white and signal yellow; Instrument Serif, Space Grotesk, JetBrains Mono | 120 BPM, dark synth pulse | 36 s |
| **Sage** | The site's Sage Mist colourway; Manrope. A camera glides across a bento board, building each tile | 100 BPM, D major, warm electric piano and marimba | 31.2 s |
| **Pop** | Playful but professional: bright flat colours, Bricolage Grotesque, cartoon characters and props | 128 BPM, C major, funk-pop with cartoon sound effects | 30 s |

Every commercial has two compositions: `<Id>` at 1920×1080 (site, YouTube, LinkedIn) and `<Id>Vertical` at 1080×1920 (Reels, Shorts, TikTok). The site currently embeds **Noir**.

## Layout

```
src/
  Root.tsx            registers all compositions
  shared/kit.tsx      timing helpers, reveals, grain, flash, font loading, text QA check
  noir/               brand.ts, timeline.json, Noir.tsx, scenes/*
  sage/               brand.ts (palette, board layout, camera), timeline.json, Sage.tsx
  pop/                brand.ts, timeline.json, props.tsx (characters and props), Pop.tsx
music/
  synth.mjs           the synthesiser: instruments, effects, reverb, mastering
  noir.mjs, sage.mjs, pop.mjs   one arrangement per commercial
scripts/
  render.mjs          render + web encodes (+ publish to the site)
  stills.mjs          render chosen frames as JPEGs
  check-text.mjs      QA: clipped or off-frame text
```

Each commercial keeps its cue points in its own `timeline.json`, read by **both** the video and its music script, so cuts and sound effects stay in sync.

### Noir (36 s, 120 BPM: 1 beat = 15 frames)

| Time | Scene |
|---|---|
| 0–8 s | "Sound familiar?" typed, then three problems land on hits |
| 8–12 s | "Meet Dez." with sonar rings on each kick |
| 12–18 s | I plan → AI assists → I deliver; "AI is the tool. The judgment is mine." |
| 18–24 s | Four services with a morphing wireframe |
| 24–28 s | Count-up stats and a career track |
| 28–32 s | Week row and a rising sun: "Weekends are for your project." |
| 32–36 s | "Let's build it." and the email address |

### Sage (31.2 s, 100 BPM: 1 beat = 18 frames)

A camera moves tile to tile across a bento board in the site's colours: hello → what I do → how I work → services → proof → weekends → overview of the whole board → contact. Tiles "pop" in on the beat; camera moves get a soft whoosh, and the overview gets a riser and sparkle.

### Pop (30 s, 128 BPM: 1 beat = 14.0625 frames)

Eight 4-second scenes joined by circle wipes:

| Scene | What happens |
|---|---|
| Got a bug? | A bug crawls in; a cursor squashes it; confetti |
| Stuck on an old version? | Old versions flip to Java 21, Spring Boot 3, modern runtime |
| Got a side project idea? | A bulb lights up; parts assemble: "From idea to shipped." |
| Meet Dez! | Bouncy title, a 10+ years badge, skill stickers |
| I make the calls. | Dez approves what the AI helper brings |
| I can help with | Services flip by, one per beat |
| Weekend mode | A toggle switches on; Saturday and Sunday get ticks |
| Let's build something great. | The email button gets clicked; confetti |

## Run it

Requires Node.js 18+ and ffmpeg (`sudo pacman -S nodejs npm ffmpeg` on Arch).

```bash
cd commercial
npm install
npm run studio              # compose all music, then open the live preview
npm run render              # all three, 16:9 → out/<id>.mp4 (H.264 + AAC) and .webm (VP9 + Opus)
npm run render -- Pop       # just one
npm run render:vertical     # also the 9:16 cuts → out/<id>-vertical.mp4/.webm
npm run publish             # render Noir and copy it + a poster into ../docs/media for the site
npm run check               # QA every composition; or: npm run check -- Pop PopVertical
npm run stills -- Sage 0,300,600 0.5   # render a few frames as JPEGs to out/
```

`out/` is not committed. To put a different commercial on the site, render it and copy `out/<id>.mp4` and `.webm` over `docs/media/dez-commercial.*`.

The first render downloads Remotion's headless Chrome. To use one you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`.

## Music

`music/synth.mjs` builds every sound from scratch, with no samples and no dependencies: PolyBLEP saw pads, Karplus–Strong plucks, FM electric piano, marimba, bells, funk bass, drums with kick sidechain, and cartoon effects (boing, pop, splat, whoosh, sparkle). A Freeverb-style reverb and soft limiter finish the mix. Each arrangement script writes `public/music/<id>.wav` (generated, not committed). Because the music is original and generated, there are no licensing issues.

Tracks are mastered to about −15 to −16 LUFS with a −1 dBFS peak.

## Quality checks

- `npm run check` renders every frame in a QA mode that measures each line of text. It flags text cut off by a parent box or lying off the frame. Animations never use masking (`overflow: hidden`), the technique that once clipped descenders. On a one-frame flag, check whether the text is mid-entrance (flying or slamming in from off-frame); that is intended. Use `FRAMES=300-360` to check a range.
- Web encodes use H.264 High at level 4.0 with fast start, matching the codec hint on the site's `<source>`, plus a VP9/Opus WebM.

## Notes

- **Fonts:** Instrument Serif, Space Grotesk, JetBrains Mono, Manrope and Bricolage Grotesque are bundled in `public/fonts` under the SIL Open Font License (licence texts alongside), so every render looks the same on any machine.
- **Remotion license:** free for individuals (this project), for-profit companies with up to 3 employees, and non-profits. Larger companies need a company license; see [remotion.dev/license](https://www.remotion.dev/license).
