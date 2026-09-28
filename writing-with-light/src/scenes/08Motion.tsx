import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Canvas, horseFrame, prog, useImages} from '../lib';
import {C} from '../theme';
import {Callout, Caption, Scene} from '../ui';

const VIEW = {x: 960 - 280, y: 360 - 180, w: 560, h: 360};
const FW = 190, FH = 122, FG = 16, STRIP_Y = 660;
const HOOVES = 1; // frame "2" on the card: all four hooves off the ground

// Playhead in frames of the gallop: plays at 10 fps, then eases to a stop on the airborne frame.
const playhead = (f: number) => (f < 84 ? f / 3 : 28 + 6 * prog(f, 84, 112));

export const Motion: React.FC = () => {
  const f = useCurrentFrame();
  const imgs = useImages('horse');
  const p = playhead(f);
  const cur = Math.round(p) % 11;

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!imgs) return;
    ctx.filter = 'sepia(0.35) contrast(1.05)';
    ctx.drawImage(imgs.horse, ...horseFrame(cur), VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    ctx.filter = 'none';
    ctx.strokeStyle = 'rgba(236,232,225,0.35)';
    ctx.strokeRect(VIEW.x - 12, VIEW.y - 12, VIEW.w + 24, VIEW.h + 24);

    const strip = prog(f, 0, 24);
    ctx.globalAlpha = strip;
    ctx.fillStyle = '#131210';
    ctx.fillRect(0, STRIP_Y - FH / 2 - 30, 1920, FH + 60);
    const step = FW + FG;
    const shift = (p % 11) * step;
    for (let k = -8; k <= 8; k++) {
      const idx = (((Math.floor(p) + k) % 11) + 11) % 11;
      const x = 960 + (k - (p - Math.floor(p))) * step - FW / 2;
      ctx.filter = `sepia(0.35) brightness(${idx === cur ? 1 : 0.55})`;
      ctx.drawImage(imgs.horse, ...horseFrame(idx), x, STRIP_Y - FH / 2, FW, FH);
    }
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(236,232,225,0.14)';
    for (let x = -((shift * 1) % 40); x < 1920; x += 40) {
      ctx.beginPath();
      ctx.roundRect(x, STRIP_Y - FH / 2 - 22, 18, 12, 3);
      ctx.roundRect(x, STRIP_Y + FH / 2 + 10, 18, 12, 3);
      ctx.fill();
    }
    ctx.strokeStyle = cur === HOOVES && f > 100 ? C.red : 'rgba(236,232,225,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(960 - FW / 2 - 4, STRIP_Y - FH / 2 - 4, FW + 8, FH + 8);
    ctx.globalAlpha = 1;
  };

  return (
    <Scene>
      <Canvas draw={draw} />
      <Callout x={VIEW.x} y={VIEW.y + VIEW.h * 0.3} dx={-120} dy={-50} w={300} title="THE HORSE IN MOTION" sub="MUYBRIDGE · PALO ALTO · 1878" delay={20} />
      <Callout x={VIEW.x + VIEW.w * 0.46} y={VIEW.y + VIEW.h * 0.7} dx={420} dy={20} w={260} title="四蹄腾空" sub="ALL FOUR HOOVES OFF THE GROUND" delay={108} />
      <Caption label="MOTION · 瞬间" zh="快门，终于快过了奔马。" en="At last, the shutter outran the galloping horse." delay={30} />
    </Scene>
  );
};
