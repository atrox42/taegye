import type { Metadata } from "next";
import { Suspense } from "react";

import { NewCatalog } from "@/components/new-catalog";
import { forceWhiteStyle } from "@/lib/force-white";

export const metadata: Metadata = {
  title: "New",
};

export default function NewPage() {
  return (
    <div className="site-page new-page site-gutter pt-4 pb-24 sm:pt-20 sm:pb-28" style={forceWhiteStyle}>
      <h1 className="site-type mb-6 sm:mb-8">New</h1>
      <Suspense>
        <NewCatalog />
      </Suspense>
    </div>
  );
}
