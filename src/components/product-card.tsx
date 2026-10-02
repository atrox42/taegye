"use client";

import Link from "next/link";
import { type MouseEvent } from "react";

import { useGridDissolve } from "@/components/grid-dissolve";
import { ProductPhoto } from "@/components/product-photo";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import type { NewProduct } from "@/lib/site";

type ProductCardProps = {
  product: NewProduct;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const dissolve = useGridDissolve();
  const listedOnly = product.listedOnly === true;
  const href = listedOnly ? null : `/new/${product.id}`;
  const still = listedOnly || !product.mossSrc;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    let handled = false;
    try {
      handled = dissolve.start(href);
    } catch {
      handled = false;
    }
    if (handled) {
      event.preventDefault();
      window.setTimeout(() => {
        if (window.location.pathname !== href) window.location.assign(href);
      }, 2400);
    }
  };

  const body = (
    <>
      <WhiteSurfaceFill />
      <div className="product-stage relative aspect-square overflow-hidden">
        <WhiteSurfaceFill />
        <div className="product-empty absolute inset-0">
          <ProductPhoto
            src={product.emptySrc}
            mobileSrc={product.emptySrcMobile}
            alt={product.emptyAlt}
            fill
            priority={priority}
          />
        </div>
        {product.mossSrc ? (
          <div className="product-moss absolute inset-0">
            <ProductPhoto
              src={product.mossSrc}
              mobileSrc={product.mossSrcMobile}
              alt=""
              fill
              priority={priority}
            />
          </div>
        ) : null}
      </div>
      <div className="product-caption mt-3 text-left">
        <p className="site-type" style={forceInkStyle}>
          {product.name}
        </p>
        {product.price ? (
          <p className="site-type product-price mt-0.5" style={forceInkStyle}>
            {product.price}
          </p>
        ) : null}
      </div>
    </>
  );

  const className = `product-card relative block no-underline hover:no-underline${still ? " is-still" : ""}`;

  if (!href) {
    return (
      <div className={className} style={forceWhiteStyle}>
        {body}
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className} style={forceWhiteStyle}>
      {body}
    </Link>
  );
}
