import React from 'react';
import { Composition } from 'remotion';
import { Commercial } from './Commercial';
import { FPS, TOTAL } from './brand';

export const RemotionRoot: React.FC = () => (
  <>
    {/* 16:9 for the portfolio site, YouTube and LinkedIn */}
    <Composition id="DezCommercial" component={Commercial} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{}} />
    {/* 9:16 for Reels, Shorts and TikTok */}
    <Composition id="DezCommercialVertical" component={Commercial} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{}} />
  </>
);
