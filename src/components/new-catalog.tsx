"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { forceWhiteStyle } from "@/lib/force-white";
import {
  DEFAULT_NEW_CATEGORY,
  GRID_TEXTURE_SLOT_MAX,
  GRID_TEXTURE_SLOT_MIN,
  GRID_TEXTURE_SRCS,
  NEW_CATEGORIES,
  NEW_PRODUCTS,
  type NewCategoryId,
  type NewProduct,
} from "@/lib/site";
import { cn } from "@/lib/utils";

function isNewCategory(value: string | null): value is NewCategoryId {
  return NEW_CATEGORIES.some((category) => category.id === value);
}

type CatalogEntry =
  | { type: "product"; product: NewProduct }
  | { type: "texture"; src: string };

function catalogEntries(
  products: NewProduct[],
  placement: { slot: number; src: string } | null,
): CatalogEntry[] {
  if (!placement) {
    return products.map((product) => ({ type: "product" as const, product }));
  }

  const entries: CatalogEntry[] = [];
  let next = 0;
  const total = products.length + 1;
  for (let slot = 1; slot <= total; slot += 1) {
    if (slot === placement.slot) {
      entries.push({ type: "texture", src: placement.src });
    } else if (next < products.length) {
      entries.push({ type: "product", product: products[next] });
      next += 1;
    }
  }
  return entries;
}

function pickTextureSlot(productCount: number, requested?: number) {
  const maxSlot = Math.min(GRID_TEXTURE_SLOT_MAX, productCount + 1);
  const minSlot = Math.min(GRID_TEXTURE_SLOT_MIN, maxSlot);
  if (productCount < 1 || maxSlot < minSlot) return null;
  if (requested !== undefined && Number.isInteger(requested)) {
    return Math.min(maxSlot, Math.max(minSlot, requested));
  }
  return minSlot + Math.floor(Math.random() * (maxSlot - minSlot + 1));
}

export function NewCatalog() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("cat");
  const active: NewCategoryId = isNewCategory(raw) ? raw : DEFAULT_NEW_CATEGORY;
  const [placement, setPlacement] = useState<{ slot: number; src: string } | null>(null);

  const products = useMemo(() => {
    if (active === "all") return NEW_PRODUCTS;
    return NEW_PRODUCTS.filter((product) => product.category === active);
  }, [active]);

  useEffect(() => {
    const rawTile = searchParams.get("tile");
    const requested = rawTile === null ? Number.NaN : Number(rawTile);
    const slot = pickTextureSlot(products.length, Number.isInteger(requested) ? requested : undefined);
    if (slot === null) {
      setPlacement(null);
      return;
    }
    const src = GRID_TEXTURE_SRCS[Math.floor(Math.random() * GRID_TEXTURE_SRCS.length)];
    setPlacement({ slot, src });
  }, [products.length, searchParams]);

  const entries = useMemo(() => catalogEntries(products, placement), [products, placement]);

  return (
    <>
      <nav aria-label="Product categories" className="new-subnav">
        {NEW_CATEGORIES.map((category) => {
          const isActive = category.id === active;
          const href =
            category.id === DEFAULT_NEW_CATEGORY ? "/new" : `/new?cat=${category.id}`;
          return (
            <Link
              key={category.id}
              href={href}
              scroll={false}
              className={`site-type new-subnav-item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>

      {products.length > 0 ? (
        <ul className={cn("new-grid", placement && "is-placed")} style={forceWhiteStyle}>
          {entries.map((entry, index) =>
            entry.type === "texture" ? (
              <li key="grid-texture" className="new-grid-item new-grid-item-texture">
                {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed raster tile */}
                <img src={entry.src} alt="" aria-hidden className="new-grid-texture-media" />
              </li>
            ) : (
              <li key={entry.product.id} className="new-grid-item" style={forceWhiteStyle}>
                <ProductCard product={entry.product} priority={index < 4} />
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="site-type new-empty">coming soon</p>
      )}
    </>
  );
}
