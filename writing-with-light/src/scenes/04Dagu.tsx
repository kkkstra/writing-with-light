import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Canvas, fit, lerp, prog, rng, TAU, useImages} from '../lib';
import {Callout, Caption, Scene} from '../ui';

const R = fit(3441, 2472, 960, 490, 760, 540);
// The boulevard, receding from the lower left towards the vanishing point (normalised image coords, street half-width).
const STREET: [number, number, number][] = [[0.0, 0.88, 0.075], [0.16, 0.68, 0.05], [0.3, 0.54, 0.03], [0.45, 0.42, 0.012]];
const MAN = {x: R.x + 0.212 * R.w, y: R.y + 0.772 * R.h};

const along = (s: number, lat: number) => {
  const seg = Math.min(STREET.length - 2, Math.floor(s * (STREET.length - 1)));
  const t = s * (STREET.length - 1) - seg;
  const [x1, y1, w1] = STREET[seg], [x2, y2, w2] = STREET[seg + 1];
  const w = lerp(w1, w2, t);
  return {x: R.x + (lerp(x1, x2, t) + lat * w * 0.7) * R.w, y: R.y + (lerp(y1, y2, t) + lat * w * 0.7) * R.h, scale: w / 0.075};
};

export const Dagu: React.FC = () => {
  const f = useCurrentFrame();
  const imgs = useImages('boulevard');
  const traffic = useMemo(() => {
    const r = rng(41);
    return Array.from({length: 190}, (_, i) => ({s0: r(), v: (0.0025 + r() * 0.004) * (r() < 0.5 ? 1 : -1), lat: r() * 2 - 1, cart: i % 4 === 0}));
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!imgs) return;
    const dev = prog(f, 0, 70);
    const expo = prog(f, 20, 150, (t) => t);
    ctx.fillStyle = '#b9bec6';
    ctx.globalAlpha = 0.18 * (1 - dev);
    ctx.fillRect(R.x, R.y, R.w, R.h);
    ctx.globalAlpha = dev;
    ctx.filter = 'grayscale(1) contrast(1.08) brightness(1.02)';
    ctx.drawImage(imgs.boulevard, R.x, R.y, R.w, R.h);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#dde4ee';
    ctx.fillRect(R.x, R.y, R.w, R.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // Traffic that was really there during the minutes-long exposure, fading as the plate accumulates light.
    const ghost = (1 - expo) ** 1.6;
    ctx.save();
    ctx.beginPath();
    ctx.rect(R.x, R.y, R.w, R.h);
    ctx.clip();
    ctx.lineCap = 'round';
    for (const c of traffic) {
      const s = (((c.s0 + c.v * f) % 1) + 1) % 1;
      const p = along(s, c.lat), q = along((((s - c.v * 36) % 1) + 1) % 1, c.lat);
      if (Math.abs(p.x - q.x) > 300) continue;
      const size = (c.cart ? 14 : 6) * (0.35 + 0.65 * p.scale);
      const trail = ctx.createLinearGradient(q.x, q.y, p.x, p.y);
      trail.addColorStop(0, 'rgba(22,22,24,0)');
      trail.addColorStop(1, `rgba(22,22,24,${0.55 * ghost})`);
      ctx.strokeStyle = trail;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y - size * (c.cart ? 0.4 : 1));
      ctx.lineTo(p.x, p.y - size * (c.cart ? 0.4 : 1));
      ctx.stroke();
    }
    ctx.restore();

    // Mirror-like sheen of the silvered copper plate.
    const sweep = lerp(-0.4, 1.4, prog(f, 0, 200, (t) => t));
    const g = ctx.createLinearGradient(R.x + R.w * (sweep - 0.3), R.y, R.x + R.w * (sweep + 0.3), R.y + R.h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(235,242,255,0.16)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = g;
    ctx.fillRect(R.x, R.y, R.w, R.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(236,232,225,0.3)';
    ctx.strokeRect(R.x - 14, R.y - 14, R.w + 28, R.h + 28);

    const pulse = prog(f, 150, 175);
    if (pulse > 0) {
      ctx.strokeStyle = `rgba(200,54,45,${0.9 * (1 - ((f - 150) % 30) / 30)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(MAN.x, MAN.y, 8 + (((f - 150) % 30) / 30) * 28, 0, TAU);
      ctx.stroke();
    }
  };

  return (
    <Scene>
      <AbsoluteFill style={{transform: `scale(${1 + 0.04 * prog(f, 0, 222, (t) => t)})`, transformOrigin: `${MAN.x}px ${MAN.y}px`}}>
        <Canvas draw={draw} />
        <Callout x={MAN.x} y={MAN.y} dx={-200} dy={-50} w={300} title="第一个被拍下的人" sub="DAGUERRE · PARIS · 1838" delay={150} />
      </AbsoluteFill>
      <Caption label="DAGUERREOTYPE · 银版" zh="车马川流不息，只有一个擦鞋的人站得够久。" en="Traffic streamed past; only a man having his boots shined stood still long enough." delay={30} />
    </Scene>
  );
};
