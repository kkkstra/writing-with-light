import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {easeInOut, fit, lerp, prog, rng} from '../lib';
import {C, F} from '../theme';
import {Callout, Caption, Scene} from '../ui';

const BIG = fit(489, 638, 960, 450, 440, 580);
const COLS = 11, ROWS = 3, CW = 150, CH = CW * (638 / 489), GAP = 22;
const MID = (COLS * ROWS - 1) / 2;
const r = rng(61);
const SLOTS = Array.from({length: COLS * ROWS}, (_, i) => ({
  x: 960 + ((i % COLS) - (COLS - 1) / 2) * (CW + GAP),
  y: 452 + (Math.floor(i / COLS) - 1) * (CH + GAP),
  delay: r() * 22,
  tone: 0.75 + r() * 0.25,
}));

const Print: React.FC<{x: number; y: number; w: number; h: number; style?: React.CSSProperties; negative?: boolean}> = ({x, y, w, h, style, negative}) => (
  <Img src={staticFile('img/lacock.jpg')} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, filter: negative ? 'invert(1) sepia(0.3)' : 'sepia(0.45)', boxShadow: '0 0 0 1px rgba(236,232,225,0.25)', ...style}} />
);

export const Negative: React.FC = () => {
  const f = useCurrentFrame();
  const flip = prog(f, 36, 66, easeInOut) * 180;
  const spread = prog(f, 84, 128, easeInOut);
  const callouts = 1 - prog(f, 80, 92);
  const w = lerp(BIG.w, CW, spread), h = lerp(BIG.h, CH, spread);
  return (
    <Scene>
      {SLOTS.map((s, i) => {
        const p = prog(f, 90 + s.delay, 124 + s.delay, easeInOut);
        return p > 0 && i !== MID && <Print key={i} x={lerp(960, s.x, p)} y={lerp(450, s.y, p)} w={CW} h={CH} style={{opacity: p * s.tone}} />;
      })}
      <div style={{position: 'absolute', left: 0, top: 0, perspective: 1600, width: 1920, height: 1080}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${flip}deg)`, transformOrigin: '960px 450px'}}>
          <Print negative x={960} y={lerp(450, SLOTS[MID].y, spread)} w={w} h={h} style={{backfaceVisibility: 'hidden'}} />
          <Print x={960} y={lerp(450, SLOTS[MID].y, spread)} w={w} h={h} style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}} />
        </div>
      </div>
      <AbsoluteFill style={{opacity: callouts}}>
        <Callout x={BIG.x + BIG.w * 0.3} y={BIG.y + BIG.h * 0.33} dx={-150} dy={-90} w={360} title="LATTICED WINDOW · 1835" sub="LACOCK ABBEY · W. H. F. TALBOT" delay={16} />
        <Callout x={BIG.x + BIG.w * 0.78} y={BIG.y + BIG.h * 0.62} dx={150} dy={110} w={340} title="现存最早的相机底片" sub="OLDEST SURVIVING CAMERA NEGATIVE" delay={40} />
        <div style={{position: 'absolute', left: 1360, top: 300, width: 400, color: C.text, opacity: prog(f, 50, 70)}}>
          <div style={{font: `italic 400 24px/1.45 ${F.serif}`, opacity: 0.85}}>“When first made, the squares of glass about 200 in number could be counted, with help of a lens.”</div>
          <div style={{font: `300 14px ${F.mono}`, letterSpacing: '0.2em', opacity: 0.55, marginTop: 14}}>— TALBOT’S NOTE · AUG 1835</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: 1 - prog(f, 0, 18, (x) => x)}} />
      <Caption label="NEGATIVE · 负片" zh="一张底片，从此可以印出无数张照片。" en="From one negative, countless prints." delay={24} />
    </Scene>
  );
};
