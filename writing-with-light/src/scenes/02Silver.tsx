import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Canvas, clamp, DPR, lerp, offscreen, pagoda, prog, rng, TAU} from '../lib';
import {C} from '../theme';
import {Callout, Caption, Scene} from '../ui';

const STEP = 12;
const CX = 640, TOP = 160, SHAPE_H = 700;

// The pinhole image from chapter 1 (inverted pagoda) falling on a lattice of silver-salt grains.
const inverted = (ctx: CanvasRenderingContext2D) => {
  ctx.translate(CX, TOP);
  ctx.scale(SHAPE_H, -SHAPE_H);
  ctx.fill(pagoda().path);
};

export const Silver: React.FC = () => {
  const f = useCurrentFrame();
  const {grains, photons} = useMemo(() => {
    const mask = offscreen(1920, 1080, (ctx) => {
      ctx.filter = 'blur(3px)';
      ctx.fillStyle = '#fff';
      inverted(ctx);
    }).getContext('2d')!.getImageData(0, 0, 1920, 1080).data;
    const r = rng(23);
    const grains: {x: number; y: number; lit: number; delay: number; s: number}[] = [];
    for (let row = 0; row * STEP * 0.866 < 1080; row++) {
      for (let col = 0; col * STEP < 1930; col++) {
        const x = col * STEP + (row % 2) * (STEP / 2) + (r() - 0.5) * 2;
        const y = row * STEP * 0.866 + (r() - 0.5) * 2;
        const lit = mask[(Math.min(1079, Math.round(y)) * 1920 + Math.min(1919, Math.round(x))) * 4] / 255;
        grains.push({x, y, lit, delay: r() * 50, s: STEP * (0.3 + r() * 0.12)});
      }
    }
    const lit = grains.filter((g) => g.lit > 0.6);
    const photons = Array.from({length: 120}, () => ({g: lit[Math.floor(r() * lit.length)], t0: 10 + r() * 90}));
    return {grains, photons};
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    for (const g of grains) {
      const e = g.lit * prog(f, 18 + g.delay, 44 + g.delay);
      const flash = e > 0 && e < 0.45 ? Math.sin((Math.PI * e) / 0.45) : 0;
      const tone = lerp(200, 16, e) + flash * 55;
      ctx.fillStyle = `rgba(${tone},${tone + 3},${tone + 8},${lerp(0.5, 0.95, e)})`;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k * TAU) / 6 + 0.5;
        ctx.lineTo(g.x + Math.cos(a) * g.s, g.y + Math.sin(a) * g.s);
      }
      ctx.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = `blur(${28 * DPR}px)`;
    ctx.fillStyle = `rgba(240,200,150,${0.2 * prog(f, 5, 40) * (1 - prog(f, 90, 140))})`;
    inverted(ctx);
    ctx.restore();
    ctx.lineCap = 'round';
    for (const p of photons) {
      const q = prog(f, p.t0, p.t0 + 10, (t) => t);
      if (q <= 0 || q >= 1) continue;
      const len = 70 * (1 - q) + 6;
      ctx.strokeStyle = `rgba(255,236,200,${0.85 * (1 - q)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(p.g.x - 0.6 * len, p.g.y - 0.8 * len);
      ctx.lineTo(p.g.x - 0.6 * 6 * (1 - q), p.g.y - 0.8 * 6 * (1 - q));
      ctx.stroke();
    }
  };

  const zoom = interpolate(f, [0, 100], [2.4, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 3});
  return (
    <Scene>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${CX}px 540px`}}>
        <Canvas draw={draw} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 95% at ${CX}px 45%, rgba(10,9,8,0) 25%, ${C.ink} 100%), linear-gradient(to top, ${C.ink} 10%, rgba(10,9,8,0) 36%)`}} />
      <Callout x={CX + 0.05 * SHAPE_H} y={TOP + 0.52 * SHAPE_H} dx={260} dy={-190} w={320} title="J. H. SCHULZE · c. 1717" delay={70} />
      <Caption at="br" label="SILVER · 银盐" zh="影像总会消散——直到人们发现，银会被光染黑。" en="The image always faded — until we found that silver darkens in light." delay={18} />
    </Scene>
  );
};
