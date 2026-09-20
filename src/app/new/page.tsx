import type { Metadata } from "next";
import { Suspense } from "react";

import { NewCatalog } from "@/components/new-catalog";
import { forceWhiteStyle } from "@/lib/force-white";

export const metadata: Metadata = {
  title: "Product",
};

export default function NewPage() {
  return (
    <div className="site-page new-page site-gutter pt-6 pb-24 sm:pt-20 sm:pb-28" style={forceWhiteStyle}>
      <Suspense>
        <NewCatalog />
      </Suspense>
    </div>
  );
}
