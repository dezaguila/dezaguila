// QA: renders every frame with inputProps.check and reports text that is clipped or off-frame.
// Usage: node scripts/check-text.mjs [CompositionId ...]   (FRAMES=300-320 to check a range)
import path from 'node:path';
import os from 'node:os';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['DezCommercial', 'DezCommercialVertical'];
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
let failed = false;
for (const id of ids) {
  const inputProps = { check: true };
  const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable });
  const problems = new Map();
  let checked = 0;
  const frameRange = process.env.FRAMES ? process.env.FRAMES.split('-').map(Number) : null;
  const expected = frameRange ? frameRange[1] - frameRange[0] + 1 : composition.durationInFrames;
  await renderMedia({
    serveUrl, composition, inputProps, browserExecutable, codec: 'h264', muted: true, scale: 0.25, frameRange,
    outputLocation: path.join(os.tmpdir(), `check-${id}.mp4`),
    onBrowserLog: (log) => {
      const m = /^TEXTCHECK (\d+) (.*)$/.exec(log.text);
      if (!m) return;
      checked++;
      for (const issue of JSON.parse(m[2])) {
        if (!problems.has(issue)) problems.set(issue, []);
        problems.get(issue).push(Number(m[1]));
      }
    },
  });
  console.log(`\n${id}: checked ${checked}/${expected} frames`);
  if (checked < expected) { console.log('  ! not every frame reported'); failed = true; }
  if (!problems.size) console.log('  ✓ no clipped or off-frame text');
  for (const [issue, frames] of problems) {
    failed = true;
    console.log(`  ✗ ${issue}\n    frames ${frames[0]}–${frames[frames.length - 1]} (${frames.length})`);
  }
}
process.exit(failed ? 1 : 0);
