import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const C = {
  ink: '#0A0908',
  text: '#ECE8E1',
  silver: '#C9CCD1',
  bitumen: '#8A6A4A',
  red: '#C8362D',
  paper: '#F2EFE8',
  paperInk: '#1C1A17',
};

const MONO = 'IBM Plex Mono';
export const F = {sans: 'Noto Sans SC', title: 'Noto Serif SC', serif: 'EB Garamond', mono: `'${MONO}', 'Noto Sans SC'`};

for (const [family, file, weight, style] of [
  [F.sans, 'NotoSansSC.ttf', '100 900', 'normal'],
  [F.title, 'NotoSerifSC.ttf', '200 900', 'normal'],
  [F.serif, 'EBGaramond.ttf', '400 800', 'normal'],
  [F.serif, 'EBGaramond-Italic.ttf', '400 800', 'italic'],
  [MONO, 'IBMPlexMono-Light.ttf', '300', 'normal'],
  [MONO, 'IBMPlexMono-Regular.ttf', '400', 'normal'],
]) {
  loadFont({family, url: staticFile(`fonts/${file}`), weight, style});
}
