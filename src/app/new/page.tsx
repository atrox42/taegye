import type { Metadata } from "next";

import { NewCatalog } from "@/components/new-catalog";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";
import { NEW_DESCRIPTION, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Product",
  description: NEW_DESCRIPTION,
  path: "/new",
});

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; tile?: string; tex?: string; moss?: string }>;
}) {
  const query = await searchParams;
  return (
    <div className="site-page new-page site-gutter" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <NewCatalog query={query} />
    </div>
  );
}
