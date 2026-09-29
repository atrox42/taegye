import { PRODUCT_MOBILE_MEDIA } from "@/lib/site";
import { cn } from "@/lib/utils";

type ProductPhotoProps = {
  src: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
};

/** Desktop originals via `src`. Brightened rasters only at the mobile breakpoint. */
export function ProductPhoto({
  src,
  mobileSrc,
  alt,
  className,
  fill = false,
  priority = false,
  width,
  height,
}: ProductPhotoProps) {
  const imgClass = cn(fill ? "product-photo-img" : null, className);
  const img = (
    // Native img so <picture> can swap files at max-width: 767px without a CSS filter.
    // eslint-disable-next-line @next/next/no-img-element -- photographic PNG/WebP must stay raster
    <img
      src={src}
      alt={alt}
      className={imgClass}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );

  if (!mobileSrc || mobileSrc === src) {
    return fill ? <span className="product-photo-fill">{img}</span> : img;
  }

  return (
    <picture className={fill ? "product-photo-fill" : undefined}>
      <source media={PRODUCT_MOBILE_MEDIA} srcSet={mobileSrc} />
      {img}
    </picture>
  );
}
