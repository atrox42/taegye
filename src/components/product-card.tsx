"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent, type PointerEvent } from "react";

import { useGridDissolve } from "@/components/grid-dissolve";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import type { NewProduct } from "@/lib/site";

type ProductCardProps = {
  product: NewProduct;
  priority?: boolean;
};

const TAP_SLOP_PX = 12;

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const dissolve = useGridDissolve();
  const href = `/new/${product.id}`;
  const tap = useRef<{ x: number; y: number; id: number } | null>(null);

  const begin = () => {
    dissolve.start(href);
  };

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    begin();
  };

  const onPointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    tap.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerUp = (event: PointerEvent<HTMLAnchorElement>) => {
    const start = tap.current;
    tap.current = null;
    if (!start || start.id !== event.pointerId) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP_PX) return;
    event.preventDefault();
    begin();
  };

  const onPointerCancel = () => {
    tap.current = null;
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="product-card relative block no-underline hover:no-underline"
      style={forceWhiteStyle}
    >
      <WhiteSurfaceFill />
      <div className="product-stage relative aspect-square overflow-hidden">
        <WhiteSurfaceFill />
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
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-contain object-center"
            aria-hidden
          />
        </div>
      </div>
      <div className="mt-3 text-left">
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
