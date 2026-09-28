import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Canvas, clamp, lerp, prog, rng, TAU} from '../lib';
import {C, F} from '../theme';
import {CHAPTERS, FPS} from '../timeline';
import {Callout, Caption, exposureAt, Readout, Scene} from '../ui';

const CX = 960, CY = 500, RG = 170;
const RING = 'PHOTOGRAPHY — φῶς, LIGHT · γραφή, WRITING — J. HERSCHEL · 1839 — ';
const ENGRAVING = 'PETZVAL PORTRAIT LENS · f/3.6 · 1841 · Nº 0001 · ';

const fNumber = (t: number) => 14 * Math.sqrt(exposureAt(t) / 300);

const TextRing: React.FC<{spin: number; front: boolean; opacity: number}> = ({spin, front, opacity}) => {
  const chars = [...RING];
  return (
    <div style={{position: 'absolute', left: CX, top: CY, perspective: 1500, opacity}}>
      <div style={{transformStyle: 'preserve-3d', transform: `rotateX(-14deg) rotateZ(-6deg) rotateY(${spin}deg)`}}>
        {chars.map((ch, i) => {
          const a = (i / chars.length) * 360;
          const facing = Math.cos(((a + spin) * Math.PI) / 180);
          if (facing > 0 !== front) return null;
          return (
            <span key={i} style={{position: 'absolute', transform: `translate(-50%, -50%) rotateY(${a}deg) translateZ(470px)`, font: `500 34px ${F.serif}`, color: C.text, opacity: front ? 0.55 + 0.45 * facing : 0.4 + 0.25 * -facing}}>
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Lens: React.FC = () => {
  const f = useCurrentFrame();
  const t = CHAPTERS.lens[0] + f / FPS;
  const N = fNumber(t);
  const motes = useMemo(() => {
    const r = rng(53);
    return Array.from({length: 520}, () => ({a: r() * TAU, r0: 260 + r() * 900, sp: 0.4 + r() * 0.8, ph: r()}));
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.translate(CX, CY);
    const halo = ctx.createRadialGradient(0, 0, 150, 0, 0, 620);
    halo.addColorStop(0, 'rgba(200,150,80,0.16)');
    halo.addColorStop(1, 'rgba(200,150,80,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(-960, -540, 1920, 1080);

    // Light spiralling into the lens.
    ctx.lineCap = 'round';
    for (const m of motes) {
      const life = (m.ph + f * 0.004 * m.sp) % 1;
      const rad = lerp(m.r0, RG * 0.6, life ** 1.4);
      const a = m.a + life * 2.4;
      const a0 = a - 0.05 * m.sp;
      const alpha = Math.sin(Math.PI * life) * 0.55 * (rad > 255 ? 1 : 0);
      if (alpha <= 0.01) continue;
      ctx.strokeStyle = `rgba(255,228,185,${alpha})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * rad * 1.02, Math.sin(a0) * rad * 0.62);
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad * 0.62);
      ctx.stroke();
    }

    const ring = (r1: number, r2: number, stops: string[]) => {
      const g = ctx.createConicGradient(-0.6, 0, 0);
      stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r2, 0, TAU);
      ctx.arc(0, 0, r1, 0, TAU, true);
      ctx.fill();
    };
    ring(232, 252, ['#5b4526', '#caa35c', '#6b5230', '#e6c888', '#5b4526', '#b89150', '#5b4526']);
    ctx.strokeStyle = 'rgba(40,28,14,0.55)';
    for (let i = 0; i < 200; i++) {
      const a = (i / 200) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 234, Math.sin(a) * 234);
      ctx.lineTo(Math.cos(a) * 250, Math.sin(a) * 250);
      ctx.stroke();
    }
    ring(206, 232, ['#8d6f3e', '#f0d69c', '#9a7a44', '#d8b879', '#7a5f34', '#e9cf94', '#8d6f3e']);
    ring(180, 206, ['#241b10', '#3a2c19', '#241b10', '#33271a', '#241b10']);
    ctx.font = `400 14px ${F.mono}`;
    ctx.fillStyle = 'rgba(232,204,150,0.85)';
    ctx.textAlign = 'center';
    [...ENGRAVING].forEach((ch, i, arr) => {
      ctx.save();
      ctx.rotate((i / arr.length) * TAU - Math.PI / 2);
      ctx.fillText(ch, 0, -187);
      ctx.restore();
    });

    // Glass, iris (opening radius ∝ 1/N) and coating reflections.
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, RG + 10, 0, TAU);
    ctx.clip();
    const glass = ctx.createRadialGradient(-30, -40, 10, 0, 0, RG + 10);
    glass.addColorStop(0, '#1c2230');
    glass.addColorStop(1, '#07080b');
    ctx.fillStyle = glass;
    ctx.fillRect(-RG - 10, -RG - 10, 2 * RG + 20, 2 * RG + 20);
    const fly = prog(f, 222, 276, (x) => x * x);
    const open = RG * 0.95 * (3.6 / N) * (1 + 0.5 * fly);
    const beyond = ctx.createRadialGradient(0, 0, 0, 0, 0, open);
    beyond.addColorStop(0, `rgba(255,232,196,${0.3 + 0.25 * (1 - 3.6 / N) + 0.7 * fly})`);
    beyond.addColorStop(1, `rgba(255,226,180,${0.6 * fly})`);
    ctx.fillStyle = beyond;
    ctx.fillRect(-open, -open, open * 2, open * 2);
    const rot = N * 0.08;
    const V = Array.from({length: 8}, (_, i) => [Math.cos(rot + (i * TAU) / 8) * open, Math.sin(rot + (i * TAU) / 8) * open]);
    ctx.beginPath();
    ctx.arc(0, 0, RG + 10, 0, TAU);
    V.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    const steel = ctx.createConicGradient(rot, 0, 0);
    for (let i = 0; i <= 16; i++) steel.addColorStop(i / 16, i % 2 ? '#34302b' : '#171513');
    ctx.fillStyle = steel;
    ctx.fill('evenodd');
    ctx.strokeStyle = 'rgba(255,240,220,0.22)';
    V.forEach(([x, y], i) => {
      const [px, py] = V[(i + 7) % 8];
      const l = Math.hypot(x - px, y - py);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x + ((x - px) / l) * RG * 2, y + ((y - py) / l) * RG * 2);
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'screen';
    const coat = ctx.createRadialGradient(-60, -70, 0, -40, -50, RG * 1.2);
    coat.addColorStop(0, 'rgba(140,110,220,0.28)');
    coat.addColorStop(0.5, 'rgba(60,140,120,0.12)');
    coat.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coat;
    ctx.fillRect(-RG, -RG, RG * 2, RG * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, RG - 18, Math.PI * 1.08, Math.PI * 1.42);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, RG - 40, Math.PI * 1.12, Math.PI * 1.3);
    ctx.stroke();
    ctx.restore();

    // Ghost reflections along the axis from the light source through the centre.
    ctx.globalCompositeOperation = 'screen';
    [[-1.6, 40, '255,170,90'], [-0.7, 16, '140,255,200'], [0.45, 26, '200,120,255'], [1.1, 60, '255,210,150'], [1.9, 22, '120,200,255']].forEach(([k, r, rgb]) => {
      const x = -210 * (k as number), y = -140 * (k as number);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r as number);
      g.addColorStop(0, `rgba(${rgb},0.22)`);
      g.addColorStop(0.7, `rgba(${rgb},0.08)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r as number, 0, TAU);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  const spin = f * 0.32 + 20;
  const dive = interpolate(f, [222, 282], [1, 9], {...clamp, easing: (x) => x ** 3});
  const hud = 1 - prog(f, 210, 228);
  return (
    <Scene>
      <AbsoluteFill style={{transform: `scale(${dive})`, transformOrigin: `${CX}px ${CY}px`}}>
        <TextRing spin={spin} front={false} opacity={prog(f, 20, 60) * hud} />
        <Canvas draw={draw} />
        <TextRing spin={spin} front opacity={prog(f, 20, 60) * hud} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: hud}}>
        <Readout align="left" label="APERTURE · 光圈" value={`f/${N.toFixed(1)}`} unit="t ∝ N²" style={{opacity: prog(f, 60, 80)}} />
        <Callout x={CX + 250 * Math.cos(0.7)} y={CY + 250 * Math.sin(0.7)} dx={130} dy={110} w={330} title="PETZVAL · 1841 · f/3.6" sub="≈ 15× FASTER THAN f/14 · 快约 15 倍" delay={150} />
        <Caption label="PHOTOGRAPHY · 摄影" zh="1839 年，它有了名字：用光书写。" en="In 1839, it was given a name: writing with light." delay={40} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: prog(f, 262, 282, (x) => x)}} />
    </Scene>
  );
};
