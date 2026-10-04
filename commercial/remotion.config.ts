import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');

// Optional: reuse an existing Chromium instead of downloading Remotion's own.
// Set REMOTION_BROWSER=/path/to/chrome, e.g. on machines without internet access.
const browser = process.env.REMOTION_BROWSER;
if (browser && fs.existsSync(browser)) Config.setBrowserExecutable(browser);
