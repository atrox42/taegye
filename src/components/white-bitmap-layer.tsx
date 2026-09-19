import { WHITE_BITMAP_SRC } from "@/lib/force-white";

/** Full-viewport raster. OEM force-dark usually leaves <img> pixels alone. */
export function WhiteBitmapLayer() {
  return (
    <div className="site-white-layer pointer-events-none fixed inset-0 z-0" aria-hidden>
      <img
        src={WHITE_BITMAP_SRC}
        alt=""
        className="site-white-bitmap h-full w-full object-cover"
        decoding="async"
      />
    </div>
  );
}
