import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { NEW_PRODUCTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "new",
};

export default function NewPage() {
  return (
    <div className="px-4 pt-16 pb-24 sm:px-6 sm:pt-20 sm:pb-28" style={{ backgroundColor: "#ffffff" }}>
      <h1 className="mb-8 text-[11px] font-normal lowercase tracking-[0.14em] sm:mb-10">
        new
      </h1>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
        {NEW_PRODUCTS.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
