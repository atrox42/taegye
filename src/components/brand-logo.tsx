import { CanvasLogo } from "@/components/canvas-logo";
import { LOGO_DISPLAY, LOGO_SRC, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

/** Transparent black PNG drawn on canvas so OEM Force Dark cannot grey the mark. */
export function BrandLogo({
  className,
  width,
  height,
}: BrandLogoProps) {
  const maxWidth = width ?? LOGO_DISPLAY.width;
  const maxHeight = height ?? LOGO_DISPLAY.height;

  return (
    <CanvasLogo
      src={LOGO_SRC}
      alt={SITE_NAME}
      width={maxWidth}
      height={maxHeight}
      align="left"
      className={cn("brand-logo", className)}
    />
  );
}
