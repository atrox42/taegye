import type { Metadata } from "next";
import { Suspense } from "react";

import { NewCatalog } from "@/components/new-catalog";

export const metadata: Metadata = {
  title: "Product",
};

export default function NewPage() {
  return (
    <div className="site-page new-page site-gutter">
      <Suspense>
        <NewCatalog />
      </Suspense>
    </div>
  );
}
