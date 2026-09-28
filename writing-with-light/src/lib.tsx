import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {cancelRender, continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';
import {H, W} from './timeline';

export const TAU = Math.PI * 2;
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.inOut(Easing.cubic);
export const prog = (f: number, a: number, b: number, easing: (t: number) => number = easeOut) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Seeded PRNG (mulberry32): particle fields must be identical on every render tab.
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// `--scale` sets devicePixelRatio. Canvas filter lengths ignore the transform, so blur radii must be multiplied by DPR.
export const DPR = window.devicePixelRatio || 1;

// Full-frame canvas drawn in 1920 × 1080 units with a DPR-sized bitmap.
export const Canvas: React.FC<{draw: (ctx: CanvasRenderingContext2D) => void; style?: React.CSSProperties}> = ({draw, style}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.reset();
    ctx.scale(DPR, DPR);
    draw(ctx);
  });
  return <canvas ref={ref} width={W * DPR} height={H * DPR} style={{position: 'absolute', inset: 0, width: W, height: H, ...style}} />;
};

export const offscreen = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  paint(c.getContext('2d', {willReadFrequently: true})!);
  return c;
};

const FILES = {legras: 'legras.jpg', boulevard: 'boulevard.jpg', lacock: 'lacock.jpg', tartan: 'tartan.jpg', horse: 'horse.jpg'};
export type Img = keyof typeof FILES;
const cache = new Map<Img, Promise<HTMLImageElement>>();
const loadImage = (name: Img) => {
  if (!cache.has(name)) {
    cache.set(name, new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${name}`));
      img.src = staticFile(`img/${FILES[name]}`);
    }));
  }
  return cache.get(name)!;
};

export const useImages = <T extends Img>(...names: T[]) => {
  const [imgs, setImgs] = useState<Record<T, HTMLImageElement> | null>(null);
  const [handle] = useState(() => delayRender(`images: ${names.join(', ')}`));
  useEffect(() => {
    Promise.all(names.map(loadImage)).then((list) => {
      setImgs(Object.fromEntries(names.map((n, i) => [n, list[i]])) as Record<T, HTMLImageElement>);
      continueRender(handle);
    }, cancelRender);
  }, [handle]); // eslint-disable-line react-hooks/exhaustive-deps
  return imgs;
};

export const fit = (iw: number, ih: number, cx: number, cy: number, mw: number, mh: number) => {
  const s = Math.min(mw / iw, mh / ih);
  return {x: cx - (iw * s) / 2, y: cy - (ih * s) / 2, w: iw * s, h: ih * s};
};

// Grid of the 12 frames on Muybridge's 1878 card (source pixels); frame 12 is the horse standing.
const HORSE = {x: [136, 1497, 2858, 4225], y: [146, 1032, 1924], w: 1306, h: 838};
export const horseFrame = (i: number) => [HORSE.x[i % 4], HORSE.y[Math.floor(i / 4)], HORSE.w, HORSE.h] as const;

// Small sepia/gray thumbnails cut from the archive photos, reused by the snapshot and mosaic scenes.
export const makeThumbs = (imgs: Record<Img, HTMLImageElement>, n: number, seed: number) => {
  const r = rng(seed);
  const names: Img[] = ['legras', 'boulevard', 'lacock', 'tartan', 'horse'];
  return Array.from({length: n}, () => {
    const name = names[Math.floor(r() * names.length)];
    const img = imgs[name];
    const [bx, by, bw, bh] = name === 'horse' ? horseFrame(Math.floor(r() * 11)) : [0, 0, img.naturalWidth, img.naturalHeight];
    const cw = bw * (0.45 + r() * 0.45), ch = cw * 0.75;
    const sx = bx + r() * (bw - cw), sy = by + r() * Math.max(0, bh - ch);
    return offscreen(320, 240, (ctx) => {
      ctx.filter = name === 'tartan' ? 'none' : `grayscale(1) sepia(${0.2 + r() * 0.5}) brightness(${0.9 + r() * 0.25})`;
      ctx.drawImage(img, sx, sy, cw, Math.min(ch, bh), 0, 0, 320, 240);
    });
  });
};

// Five-tier pagoda in unit coordinates: base centre at (0, 0), spire tip at (0, -1).
let pagodaCache: {path: Path2D; levels: number[]} | undefined;
export const pagoda = () => {
  if (pagodaCache) return pagodaCache;
  const path = new Path2D();
  const levels = [0];
  path.rect(-0.2, -0.03, 0.4, 0.03);
  let y = -0.03;
  for (let i = 0; i < 5; i++) {
    const w = 0.24 - i * 0.03, bh = 0.11 - i * 0.008, rw = w / 2 + 0.075, rh = 0.045;
    path.rect(-w / 2, y - bh, w, bh);
    y -= bh;
    path.moveTo(-rw, y - rh * 0.7);
    path.quadraticCurveTo(-w / 2, y - rh * 0.15, -w * 0.3, y - rh);
    path.lineTo(w * 0.3, y - rh);
    path.quadraticCurveTo(w / 2, y - rh * 0.15, rw, y - rh * 0.7);
    path.lineTo(w / 2, y);
    path.lineTo(-w / 2, y);
    path.closePath();
    levels.push(y - rh * 0.5);
    y -= rh;
  }
  path.rect(-0.007, -1, 0.014, 1 + y);
  for (const k of [0.25, 0.45, 0.65]) path.rect(-0.022, y - (1 + y) * k, 0.044, 0.01);
  levels.push(-1);
  return (pagodaCache = {path, levels});
};

// Classic aperture icon: a circle of radius R and n blade edges forming an n-gon of radius r.
export const apertureSegments = (R: number, r: number, n = 6, rot = 0) => {
  const V = Array.from({length: n}, (_, i) => [Math.cos(rot + (i * TAU) / n) * r, Math.sin(rot + (i * TAU) / n) * r]);
  return V.map((A, i) => {
    const B = V[(i + n - 1) % n];
    const l = Math.hypot(A[0] - B[0], A[1] - B[1]);
    const d = [(A[0] - B[0]) / l, (A[1] - B[1]) / l];
    const ad = A[0] * d[0] + A[1] * d[1];
    const t = -ad + Math.sqrt(ad * ad - (A[0] ** 2 + A[1] ** 2) + R * R);
    return [B[0], B[1], A[0] + d[0] * t, A[1] + d[1] * t] as const;
  });
};

export const aperturePoints = (R: number, r: number, count: number, seed: number) => {
  const rand = rng(seed);
  const segs = apertureSegments(R, r);
  return Array.from({length: count}, (_, i) => {
    if (i % 5 < 2) {
      const a = rand() * TAU;
      return [Math.cos(a) * R, Math.sin(a) * R] as const;
    }
    const [x1, y1, x2, y2] = segs[Math.floor(rand() * segs.length)];
    const t = rand();
    return [lerp(x1, x2, t), lerp(y1, y2, t)] as const;
  });
};
