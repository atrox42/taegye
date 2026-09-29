"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent } from "react";

import { useGridDissolve } from "@/components/grid-dissolve";
import { forceInkStyle } from "@/lib/force-white";
import type { NewProduct } from "@/lib/site";

type ProductCardProps = {
  product: NewProduct;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const dissolve = useGridDissolve();
  const href = `/new/${product.id}`;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    let handled = false;
    try {
      handled = dissolve.start(href);
    } catch {
      handled = false;
    }
    if (handled) event.preventDefault();
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className="product-card relative block no-underline hover:no-underline"
    >
      <div className="product-stage relative aspect-square overflow-hidden">
        <div className="product-empty absolute inset-0">
          <Image
            src={product.emptySrc}
            alt={product.emptyAlt}
            fill
            priority={priority}
            unoptimized
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-contain object-center"
          />
        </div>
        <div className="product-moss absolute inset-0">
          <Image
            src={product.mossSrc}
            alt=""
            fill
            priority={priority}
            unoptimized
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-contain object-center"
            aria-hidden
          />
        </div>
      </div>
      <div className="product-caption mt-3 text-left">
        <p className="site-type" style={forceInkStyle}>
          {product.name}
        </p>
        <p className="site-type product-price mt-0.5" style={forceInkStyle}>
          {product.price}
        </p>
      </div>
    </Link>
  );
}
