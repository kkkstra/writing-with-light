import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {Canvas, easeInOut, lerp, makeThumbs, offscreen, prog, rng, useImages} from '../lib';
import {F} from '../theme';
import {CHAPTERS, FPS} from '../timeline';
import {Callout, Caption, pixelsAt, Scene} from '../ui';

const SIDE = 580, CX = 960, CY = 455;
const X0 = CX - SIDE / 2, Y0 = CY - SIDE / 2;
const TILE = 36, GAP = 4, STEP = (SIDE * (TILE + GAP)) / TILE;
const LOUPE = {x: 1330, y: 330, cell: 38, n: 6, px: 53, py: 54};

export const Pixel: React.FC = () => {
  const f = useCurrentFrame();
  const imgs = useImages('legras', 'boulevard', 'lacock', 'tartan', 'horse');
  const thumbs = useMemo(() => (imgs ? makeThumbs(imgs, 64, 97) : []), [imgs]);
  const tiles = useMemo(() => {
    const r = rng(99);
    return Array.from({length: 49 * 29}, () => ({thumb: Math.floor(r() * 64), a: 0.35 + r() * 0.65}));
  }, []);
  const n = Math.min(SIDE, Math.round(Math.sqrt(pixelsAt(CHAPTERS.pixel[0] + f / FPS))));
  const low = useMemo(() => (imgs ? offscreen(100, 100, (ctx) => ctx.drawImage(imgs.legras, 396, 0, 1805, 1805, 0, 0, 100, 100)) : null), [imgs]);

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!imgs || !low) return;
    const zoomOut = prog(f, 128, 188, easeInOut);
    const s = lerp(1, TILE / SIDE, zoomOut);
    ctx.translate(CX, CY);
    ctx.scale(s, s);
    ctx.translate(-CX, -CY);
    const img = offscreen(n, n, (c) => c.drawImage(imgs.legras, 396, 0, 1805, 1805, 0, 0, n, n));
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, X0, Y0, SIDE, SIDE);
    const cell = SIDE / n;
    if (cell > 3) {
      ctx.strokeStyle = `rgba(10,9,8,${Math.min(0.8, (cell - 3) / 4)})`;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        ctx.moveTo(X0 + i * cell, Y0);
        ctx.lineTo(X0 + i * cell, Y0 + SIDE);
        ctx.moveTo(X0, Y0 + i * cell);
        ctx.lineTo(X0 + SIDE, Y0 + i * cell);
      }
      ctx.stroke();
    }
    ctx.imageSmoothingEnabled = true;
    if (zoomOut > 0) {
      tiles.forEach((t, i) => {
        const col = (i % 49) - 24, row = Math.floor(i / 49) - 14;
        if (!col && !row) return;
        ctx.globalAlpha = t.a * prog(zoomOut, 0, 0.5);
        ctx.drawImage(thumbs[t.thumb], 20, 0, 120, 120, CX + col * STEP - SIDE / 2, CY + row * STEP - SIDE / 2, SIDE, SIDE);
      });
      ctx.globalAlpha = 1;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Loupe: a 6 × 6 patch of the 100 × 100 image with its grey levels.
    const loupe = prog(f, 10, 28) * (1 - prog(f, 100, 118));
    if (loupe > 0) {
      const data = low.getContext('2d')!.getImageData(LOUPE.px, LOUPE.py, LOUPE.n, LOUPE.n).data;
      const L = LOUPE.cell * LOUPE.n;
      ctx.globalAlpha = loupe;
      ctx.strokeStyle = 'rgba(236,232,225,0.5)';
      ctx.strokeRect(X0 + LOUPE.px * 5.8, Y0 + LOUPE.py * 5.8, LOUPE.n * 5.8, LOUPE.n * 5.8);
      ctx.beginPath();
      ctx.moveTo(X0 + (LOUPE.px + LOUPE.n) * 5.8, Y0 + LOUPE.py * 5.8);
      ctx.lineTo(LOUPE.x, LOUPE.y);
      ctx.moveTo(X0 + (LOUPE.px + LOUPE.n) * 5.8, Y0 + (LOUPE.py + LOUPE.n) * 5.8);
      ctx.lineTo(LOUPE.x, LOUPE.y + L);
      ctx.stroke();
      ctx.font = `300 12px ${F.mono}`;
      ctx.textAlign = 'center';
      for (let i = 0; i < LOUPE.n * LOUPE.n; i++) {
        const v = data[i * 4], x = LOUPE.x + (i % LOUPE.n) * LOUPE.cell, y = LOUPE.y + Math.floor(i / LOUPE.n) * LOUPE.cell;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x + 1, y + 1, LOUPE.cell - 2, LOUPE.cell - 2);
        ctx.fillStyle = v > 128 ? 'rgba(10,9,8,0.8)' : 'rgba(236,232,225,0.8)';
        ctx.fillText(`${v}`, x + LOUPE.cell / 2, y + LOUPE.cell / 2 + 4);
      }
      ctx.textAlign = 'left';
      ctx.font = `400 14px ${F.mono}`;
      ctx.fillStyle = 'rgba(236,232,225,0.6)';
      ctx.fillText('PIXEL · 像素', LOUPE.x, LOUPE.y - 16);
      ctx.fillStyle = 'rgba(236,232,225,0.45)';
      ctx.fillText(`(${LOUPE.px}, ${LOUPE.py}) · 8-BIT GREY`, LOUPE.x, LOUPE.y + L + 26);
      ctx.globalAlpha = 1;
    }
  };

  return (
    <Scene>
      <Canvas draw={draw} />
      <Callout x={X0} y={Y0 + 120} dx={-110} dy={-50} w={340} title="S. SASSON · KODAK · 1975" sub="100 × 100 PIXELS · 23 s PER IMAGE" delay={14} />
      <Caption label="PIXEL · 像素" zh="如今，每年有超过一万亿张照片被拍下。" en="Today, more than a trillion photographs are taken every year." delay={70} />
    </Scene>
  );
};
