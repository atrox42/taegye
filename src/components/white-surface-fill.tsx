import { CanvasWhitePlate } from "@/components/canvas-white-plate";
import { cn } from "@/lib/utils";

/** Covering #FFFFFF canvas. OEM Force Dark leaves canvas pixels alone. */
export function WhiteSurfaceFill({ className }: { className?: string }) {
  return <CanvasWhitePlate mode="fill" className={cn("white-surface-fill", className)} />;
}
