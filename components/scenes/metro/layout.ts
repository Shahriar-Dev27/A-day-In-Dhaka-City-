/*
  Scene 4 geometry, in the 1600x900 art units every scene shares (xMidYMax slice, so x 592..1008 is
  what a 390px phone shows). One place, so the exterior hero window, the interior aperture and the
  camera origin can never drift apart (the match cut depends on them being identical).
*/

// The hero window aperture inside the carriage. The exterior train's hero window is the same shape
// at 1/PUSH size, so scaling the exterior by PUSH about its centre lands exactly on this rectangle.
export const PUSH = 5;
export const WIN = { w: 500, h: 380, cx: 800, cy: 462, pitch: 800, r: 46 } as const; // interior units
export const WIN_Y0 = WIN.cy - WIN.h / 2; // 272
export const WIN_Y1 = WIN.cy + WIN.h / 2; // 652

// Exterior (train side view): window = WIN / PUSH, slot = pitch / PUSH, so neighbouring windows line up too.
export const EXT = {
  winW: WIN.w / PUSH, // 100
  winH: WIN.h / PUSH, // 76
  slot: WIN.pitch / PUSH, // 160
  roof: 372,
  deckTop: 618,
  deckBot: 662,
  roadTop: 818,
  carLen: 1000,
  carGap: 24,
} as const;

// Interior vertical landmarks
export const IN = {
  rail: 244, // overhead handrail
  seat: 745, // seat cushion top
  seatBot: 790,
  plinth: 826,
  feet: 872, // standing feet
} as const;

// Interior track x of each beat's subject (the camera pans so this sits at the focus point).
export const AT = {
  father: 690,
  boy: 830,
  commuter: 1230,
  walker: 1345,
  son: 1500,
  mother: 1590,
  woman: 1765,
  worker: 1930,
  exiting: 2075,
  door: 2400,
  poleA: 640,
  poleB: 1640,
} as const;

// Window openings (centres) along the carriage; the door bay replaces the one at 2400.
export const WINDOW_CX = [-800, 0, 800, 1600, 3200] as const;

// A tx that puts track x `x` at screen x `screenX` for a track scaled by `s` about (800, _):
// screen = 800 + s * (x + tx - 800)
export const txFor = (x: number, screenX = 800, s = 1) => 800 + (screenX - 800) / s - x;
