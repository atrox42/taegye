import { WHITE_BITMAP_SRC } from "@/lib/force-white";
import { cn } from "@/lib/utils";

/** Covering white JPEG. OEM Force Dark usually leaves photo pixels alone. */
export function WhiteSurfaceFill({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts next/image wrappers
    <img
      src={WHITE_BITMAP_SRC}
      alt=""
      aria-hidden
      className={cn("white-surface-fill", className)}
    />
  );
}
