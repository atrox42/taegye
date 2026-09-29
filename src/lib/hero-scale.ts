/** Desktop-only shuffle. Mobile always paints the 1× clip (138×78). */
export const HERO_SCALES = [1.25, 1, 0.4] as const;

export type HeroScale = (typeof HERO_SCALES)[number];
export type HeroScaleTriple = [HeroScale, HeroScale, HeroScale];

export type HeroSlot = { top: string; left: string };

export function shuffleHeroScales(): HeroScaleTriple {
  const next = [...HERO_SCALES];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next as HeroScaleTriple;
}

export function parseHeroScales(raw: string | null): HeroScaleTriple | null {
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 3 || parts.some((value) => !Number.isFinite(value))) return null;
  const sorted = [...parts].sort((a, b) => a - b);
  const expected = [0.4, 1, 1.25];
  if (!expected.every((value, index) => Math.abs(value - sorted[index]) < 1e-6)) return null;
  return parts as HeroScaleTriple;
}

export function mobileClipBox(scale: number, viewportWidth: number, gutter = 16) {
  const baseW = 138;
  const rawW = baseW * scale;
  const maxW = Math.max(0, viewportWidth - gutter * 2);
  const w = Math.min(rawW, maxW);
  return {
    width: w,
    height: w * (130 / 230),
    clamped: rawW > maxW + 0.5,
    effectiveScale: w / baseW,
  };
}

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  gap: number,
) {
  return (
    a.x < b.x + b.w + gap &&
    a.x + a.w + gap > b.x &&
    a.y < b.y + b.h + gap &&
    a.y + a.h + gap > b.y
  );
}

/** Desktop scatter: honor a preset when given, then clamp the largest box and un-overlap. */
export function placeScaledClips(
  scales: number[],
  vw: number,
  vh: number,
  preset?: HeroSlot[],
): HeroSlot[] {
  const baseW = 230;
  const baseH = 130;
  const padX = 24;
  const padTop = 56;
  const padBottom = 24;
  const gap = 12;

  if (vw < 200 || vh < 200) {
    return scales.map((_, index) => preset?.[index] ?? { top: "19%", left: "12%" });
  }

  const boxes = scales.map((scale, index) => {
    const w = baseW * scale;
    const h = baseH * scale;
    const slot = preset?.[index];
    return {
      index,
      w,
      h,
      x: slot ? (parseFloat(slot.left) / 100) * vw : padX,
      y: slot ? (parseFloat(slot.top) / 100) * vh : padTop,
    };
  });

  const clamp = (box: (typeof boxes)[number]) => {
    const maxX = Math.max(padX, vw - padX - box.w);
    const maxY = Math.max(padTop, vh - padBottom - box.h);
    box.x = Math.min(Math.max(padX, box.x), maxX);
    box.y = Math.min(Math.max(padTop, box.y), maxY);
  };

  boxes.forEach(clamp);

  const bySize = [...boxes].sort((a, b) => b.w - a.w);
  for (let i = 0; i < bySize.length; i += 1) {
    const box = bySize[i];
    const others = bySize.slice(0, i);
    const maxX = Math.max(0, vw - padX * 2 - box.w);
    const maxY = Math.max(0, vh - padTop - padBottom - box.h);
    const fits = () => !others.some((other) => overlaps(box, other, gap));
    clamp(box);
    if (!fits()) {
      for (let attempt = 0; attempt < 80; attempt += 1) {
        box.x = padX + Math.random() * maxX;
        box.y = padTop + Math.random() * maxY;
        clamp(box);
        if (fits()) break;
      }
    }
    if (!fits()) {
      const steps = 12;
      outer: for (let row = 0; row <= steps; row += 1) {
        for (let col = 0; col <= steps; col += 1) {
          box.x = padX + (maxX * col) / steps;
          box.y = padTop + (maxY * row) / steps;
          clamp(box);
          if (fits()) break outer;
        }
      }
    }
    clamp(box);
  }

  return boxes
    .sort((a, b) => a.index - b.index)
    .map((box) => ({ left: `${Math.round(box.x)}px`, top: `${Math.round(box.y)}px` }));
}
