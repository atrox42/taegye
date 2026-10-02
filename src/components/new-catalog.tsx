"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { GridLines } from "@/components/grid-lines";
import { ProductCard } from "@/components/product-card";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
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
import { forceWhiteStyle } from "@/lib/force-white";
import { cn } from "@/lib/utils";

function isNewCategory(value: string | null): value is NewCategoryId {
  return NEW_CATEGORIES.some((category) => category.id === value);
}

type CatalogEntry =
  | { type: "product"; product: NewProduct }
  | { type: "texture"; src: string }
  | { type: "filler" };

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
    if (active === "all") {
      setPlacement(null);
      return;
    }
    const rawTile = searchParams.get("tile");
    const requested = rawTile === null ? Number.NaN : Number(rawTile);
    const slot = pickTextureSlot(products.length, Number.isInteger(requested) ? requested : undefined);
    if (slot === null) {
      setPlacement(null);
      return;
    }
    const rawTex = searchParams.get("tex");
    const pinned = rawTex
      ? GRID_TEXTURE_SRCS.find((src) => src.endsWith(`/${rawTex}.webp`))
      : undefined;
    const rawMoss = searchParams.get("moss");
    const moss = rawMoss === null ? Number.NaN : Number(rawMoss);
    const src =
      pinned ??
      (Number.isInteger(moss)
        ? GRID_TEXTURE_SRCS[((moss - 1) % GRID_TEXTURE_SRCS.length + GRID_TEXTURE_SRCS.length) % GRID_TEXTURE_SRCS.length]
        : GRID_TEXTURE_SRCS[Math.floor(Math.random() * GRID_TEXTURE_SRCS.length)]);
    setPlacement({ slot, src });
  }, [active, products.length, searchParams]);

  const entries = useMemo(() => catalogEntries(products, placement), [products, placement]);
  const gridRef = useRef<HTMLUListElement>(null);
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setCols(mq.matches ? 4 : 2);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const cells = useMemo(() => {
    const extra = (cols - (entries.length % cols)) % cols;
    return extra ? [...entries, ...Array.from({ length: extra }, () => ({ type: "filler" as const }))] : entries;
  }, [entries, cols]);

  return (
    <>
      <nav aria-label="Product categories" className="new-subnav" style={forceWhiteStyle}>
        <WhiteSurfaceFill />
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
        <div className="new-grid-wrap" style={forceWhiteStyle}>
          <WhiteSurfaceFill />
          <ul ref={gridRef} className={cn("new-grid", placement && "is-placed")}>
            {cells.map((entry, index) =>
              entry.type === "texture" ? (
                <li key="grid-texture" className="new-grid-item new-grid-item-texture">
                  {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed raster tile */}
                  <img src={entry.src} alt="" aria-hidden className="new-grid-texture-media" />
                </li>
              ) : entry.type === "filler" ? (
                <li key={`grid-filler-${index}`} className="new-grid-item new-grid-item-filler" aria-hidden>
                  <WhiteSurfaceFill />
                </li>
              ) : (
                <li key={entry.product.id} className="new-grid-item" style={forceWhiteStyle}>
                  <WhiteSurfaceFill />
                  <ProductCard product={entry.product} priority={index < 4} />
                </li>
              ),
            )}
          </ul>
          <GridLines gridRef={gridRef} revision={cells.length} />
        </div>
      ) : (
        <p className="site-type new-empty">coming soon</p>
      )}
    </>
  );
}
