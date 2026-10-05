// Render review stills: node scripts/stills.mjs <CompositionId> <frame,frame,...> [scale]
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [id = 'Noir', list = '0', scale = '0.5'] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const frame of list.split(',').map(Number)) {
  const output = path.resolve(`out/${id}-${String(frame).padStart(4, '0')}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: 'jpeg', scale: Number(scale), browserExecutable, overwrite: true });
  console.log(output);
}
