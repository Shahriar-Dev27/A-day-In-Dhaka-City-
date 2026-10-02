import { wobblePoly, type V2 } from "../tong/geometry";

/** A chamfered, hand-cut window outline (the same shape is the interior aperture and, at 1/PUSH, the train's). */
export function octagon(x: number, y: number, w: number, h: number, r: number, seed: number, amp = 1.4): string {
  const pts: V2[] = [
    [x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r],
  ];
  return wobblePoly(pts, seed, amp);
}
