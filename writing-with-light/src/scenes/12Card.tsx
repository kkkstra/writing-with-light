import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {apertureSegments, prog, rng, TAU} from '../lib';
import {C, F} from '../theme';
import {Scene} from '../ui';

const CX = 960, CY = 430;
const RINGS = [110, 190, 290, 410, 560, 740, 940];
const SCALE = [['∞', -150], ['10', -128], ['5', -108], ['3', -90], ['2', -72], ['1.5', -52], ['1 m', -30]] as const;

export const Card: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dots = useMemo(() => {
    const r = rng(121);
    return Array.from({length: 70}, () => ({a: r() * TAU, d: 120 + r() * 900, s: 0.8 + r() * 1.4}));
  }, []);
  const s = spring({frame: f, fps, config: {damping: 18, mass: 0.9}});
  const icon = 3.2 - 2.2 * s;
  const rings = prog(f, 0, 40);
  const title = prog(f, 30, 58);
  const ink = C.paperInk;
  return (
    <Scene fade={0} bg={C.paper}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.6), rgba(220,212,198,0.5) 75%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g opacity={rings} transform={`translate(${CX} ${CY}) scale(${0.94 + 0.06 * rings})`}>
          {RINGS.map((r) => <circle key={r} r={r} fill="none" stroke={ink} strokeOpacity={0.1} />)}
          {Array.from({length: 41}, (_, i) => -150 + i * 3).map((deg) => {
            const a = (deg * Math.PI) / 180, long = deg % 15 === 0;
            return <line key={deg} x1={Math.cos(a) * 290} y1={Math.sin(a) * 290} x2={Math.cos(a) * (long ? 304 : 298)} y2={Math.sin(a) * (long ? 304 : 298)} stroke={ink} strokeOpacity={0.3} />;
          })}
          {SCALE.map(([label, deg]) => {
            const a = (deg * Math.PI) / 180;
            return <text key={label} x={Math.cos(a) * 326} y={Math.sin(a) * 326 + 4} textAnchor="middle" fill={ink} fillOpacity={0.45} style={{font: `300 13px ${F.mono}`}}>{label}</text>;
          })}
          {dots.map((d, i) => <circle key={i} cx={Math.cos(d.a) * d.d} cy={Math.sin(d.a) * d.d * 0.7} r={d.s} fill={ink} fillOpacity={0.22} />)}
        </g>
        <g transform={`translate(${CX} ${CY}) scale(${icon}) rotate(${(1 - s) * -60})`} opacity={prog(f, 0, 8)} stroke={C.red} strokeWidth={4.5} strokeLinecap="round" fill="none">
          <circle r={46} />
          {apertureSegments(46, 21).map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
        </g>
        <line x1={CX - 210 * prog(f, 22, 50)} x2={CX + 210 * prog(f, 22, 50)} y1={620} y2={620} stroke={ink} strokeOpacity={0.35} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 498, textAlign: 'center', color: ink, font: `400 78px ${F.title}`, letterSpacing: '0.5em', paddingLeft: '0.5em', opacity: title, filter: `blur(${(1 - title) * 10}px)`}}>光之书写</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 642, textAlign: 'center', color: ink, font: `400 16px ${F.mono}`, letterSpacing: '0.42em', opacity: 0.6 * prog(f, 46, 66)}}>WRITING WITH LIGHT · c. 400 BCE — TODAY</div>
      <AbsoluteFill style={{background: C.ink, opacity: prog(f, 124, 150, (t) => t)}} />
    </Scene>
  );
};
