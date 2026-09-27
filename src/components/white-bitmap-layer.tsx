import { WHITE_BITMAP_SRC } from "@/lib/force-white";

/** Viewport + document-height white JPEGs. OEM Force Dark leaves photo pixels alone. */
export function WhiteBitmapLayer() {
  return (
    <>
      <div className="site-white-layer pointer-events-none fixed inset-0 z-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts next/image wrappers */}
        <img
          src={WHITE_BITMAP_SRC}
          alt=""
          className="site-white-bitmap h-full w-full object-cover"
          decoding="sync"
          fetchPriority="high"
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- document-flow plate; fixed layer only covers the viewport */}
      <img
        src={WHITE_BITMAP_SRC}
        alt=""
        aria-hidden
        className="site-shell-fill"
        decoding="sync"
      />
    </>
  );
}
