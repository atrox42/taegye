"use client";

import Image from "next/image";
import { useState } from "react";

import type { NewProduct } from "@/lib/site";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: NewProduct;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [moss, setMoss] = useState(false);

  return (
    <article
      className={cn("product-card cursor-pointer", moss && "is-moss")}
      onClick={() => {
        if (window.matchMedia("(hover: none)").matches) {
          setMoss((value) => !value);
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={product.emptySrc}
          alt={product.emptyAlt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 25vw, 50vw"
          className="product-img-empty object-contain object-center"
        />
        <Image
          src={product.mossSrc}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 768px) 25vw, 50vw"
          className="product-img-moss object-contain object-center"
        />
      </div>
      <p className="mt-3 text-left text-[11px] leading-5 tracking-[0.04em] text-foreground">
        {product.name}
      </p>
    </article>
  );
}
