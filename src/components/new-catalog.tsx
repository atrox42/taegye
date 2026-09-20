"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { forceWhiteStyle } from "@/lib/force-white";
import {
  DEFAULT_NEW_CATEGORY,
  NEW_CATEGORIES,
  NEW_PRODUCTS,
  type NewCategoryId,
} from "@/lib/site";

function isNewCategory(value: string | null): value is NewCategoryId {
  return NEW_CATEGORIES.some((category) => category.id === value);
}

export function NewCatalog() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("cat");
  const active: NewCategoryId = isNewCategory(raw) ? raw : DEFAULT_NEW_CATEGORY;

  const products = useMemo(() => {
    if (active === "all") return NEW_PRODUCTS;
    return NEW_PRODUCTS.filter((product) => product.category === active);
  }, [active]);

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
          {products.map((product, index) => (
            <li key={product.id} className="new-grid-item" style={forceWhiteStyle}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="site-type new-empty">coming soon</p>
      )}
    </>
  );
}
