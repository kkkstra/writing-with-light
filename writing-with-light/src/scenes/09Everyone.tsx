import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Canvas, horseFrame, lerp, makeThumbs, prog, rng, TAU, useImages} from '../lib';
import {C} from '../theme';
import {Callout, Caption, Scene} from '../ui';

const GENS = 6;
const RADII = [0, 170, 330, 500, 680, 880];

type Snap = {x: number; y: number; px: number; py: number; a: number; g: number; w: number; rot: number; t0: number; thumb: number};

export const Everyone: React.FC = () => {
  const f = useCurrentFrame();
  const imgs = useImages('legras', 'boulevard', 'lacock', 'tartan', 'horse');
  const thumbs = useMemo(() => (imgs ? makeThumbs(imgs, 48, 71) : []), [imgs]);
  const snaps = useMemo(() => {
    const r = rng(73);
    const list: Snap[] = [{x: 960, y: 470, px: 960, py: 470, a: 0, g: 0, w: 230, rot: 0, t0: 0, thumb: 0}];
    for (let i = 1; list.length < (3 ** GENS - 1) / 2; i++) {
      const parent = list[Math.floor((i - 1) / 3)], j = (i - 1) % 3, g = parent.g + 1;
      const a = g === 1 ? (j * TAU) / 3 - Math.PI / 2 + 0.3 : parent.a + (j - 1) * (2.1 / 3 ** (g - 1)) + (r() - 0.5) * 0.2;
      const rad = RADII[g] * (0.9 + r() * 0.2);
      list.push({x: 960 + Math.cos(a) * rad, y: 470 + Math.sin(a) * rad * 0.5, px: parent.x, py: parent.y, a, g, w: 120 * 0.8 ** g, rot: (r() - 0.5) * 0.2, t0: 26 + g * 13 + r() * 8, thumb: Math.floor(r() * 48)});
    }
    return list;
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!thumbs.length) return;
    const pos = (s: Snap) => {
      const p = prog(f, s.t0, s.t0 + 20);
      return {p, x: lerp(s.px, s.x, p), y: lerp(s.py, s.y, p)};
    };
    ctx.strokeStyle = 'rgba(236,232,225,0.14)';
    for (const s of snaps.slice(1)) {
      const {p, x, y} = pos(s);
      if (p <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    for (const s of [...snaps].reverse()) {
      const {p, x, y} = pos(s);
      if (p <= 0 && s.g) continue;
      const w = s.g ? s.w * lerp(0.4, 1, p) : lerp(230, 190, prog(f, 20, 40)), h = w * 0.8;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = s.g ? Math.min(1, p * 1.5) * (1 - s.g * 0.08) : 1;
      ctx.fillStyle = '#efe9dd';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      if (s.g) ctx.drawImage(thumbs[s.thumb], -w / 2 + w * 0.06, -h / 2 + w * 0.06, w * 0.88, h - w * 0.2);
      else ctx.drawImage(imgs!.horse, ...horseFrame(1), -w / 2 + w * 0.06, -h / 2 + w * 0.06, w * 0.88, h - w * 0.2);
      ctx.restore();
    }
  };

  return (
    <Scene>
      <Canvas draw={draw} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 300px 90px at 1370px 272px, rgba(10,9,8,0.85), rgba(10,9,8,0)), linear-gradient(to top, ${C.ink} 22%, rgba(10,9,8,0.6) 38%, rgba(10,9,8,0) 55%)`}} />
      <AbsoluteFill style={{background: '#fff', opacity: 0.5 * Math.max(0, 1 - Math.abs(f - 22) / 6)}} />
      <Callout x={960 + 95} y={470 - 76} dx={150} dy={-120} w={320} title="KODAK Nº 1 · 1888" sub="100 EXPOSURES · $25 · 一百张胶卷" delay={34} />
      <Caption label="EVERYONE · 人人" zh="“你只管按下快门，剩下的交给我们。”" en="“You press the button, we do the rest.”" delay={36} />
    </Scene>
  );
};
