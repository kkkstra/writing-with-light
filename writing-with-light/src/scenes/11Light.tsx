import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {aperturePoints, Canvas, easeInOut, lerp, prog, rng, TAU} from '../lib';
import {Caption, Scene} from '../ui';

const CX = 960, CY = 470;

export const Light: React.FC = () => {
  const f = useCurrentFrame();
  const pts = useMemo(() => {
    const r = rng(111);
    const icon = aperturePoints(190, 86, 2600, 113);
    return icon.map(([ix, iy], i) => ({sx: 20 + (i % 49) * 40 + (r() - 0.5) * 30, sy: 80 + Math.floor((i / 49) % 29) * 40 + (r() - 0.5) * 30, ix: CX + ix, iy: CY + iy, d: r() * 14, tw: r() * TAU}));
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    const glow = prog(f, 60, 100, (t) => t * t);
    const halo = ctx.createRadialGradient(CX, CY, 0, CX, CY, 420);
    halo.addColorStop(0, `rgba(255,236,210,${0.12 + 0.4 * glow})`);
    halo.addColorStop(1, 'rgba(255,236,210,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of pts) {
      const gather = prog(f, p.d, 44 + p.d, easeInOut);
      const form = prog(f, 36 + p.d, 78 + p.d, easeInOut);
      const a = (1 - gather) * 1.4;
      const rx = lerp(p.sx - CX, 0, gather), ry = lerp(p.sy - CY, 0, gather);
      const swirl = {x: CX + rx * Math.cos(a) - ry * Math.sin(a), y: CY + rx * Math.sin(a) + ry * Math.cos(a)};
      const x = lerp(swirl.x, p.ix, form), y = lerp(swirl.y, p.iy, form);
      ctx.fillStyle = `rgba(255,238,215,${0.45 + 0.35 * Math.sin(f * 0.2 + p.tw) ** 2})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + glow, 0, TAU);
      ctx.fill();
    }
  };

  return (
    <Scene>
      <Canvas draw={draw} />
      <Caption at="bc" label="KEEP THE LIGHT · 留住光" zh="从小孔到像素，我们始终在做同一件事：留住光。" en="From pinhole to pixel, we have always done one thing: keep the light." delay={4} />
      <AbsoluteFill style={{background: '#fff', opacity: prog(f, 90, 105, (t) => t * t)}} />
    </Scene>
  );
};
