import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {aperturePoints, Canvas, prog, rng, TAU} from '../lib';
import {C, F} from '../theme';
import {Scene} from '../ui';

const CX = 960, CY = 470;
const SIGNATURE = [...'@一次成像'];

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const pts = useMemo(() => {
    const r = rng(131);
    return aperturePoints(150, 68, 1600, 133).map(([x, y]) => ({x, y, tw: r() * TAU, j: r()}));
  }, []);

  const draw = (ctx: CanvasRenderingContext2D) => {
    const glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 640);
    glow.addColorStop(0, 'rgba(200,54,45,0.2)');
    glow.addColorStop(1, 'rgba(200,54,45,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1920, 1080);
    const rot = f * 0.003;
    ctx.globalCompositeOperation = 'lighter';
    for (const p of pts) {
      const x = CX + p.x * Math.cos(rot) - p.y * Math.sin(rot), y = CY + p.x * Math.sin(rot) + p.y * Math.cos(rot);
      ctx.fillStyle = `rgba(255,236,220,${(0.25 + 0.45 * Math.sin(f * 0.15 + p.tw) ** 2) * prog(f, p.j * 20, 20 + p.j * 20)})`;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  };

  return (
    <Scene>
      <Canvas draw={draw} />
      <div style={{position: 'absolute', left: 0, right: 0, top: CY - 34, textAlign: 'center', color: C.text, font: `400 46px ${F.title}`, letterSpacing: '0.12em'}}>
        {SIGNATURE.map((ch, i) => (
          <span key={i} style={{opacity: prog(f, 24 + i * 6, 30 + i * 6), font: ch === '@' ? `italic 400 50px ${F.serif}` : undefined}}>{ch}</span>
        ))}
      </div>
      <AbsoluteFill style={{background: '#000', opacity: prog(f, 80, 104, (t) => t)}} />
    </Scene>
  );
};
