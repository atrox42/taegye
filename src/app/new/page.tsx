import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { forceWhiteStyle } from "@/lib/force-white";
import { NEW_PRODUCTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "new",
};

export default function NewPage() {
  return (
    <div className="site-page new-page site-gutter pt-4 pb-24 sm:pt-20 sm:pb-28" style={forceWhiteStyle}>
      <h1 className="mb-8 text-[11px] font-normal lowercase tracking-[0.14em] sm:mb-10">
        new
      </h1>
      <ul className="new-grid" style={forceWhiteStyle}>
        {NEW_PRODUCTS.map((product, index) => (
          <li key={product.id} className="new-grid-item" style={forceWhiteStyle}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
