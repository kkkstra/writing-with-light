import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {clamp} from './lib';
import {Pinhole} from './scenes/01Pinhole';
import {Silver} from './scenes/02Silver';
import {Helio} from './scenes/03Helio';
import {Dagu} from './scenes/04Dagu';
import {Lens} from './scenes/05Lens';
import {Negative} from './scenes/06Negative';
import {Colour} from './scenes/07Colour';
import {Motion} from './scenes/08Motion';
import {Everyone} from './scenes/09Everyone';
import {Pixel} from './scenes/10Pixel';
import {Light} from './scenes/11Light';
import {Card} from './scenes/12Card';
import {Outro} from './scenes/13Outro';
import {C} from './theme';
import {Chapter, CHAPTERS, sec, TOTAL, XFADE} from './timeline';
import {Counter, Grain, Letterbox} from './ui';

const SCENES: Record<Chapter, React.FC> = {
  pinhole: Pinhole, silver: Silver, helio: Helio, dagu: Dagu, lens: Lens, negative: Negative, colour: Colour,
  motion: Motion, everyone: Everyone, pixel: Pixel, light: Light, card: Card, outro: Outro,
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    {(Object.keys(SCENES) as Chapter[]).map((key) => {
      const [a, b] = CHAPTERS[key];
      const Comp = SCENES[key];
      return (
        <Sequence key={key} name={key} from={sec(a)} durationInFrames={sec(b - a) + XFADE}>
          <Comp />
        </Sequence>
      );
    })}
    <Counter />
    <Letterbox />
    <Grain />
    {/* 112.3 BPM, drop at 17.0 s: trimming 4.8 s puts the drop on 0:12.2 and a downbeat on the 63.5 s hard cut. */}
    <Audio src={staticFile('audio/bgm.m4a')} trimBefore={sec(4.8)} volume={(f) => 0.6 * interpolate(f, [0, sec(1.5), TOTAL - sec(5), TOTAL], [0, 1, 1, 0], clamp)} />
    <Sequence from={sec(CHAPTERS.everyone[0]) + 19} durationInFrames={sec(0.7)}>
      <Audio src={staticFile('audio/click.mp3')} volume={0.5} />
    </Sequence>
    <Sequence from={sec(CHAPTERS.motion[0])} durationInFrames={sec(5)}>
      <Audio src={staticFile('audio/projector.mp3')} volume={(f) => 0.8 * interpolate(f, [0, 20, 130, 150], [0, 1, 1, 0], clamp)} />
    </Sequence>
    {/* Two-stage shutter: opens with the light flash, closes on the hard cut to the card. */}
    <Sequence from={sec(CHAPTERS.card[0] - 0.55)} durationInFrames={sec(1.2)}>
      <Audio src={staticFile('audio/shutter.mp3')} volume={0.6} />
    </Sequence>
  </AbsoluteFill>
);
