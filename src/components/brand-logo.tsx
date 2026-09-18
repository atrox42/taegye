import { LOGO_DISPLAY, LOGO_SRC, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

/** Exact wordmark artwork, sized to fit inside a 135×48 CSS px box. */
export function BrandLogo({ className, priority = false }: BrandLogoProps) {
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
        "h-auto w-auto object-contain object-left",
        className
      )}
      style={{
        maxWidth: LOGO_DISPLAY.width,
        maxHeight: LOGO_DISPLAY.height,
        height: LOGO_DISPLAY.height,
        width: "auto",
      }}
    />
  );
}
