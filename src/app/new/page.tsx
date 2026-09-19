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
      <ul className="new-grid grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12" style={forceWhiteStyle}>
        {NEW_PRODUCTS.map((product, index) => (
          <li key={product.id} className="new-grid-item" style={forceWhiteStyle}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
