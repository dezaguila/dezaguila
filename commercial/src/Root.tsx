import React from 'react';
import { Composition } from 'remotion';
import { Noir } from './noir/Noir';
import { TOTAL as NOIR_FRAMES } from './noir/brand';
import { Sage } from './sage/Sage';
import { TOTAL as SAGE_FRAMES } from './sage/brand';
import { Pop } from './pop/Pop';
import { TOTAL as POP_FRAMES } from './pop/brand';
import { FPS } from './shared/kit';

// Each commercial is registered twice: 16:9 (site, YouTube, LinkedIn) and 9:16 (Reels, Shorts, TikTok).
const COMMERCIALS = [
  { id: 'Noir', component: Noir, frames: NOIR_FRAMES },
  { id: 'Sage', component: Sage, frames: SAGE_FRAMES },
  { id: 'Pop', component: Pop, frames: POP_FRAMES },
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {COMMERCIALS.map((c) => (
      <React.Fragment key={c.id}>
        <Composition id={c.id} component={c.component} durationInFrames={c.frames} fps={FPS} width={1920} height={1080} defaultProps={{}} />
        <Composition id={`${c.id}Vertical`} component={c.component} durationInFrames={c.frames} fps={FPS} width={1080} height={1920} defaultProps={{}} />
      </React.Fragment>
    ))}
  </>
);
