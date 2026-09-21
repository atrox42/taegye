import { LOGO_DISPLAY, LOGO_SRC, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

/** Exact wordmark artwork, sized to fit inside a 135×48 CSS px box by default. */
export function BrandLogo({
  className,
  priority = false,
  width,
  height,
}: BrandLogoProps) {
  const maxWidth = width ?? LOGO_DISPLAY.width;
  const maxHeight = height ?? LOGO_DISPLAY.height;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- raster brand mark with CSS size cap
    <img
      src={LOGO_SRC}
      alt={SITE_NAME}
      width={598}
      height={384}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn(
        "brand-logo h-auto w-auto object-contain object-left",
        className
      )}
      style={{
        maxWidth,
        maxHeight,
        height: maxHeight,
        width: "auto",
        backgroundColor: "#ffffff",
        filter: "none",
      }}
    />
  );
}
