"use client";

import Image from "next/image";
import { useState } from "react";

import type { NewProduct } from "@/lib/site";

type ProductCardProps = {
  product: NewProduct;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [moss, setMoss] = useState(false);

  return (
    <article
      className="product-card cursor-pointer"
      data-moss={moss ? "on" : "off"}
      onMouseEnter={() => setMoss(true)}
      onMouseLeave={() => setMoss(false)}
      onClick={() => {
        if (!window.matchMedia("(hover: hover)").matches) {
          setMoss((value) => !value);
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <div className="product-empty absolute inset-0">
          <Image
            src={product.emptySrc}
            alt={product.emptyAlt}
            fill
            priority={priority}
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
      <p className="mt-3 text-left text-[11px] leading-5 tracking-[0.04em]" style={{ color: "#111111" }}>
        {product.name}
      </p>
      <p className="mt-1 text-left text-[11px] leading-5 tracking-[0.04em]" style={{ color: "#111111" }}>
        {product.price}
      </p>
    </article>
  );
}
