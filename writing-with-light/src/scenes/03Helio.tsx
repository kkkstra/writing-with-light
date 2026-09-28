import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Canvas, fit, lerp, offscreen, prog, rng, TAU, useImages} from '../lib';
import {Callout, Caption, Scene} from '../ui';

const COLS = 170, ROWS = 118;
const R = fit(2597, 1805, 960, 490, 760, 540);

export const Helio: React.FC = () => {
  const f = useCurrentFrame();
  const imgs = useImages('legras');
  const pts = useMemo(() => {
    if (!imgs) return [];
    const data = offscreen(COLS, ROWS, (ctx) => ctx.drawImage(imgs.legras, 0, 0, COLS, ROWS)).getContext('2d')!.getImageData(0, 0, COLS, ROWS).data;
    const r = rng(31);
    return Array.from({length: COLS * ROWS}, (_, i) => {
      const a = r() * TAU, d = 300 + r() * 900;
      return {
        tx: R.x + ((i % COLS) + 0.5) * (R.w / COLS),
        ty: R.y + (Math.floor(i / COLS) + 0.5) * (R.h / ROWS),
        sx: 960 + Math.cos(a) * d, sy: 540 + Math.sin(a) * d * 0.6,
        l: data[i * 4] / 255, delay: r() * 22,
      };
    });
  }, [imgs]);

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!imgs) return;
    const settle = prog(f, 58, 95);
    const cell = R.w / COLS;
    for (const p of pts) {
      const t = prog(f, p.delay, p.delay + 38);
      const x = lerp(p.sx, p.tx, t), y = lerp(p.sy, p.ty, t);
      ctx.fillStyle = `rgba(${lerp(40, 236, p.l)},${lerp(30, 214, p.l)},${lerp(20, 178, p.l)},${(0.35 + 0.65 * t) * (1 - settle)})`;
      ctx.fillRect(x - cell / 2, y - cell / 2, cell * (1.6 - t * 0.6), cell * (1.6 - t * 0.6));
    }
    ctx.globalAlpha = settle;
    ctx.filter = 'sepia(0.5) contrast(0.92) brightness(0.9)';
    ctx.drawImage(imgs.legras, R.x, R.y, R.w, R.h);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;

    ctx.strokeStyle = `rgba(236,232,225,${0.35 * prog(f, 40, 80)})`;
    ctx.strokeRect(R.x - 14, R.y - 14, R.w + 28, R.h + 28);
  };

  return (
    <Scene>
      <AbsoluteFill style={{transform: `scale(${1 + 0.035 * prog(f, 60, 222, (t) => t)})`, transformOrigin: `${R.x + R.w / 2}px ${R.y + R.h / 2}px`}}>
        <Canvas draw={draw} />
        <Callout x={R.x + R.w * 0.88} y={R.y + R.h * 0.3} dx={150} dy={240} w={300} title="现存最早的相机照片" sub="NIÉPCE · c. 1827" delay={90} />
      </AbsoluteFill>
      <Caption label="HELIOGRAPHY · 日光刻印" zh="窗外的屋顶，在锡板上停留了至少八个小时。" en="Rooftops outside a window lingered on a pewter plate for at least eight hours." delay={40} />
    </Scene>
  );
};
