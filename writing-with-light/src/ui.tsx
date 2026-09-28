import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, prog, rng} from './lib';
import {C, F} from './theme';
import {CHAPTERS, FPS, H, sec, W, XFADE} from './timeline';

export const Scene: React.FC<{children?: React.ReactNode; fade?: number; bg?: string}> = ({children, fade = XFADE, bg = C.ink}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: bg, opacity: fade ? prog(f, 0, fade, (t) => t) : 1}}>{children}</AbsoluteFill>;
};

const reveal = (t: number, dur = 14): React.CSSProperties => {
  const p = prog(t, 0, dur);
  return {display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 6}px)`};
};

const Rule: React.FC<{p: number; origin: 'left' | 'right'}> = ({p, origin}) => (
  <span style={{display: 'inline-block', width: 44, height: 1, background: 'currentColor', verticalAlign: 'middle', margin: '0 14px', transform: `scaleX(${p})`, transformOrigin: origin}} />
);

type At = 'bl' | 'br' | 'tl' | 'bc';
const POS: Record<At, React.CSSProperties> = {
  bl: {left: 150, bottom: 170, textAlign: 'left'},
  br: {right: 150, bottom: 170, textAlign: 'right'},
  tl: {left: 150, top: 160, textAlign: 'left'},
  bc: {left: 0, right: 0, bottom: 170, textAlign: 'center'},
};

export const Caption: React.FC<{label: string; zh: string; en: string; at?: At; delay?: number}> = ({label, zh, en, at = 'bl', delay = 10}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const f = frame - delay;
  const chars = [...zh];
  const out = 1 - prog(frame, durationInFrames - XFADE - 14, durationInFrames - XFADE);
  const line = prog(f, 0, 20);
  return (
    <div style={{position: 'absolute', ...POS[at], color: C.text, opacity: out}}>
      <div style={{font: `400 15px ${F.mono}`, letterSpacing: '0.32em', opacity: 0.6 * prog(f, 0, 16), marginBottom: 18}}>
        {at !== 'br' && <Rule p={line} origin="left" />}
        {label}
        {at === 'br' && <Rule p={line} origin="right" />}
      </div>
      <div style={{font: `300 42px ${F.sans}`, letterSpacing: '0.08em'}}>
        {chars.map((ch, i) => <span key={i} style={reveal(f - 8 - i * 1.5)}>{ch}</span>)}
      </div>
      <div style={{font: `italic 400 26px ${F.serif}`, opacity: 0.72, marginTop: 12}}>
        <span style={reveal(f - 14 - chars.length * 1.5, 20)}>{en}</span>
      </div>
    </div>
  );
};

// Leader-line label: circle on the target, diagonal to an elbow, then a rule of width w; text grows away from the elbow.
export const Callout: React.FC<{x: number; y: number; dx: number; dy: number; title: string; sub?: string; w?: number; delay?: number; color?: string}> = ({x, y, dx, dy, title, sub, w = 340, delay = 0, color = C.text}) => {
  const f = useCurrentFrame() - delay;
  const ex = x + dx, ey = y + dy, left = dx < 0;
  const hx = left ? ex - w : ex + w;
  const k = 8 / Math.hypot(dx, dy);
  const text: React.CSSProperties = {position: 'absolute', ...(left ? {right: W - ex} : {left: ex}), whiteSpace: 'nowrap', color, textShadow: '0 0 4px #000, 0 0 14px #000, 0 0 28px #000', ...reveal(f - 18)};
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <circle cx={x} cy={y} r={8 * prog(f, 0, 10)} fill="none" stroke={color} strokeWidth={1.4} />
        <path d={`M${x + dx * k},${y + dy * k} L${ex},${ey} L${hx},${ey}`} fill="none" stroke={color} strokeOpacity={0.7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(f, 6, 26)} />
      </svg>
      <div style={{...text, top: ey - 30, font: `400 16px ${F.mono}`, letterSpacing: '0.2em'}}>{title}</div>
      {sub && <div style={{...text, top: ey + 10, font: `300 14px ${F.mono}`, letterSpacing: '0.16em', opacity: 0.55 * prog(f, 18, 32)}}>{sub}</div>}
    </AbsoluteFill>
  );
};

export const Readout: React.FC<{label: string; value: string; unit?: string; align: 'left' | 'right'; style?: React.CSSProperties}> = ({label, value, unit, align, style}) => (
  <div style={{position: 'absolute', top: 150, [align]: 150, textAlign: align, color: C.text, ...style}}>
    <div style={{font: `400 14px ${F.mono}`, letterSpacing: '0.3em', opacity: 0.6}}>
      {align === 'left' && <Rule p={1} origin="left" />}
      {label}
      {align === 'right' && <Rule p={1} origin="right" />}
    </div>
    <div style={{display: 'flex', alignItems: 'baseline', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', gap: 18, marginTop: 4}}>
      <span style={{font: `400 66px ${F.serif}`, fontVariantNumeric: 'lining-nums tabular-nums'}}>{value}</span>
      {unit && <span style={{font: `400 14px ${F.mono}`, letterSpacing: '0.3em', opacity: 0.6}}>{unit}</span>}
    </div>
  </div>
);

// Exposure in seconds over the film's timeline (global seconds). The lens chapter derives its f-number from this curve.
const EXPOSURE: [number, number][] = [[19.5, 28800], [23, 300], [28, 300], [31, 300 * (3.6 / 14) ** 2], [45, 300 * (3.6 / 14) ** 2], [47.5, 1 / 2000]];
const PIXELS: [number, number][] = [[55.6, 1e4], [58.6, 2e8]];
const logCurve = (t: number, keys: [number, number][]) =>
  Math.exp(interpolate(t, keys.map((k) => k[0]), keys.map((k) => Math.log(k[1])), {...clamp, easing: Easing.inOut(Easing.cubic)}));
export const exposureAt = (t: number) => logCurve(t, EXPOSURE);
export const pixelsAt = (t: number) => logCurve(t, PIXELS);
const group = (v: number) => (v >= 1 ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009') : `1/${Math.round(1 / v)}`);

export const Counter: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const vis = (a: number, b: number) => interpolate(t, [a, a + 0.6, b - 0.6, b], [0, 1, 1, 0], clamp);
  if (t < 12 || t > 60) return null;
  const prefix = t < 19.5 ? '≥ ' : t >= 47.5 ? '< ' : '≈ ';
  return t < 50 ? (
    <Readout align="right" label="EXPOSURE · 曝光时间" value={prefix + group(exposureAt(t))} unit="SECONDS · 秒" style={{opacity: Math.max(vis(12, 34.4), vis(44, 49.2))}} />
  ) : (
    <Readout align="right" label="RESOLUTION · 分辨率" value={group(pixelsAt(t))} unit="PIXELS · 像素" style={{opacity: vis(54.4, 60)}} />
  );
};

export const Letterbox: React.FC = () => {
  if (useCurrentFrame() >= sec(CHAPTERS.card[0])) return null;
  const bar: React.CSSProperties = {position: 'absolute', left: 0, right: 0, height: 110, background: '#000'};
  return (
    <AbsoluteFill>
      <div style={{...bar, top: 0}} />
      <div style={{...bar, bottom: 0}} />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.08}) => {
  const f = useCurrentFrame();
  const url = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(256, 256);
    const r = rng(7);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = img.data[i + 1] = img.data[i + 2] = r() * 255;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }, []);
  return (
    <AbsoluteFill style={{backgroundImage: `url(${url})`, backgroundPosition: `${Math.floor(random(`gx${f}`) * 256)}px ${Math.floor(random(`gy${f}`) * 256)}px`, mixBlendMode: 'overlay', opacity, pointerEvents: 'none'}} />
  );
};
