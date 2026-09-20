"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { forceWhiteStyle } from "@/lib/force-white";
import {
  DEFAULT_NEW_CATEGORY,
  GRID_SLOT_AFTER_ID,
  GRID_SLOT_TEXTURE,
  NEW_CATEGORIES,
  NEW_PRODUCTS,
  type NewCategoryId,
  type NewProduct,
} from "@/lib/site";

function isNewCategory(value: string | null): value is NewCategoryId {
  return NEW_CATEGORIES.some((category) => category.id === value);
}

type CatalogEntry =
  | { type: "product"; product: NewProduct }
  | { type: "texture" };

function catalogEntries(products: NewProduct[]): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  for (const product of products) {
    entries.push({ type: "product", product });
    if (product.id === GRID_SLOT_AFTER_ID) {
      entries.push({ type: "texture" });
    }
  }
  return entries;
}

export function NewCatalog() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("cat");
  const active: NewCategoryId = isNewCategory(raw) ? raw : DEFAULT_NEW_CATEGORY;

  const products = useMemo(() => {
    if (active === "all") return NEW_PRODUCTS;
    return NEW_PRODUCTS.filter((product) => product.category === active);
  }, [active]);

  const entries = useMemo(() => catalogEntries(products), [products]);

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
              className="site-type new-subnav-item"
              aria-current={isActive ? "page" : undefined}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>

      {products.length > 0 ? (
        <ul className="new-grid" style={forceWhiteStyle}>
          {entries.map((entry, index) =>
            entry.type === "texture" ? (
              <li key="grid-texture" className="new-grid-item new-grid-item-texture">
                {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed raster tile */}
                <img
                  src={GRID_SLOT_TEXTURE}
                  alt=""
                  aria-hidden
                  className="new-grid-texture-media"
                />
              </li>
            ) : (
              <li key={entry.product.id} className="new-grid-item" style={forceWhiteStyle}>
                <ProductCard product={entry.product} priority={index < 4} />
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="site-type new-empty">coming soon</p>
      )}
    </>
  );
}
