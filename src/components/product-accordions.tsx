"use client";

import { ProductDisclosure } from "@/components/product-disclosure";
import { StoreMention } from "@/components/store-mention";
import { STAND_ACCORDION } from "@/lib/site";

export function ProductAccordions() {
  return (
    <div className="pdp-accordions">
      {STAND_ACCORDION.map((item) => (
        <ProductDisclosure key={item.label} label={item.label}>
          <p className="site-type-copy site-type">
            <StoreMention text={item.body} />
          </p>
        </ProductDisclosure>
      ))}
    </div>
  );
}
