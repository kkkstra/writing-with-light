import React from 'react';
import {Composition} from 'remotion';
import './theme';
import {FPS, H, TOTAL, W} from './timeline';
import {Video} from './Video';

export const Root: React.FC = () => <Composition id="Main" component={Video} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />;
