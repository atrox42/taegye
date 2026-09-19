"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("cat");
  const active: NewCategoryId = isNewCategory(raw) ? raw : DEFAULT_NEW_CATEGORY;

  const products = useMemo(
    () => NEW_PRODUCTS.filter((product) => product.category === active),
    [active]
  );

  return (
    <>
      <nav aria-label="New categories" className="new-subnav">
        {NEW_CATEGORIES.map((category) => {
          const isActive = category.id === active;
          return (
            <button
              key={category.id}
              type="button"
              className="new-subnav-item"
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                const next = new URLSearchParams(searchParams.toString());
                if (category.id === DEFAULT_NEW_CATEGORY) {
                  next.delete("cat");
                } else {
                  next.set("cat", category.id);
                }
                const query = next.toString();
                router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
              }}
            >
              {category.label}
            </button>
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
        <p className="new-empty">coming soon</p>
      )}
    </>
  );
}
