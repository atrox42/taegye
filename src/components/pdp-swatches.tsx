import Link from "next/link";

import { productColorLabel, type NewProduct } from "@/lib/site";

export function PdpSwatches({
  product,
  family,
  className,
}: {
  product: NewProduct;
  family: NewProduct[];
  className?: string;
}) {
  return (
    <div className={className ? `pdp-swatches ${className}` : "pdp-swatches"} role="list" aria-label="Color">
      {family.map((item) => {
        const label = productColorLabel(item);
        const current = item.id === product.id;
        const light = label === "MIST" || label === "White";
        const className = `pdp-swatch${current ? " is-current" : ""}${light ? " is-light" : ""}`;
        if (current) {
          return (
            <span key={item.id} role="listitem" className={className} aria-current="true" title={label}>
              {/* eslint-disable-next-line @next/next/no-img-element -- raster swatch skips Force Dark invert */}
              <img src={`/swatches/${item.id}.png`} alt={label} />
              <span className="sr-only">{label}</span>
            </span>
          );
        }
        return (
          <Link
            key={item.id}
            role="listitem"
            href={`/new/${item.id}`}
            className={className}
            title={label}
            aria-label={label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- raster swatch skips Force Dark invert */}
            <img src={`/swatches/${item.id}.png`} alt={label} />
          </Link>
        );
      })}
    </div>
  );
}
