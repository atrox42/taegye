import type { Metadata } from "next";
import { Suspense } from "react";

import { NewCatalog } from "@/components/new-catalog";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";

export const metadata: Metadata = {
  title: "Product",
};

export default function NewPage() {
  return (
    <div className="site-page new-page site-gutter pt-5 sm:pt-16" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <Suspense>
        <NewCatalog />
      </Suspense>
    </div>
  );
}
