"use client";

import { ProductDisclosure } from "@/components/product-disclosure";

export function ProductDescription({ children }: { children: React.ReactNode }) {
  return (
    <ProductDisclosure label="Description" className="pdp-desc" bodyClassName="pdp-desc-body">
      {children}
    </ProductDisclosure>
  );
}
