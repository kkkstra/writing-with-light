export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const XFADE = 12;
export const sec = (s: number) => Math.round(s * FPS);

export const CHAPTERS = {
  pinhole: [0, 6],
  silver: [6, 11],
  helio: [11, 18],
  dagu: [18, 25],
  lens: [25, 34],
  negative: [34, 39],
  colour: [39, 44],
  motion: [44, 49],
  everyone: [49, 54],
  pixel: [54, 60],
  light: [60, 63.5],
  card: [63.5, 68.5],
  outro: [68.5, 72],
} as const satisfies Record<string, readonly [number, number]>;

export type Chapter = keyof typeof CHAPTERS;
export const TOTAL = sec(72);
