"use client";

import { StoreMention } from "@/components/store-mention";
import { STAND_ACCORDION } from "@/lib/site";

export function ProductAccordions() {
  return (
    <div className="pdp-accordions">
      {STAND_ACCORDION.map((item) => (
        <details key={item.label} className="pdp-acc">
          <summary className="pdp-acc-summary site-type">
            <span>{item.label}</span>
            <span aria-hidden>+</span>
          </summary>
          <p className="pdp-acc-body site-type-copy site-type">
            <StoreMention text={item.body} />
          </p>
        </details>
      ))}
    </div>
  );
}
