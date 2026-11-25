import type { Metadata } from "next";

import { visibleLegalRows } from "@/lib/site";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";
import { LEGAL_DESCRIPTION, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Legal",
  description: LEGAL_DESCRIPTION,
  path: "/legal",
});

export default function LegalPage() {
  const rows = visibleLegalRows();
  return (
    <article className="site-page site-gutter pt-8 pb-24 sm:pt-24 sm:pb-32" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <h1 className="text-[11px] font-normal tracking-[var(--tracking-title)]">Legal</h1>
      <dl className="mt-12 max-w-xl space-y-4 text-[13px] leading-7 tracking-[var(--tracking-copy)]">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr]">
            <dt className="text-foreground/50">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
