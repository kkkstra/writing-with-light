import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Canvas, clamp, easeInOut, lerp, pagoda, prog, rng, TAU} from '../lib';
import {C, F} from '../theme';
import {Callout, Caption, Scene} from '../ui';

const WALL = 860, HOLE = 470, SCREEN = 1440, OBJ_X = 420, BASE = 690, OBJ_H = 440;
const K = (SCREEN - WALL) / (WALL - OBJ_X);
const IMG_BASE = HOLE + (HOLE - BASE) * K;
const IMG_TOP = HOLE + (HOLE - (BASE - OBJ_H)) * K;

export const Pinhole: React.FC = () => {
  const f = useCurrentFrame();
  const dust = useMemo(() => {
    const r = rng(11);
    return Array.from({length: 700}, () => ({u: r(), v: r() * 2 - 1, ph: r() * TAU, sp: 0.3 + r(), s: 0.6 + r() * 1.4}));
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    const {path, levels} = pagoda();
    const beam = prog(f, 15, 70);
    const glow = ctx.createRadialGradient(OBJ_X, 480, 0, OBJ_X, 480, 520);
    glow.addColorStop(0, 'rgba(232,196,150,0.10)');
    glow.addColorStop(1, 'rgba(232,196,150,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WALL, 1080);

    ctx.strokeStyle = 'rgba(236,232,225,0.22)';
    ctx.beginPath();
    ctx.moveTo(160, BASE + 1);
    ctx.lineTo(WALL - 60, BASE + 1);
    ctx.stroke();

    const shape = (x: number, baseY: number, h: number, flip: number, fill: string, blur: number) => {
      ctx.save();
      ctx.filter = blur ? `blur(${blur}px)` : 'none';
      ctx.translate(x, baseY);
      ctx.scale(h, h * flip);
      ctx.fillStyle = fill;
      ctx.fill(path);
      ctx.restore();
    };
    shape(OBJ_X, BASE, OBJ_H, 1, `rgba(236,214,180,${0.9 * prog(f, 0, 20)})`, 0);

    // Beam cones on both sides of the pinhole, then the fan of rays from the object's axis.
    const cone = (ax: number, ay1: number, ay2: number, alpha: number) => {
      const g = ctx.createLinearGradient(WALL, 0, ax, 0);
      g.addColorStop(0, `rgba(240,215,175,${alpha})`);
      g.addColorStop(1, `rgba(240,215,175,${alpha * 0.25})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(WALL, HOLE);
      ctx.lineTo(ax, ay1);
      ctx.lineTo(ax, ay2);
      ctx.closePath();
      ctx.fill();
    };
    cone(OBJ_X, BASE - OBJ_H, BASE, 0.05 * beam);
    cone(SCREEN, IMG_BASE, IMG_TOP, 0.09 * beam);

    levels.forEach((lv, i) => {
      const py = BASE + lv * OBJ_H;
      const iy = HOLE + (HOLE - py) * K;
      const p = prog(f, 12 + i * 3, 62 + i * 3, easeInOut);
      const a = Math.min(1, p * 1.6), b = Math.max(0, p * 1.6 - 0.6) / 1;
      ctx.strokeStyle = 'rgba(245,225,190,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(OBJ_X, py);
      ctx.lineTo(lerp(OBJ_X, WALL, a), lerp(py, HOLE, a));
      if (b > 0) ctx.lineTo(lerp(WALL, SCREEN, b), lerp(HOLE, iy, b));
      ctx.stroke();
      if (p >= 1) {
        const q = ((f * 0.012 + i * 0.13) % 1) * 2;
        const [x, y] = q < 1 ? [lerp(OBJ_X, WALL, q), lerp(py, HOLE, q)] : [lerp(WALL, SCREEN, q - 1), lerp(HOLE, iy, q - 1)];
        ctx.fillStyle = 'rgba(255,240,215,0.9)';
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, TAU);
        ctx.fill();
      }
    });

    for (const d of dust) {
      const x = lerp(WALL, SCREEN, d.u) + Math.sin(f * 0.02 * d.sp + d.ph) * 6;
      const spread = ((IMG_TOP - IMG_BASE) / 2) * d.u;
      const y = HOLE + d.v * spread + Math.cos(f * 0.017 * d.sp + d.ph) * 5;
      ctx.fillStyle = `rgba(255,236,205,${beam * (0.25 + 0.35 * Math.sin(f * 0.08 * d.sp + d.ph) ** 2)})`;
      ctx.fillRect(x, y, d.s, d.s);
    }

    shape(SCREEN, IMG_BASE, OBJ_H * K, -1, `rgba(236,205,160,${0.38 * prog(f, 45, 100)})`, lerp(10, 2.5, prog(f, 45, 110)));

    ctx.fillStyle = '#17140f';
    ctx.strokeStyle = 'rgba(236,232,225,0.35)';
    for (const [y1, y2] of [[150, HOLE - 5], [HOLE + 5, 930]]) {
      ctx.fillRect(WALL - 10, y1, 20, y2 - y1);
      ctx.strokeRect(WALL - 10, y1, 20, y2 - y1);
    }
    ctx.strokeStyle = 'rgba(236,232,225,0.18)';
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(SCREEN, 170);
    ctx.lineTo(SCREEN, 910);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = `300 14px ${F.mono}`;
    ctx.fillStyle = `rgba(236,232,225,${0.5 * prog(f, 60, 80)})`;
    ctx.textAlign = 'center';
    ctx.fillText('OBJECT · 物', OBJ_X, BASE + 36);
    ctx.fillText('IMAGE · 像', SCREEN, IMG_TOP + 40);
  };

  // Ends where chapter 2 opens: the inverted image centred at x = 640, 1680 px tall.
  const push = interpolate(f, [0, 150, 192], [1, 1.05, 1680 / (IMG_TOP - IMG_BASE)], {...clamp, easing: (t) => t * t});
  return (
    <Scene fade={0}>
      <AbsoluteFill style={{transform: `translateX(${(640 - SCREEN) * prog(f, 150, 192, (t) => t * t)}px) scale(${push})`, transformOrigin: `${SCREEN}px ${(IMG_BASE + IMG_TOP) / 2}px`}}>
        <Canvas draw={draw} />
        <Callout x={WALL} y={HOLE} dx={110} dy={-250} w={320} title="MOZI · 墨子 · c. 400 BCE" sub="景到，在午有端 ——《墨经》" delay={55} />
      </AbsoluteFill>
      <Caption label="CAMERA OBSCURA · 小孔成像" zh="两千四百年前，墨子看见小孔把世界倒映在墙上。" en="Twenty-four centuries ago, Mozi saw a pinhole cast the world upside down." delay={20} />
      <AbsoluteFill style={{background: C.ink, opacity: prog(f, 175, 192, (t) => t)}} />
    </Scene>
  );
};
