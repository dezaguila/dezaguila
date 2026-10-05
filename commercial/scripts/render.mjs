// Render commercials and encode web-ready files.
//   node scripts/render.mjs [Noir|Sage|Pop ...] [--vertical] [--publish]
// Default: all three, 16:9. --vertical also renders the 9:16 cuts.
// --publish copies the Noir web files (and a poster) into ../docs/media for the site.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const ids = args.filter((a) => !a.startsWith('--'));
const ALL = ['Noir', 'Sage', 'Pop'];
const pick = ids.length ? ids : ALL;
const run = (cmd, a) => execFileSync(cmd, a, { stdio: 'inherit' });
const slug = (id) => id.replace(/Vertical$/, '-vertical').toLowerCase();

fs.mkdirSync('out', { recursive: true });
for (const id of pick) {
  if (!ALL.includes(id)) throw new Error(`Unknown commercial "${id}" (expected ${ALL.join(', ')})`);
  run('node', [`music/${id.toLowerCase()}.mjs`]);
  for (const comp of flags.has('--vertical') ? [id, `${id}Vertical`] : [id]) {
    const raw = `out/${slug(comp)}-raw.mp4`, base = `out/${slug(comp)}`;
    run('npx', ['remotion', 'render', comp, raw, '--crf=18']);
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'libx264', '-crf', '25', '-preset', 'slow', '-profile:v', 'high', '-level:v', comp.endsWith('Vertical') ? '4.2' : '4.0',
      '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', `${base}.mp4`]);
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
      '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '128k', `${base}.webm`]);
    console.log(`done: ${base}.mp4 / .webm`);
  }
}

if (flags.has('--publish')) {
  for (const ext of ['mp4', 'webm']) fs.copyFileSync(`out/noir.${ext}`, `../docs/media/dez-commercial.${ext}`);
  run('npx', ['remotion', 'still', 'Noir', '../docs/media/dez-commercial-poster.jpg', '--frame=300', '--image-format=jpeg']);
  console.log('published Noir to ../docs/media');
}
