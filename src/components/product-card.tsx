"use client";

import Image from "next/image";
import { useState } from "react";

import type { NewProduct } from "@/lib/site";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: NewProduct;
  priority?: boolean;
};

function hoverMedia() {
  return window.matchMedia("(hover: hover)").matches;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [moss, setMoss] = useState(false);

  return (
    <article
      className={cn("cursor-pointer")}
      onPointerEnter={() => {
        if (hoverMedia()) setMoss(true);
      }}
      onPointerLeave={() => {
        if (hoverMedia()) setMoss(false);
      }}
      onClick={() => {
        if (!hoverMedia()) setMoss((value) => !value);
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={product.emptySrc}
          alt={product.emptyAlt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-contain object-center transition-opacity duration-300"
          style={{ opacity: moss ? 0 : 1 }}
        />
        <Image
          src={product.mossSrc}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-contain object-center transition-opacity duration-300"
          style={{ opacity: moss ? 1 : 0 }}
          aria-hidden
        />
      </div>
      <p className="mt-3 text-left text-[11px] leading-5 tracking-[0.04em] text-foreground">
        {product.name}
      </p>
    </article>
  );
}
