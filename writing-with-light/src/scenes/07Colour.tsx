import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {Canvas, easeInOut, fit, lerp, offscreen, prog, useImages} from '../lib';
import {Callout, Caption, Scene} from '../ui';

const R = fit(1100, 900, 960, 455, 700, 575);
const OFFSETS = [-440, 0, 440];

export const Colour: React.FC = () => {
  const f = useCurrentFrame();
  const imgs = useImages('tartan');
  const plates = useMemo(() => {
    if (!imgs) return null;
    const src = offscreen(1100, 900, (ctx) => ctx.drawImage(imgs.tartan, 0, 0)).getContext('2d')!.getImageData(0, 0, 1100, 900);
    return [0, 1, 2].map((ch) => {
      const make = (tinted: boolean) => offscreen(1100, 900, (ctx) => {
        const out = ctx.createImageData(1100, 900);
        for (let i = 0; i < out.data.length; i += 4) {
          const v = src.data[i + ch];
          for (let k = 0; k < 3; k++) out.data[i + k] = tinted ? (k === ch ? v : 0) : v;
          out.data[i + 3] = 255;
        }
        ctx.putImageData(out, 0, 0);
      });
      return {gray: make(false), tint: make(true)};
    });
  }, [imgs]);

  const tint = prog(f, 22, 46);
  const merge = prog(f, 44, 96, easeInOut);
  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!plates) return;
    const s = lerp(0.52, 1, merge);
    const w = R.w * s, h = R.h * s;
    ctx.globalCompositeOperation = 'lighter';
    plates.forEach((p, i) => {
      const cx = 960 + OFFSETS[i] * (1 - merge), cy = R.y + R.h / 2 + (i - 1) * 18 * (1 - merge);
      ctx.globalAlpha = prog(f, i * 5, 18 + i * 5);
      ctx.drawImage(p.tint, cx - w / 2, cy - h / 2, w, h);
      ctx.globalAlpha *= 1 - tint;
      ctx.drawImage(p.gray, cx - w / 2, cy - h / 2, w, h);
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  };

  return (
    <Scene>
      <Canvas draw={draw} />
      <Callout x={R.x + R.w * 0.47} y={R.y + R.h * 0.72} dx={-400} dy={50} w={260} title="第一张彩色照片" sub="J. C. MAXWELL · 1861" delay={96} />
      <Caption at="br" label="COLOUR · 色彩" zh="红、绿、蓝叠在一起，世界第一次有了颜色。" en="Red, green and blue, laid together — and the world had colour." delay={30} />
    </Scene>
  );
};
