import type { Metadata } from "next";

import { ImageSlot } from "@/components/image-slot";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";

export const metadata: Metadata = {
  title: "Archive",
};

export default function ArchivePage() {
  return (
    <div className="site-page pt-4 sm:pt-16" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <h1 className="site-gutter py-4 text-[11px] font-normal tracking-[var(--tracking-label-lg)]">
        Archive
      </h1>
      <div className="new-grid archive-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="new-grid-item aspect-[4/5] min-h-[42vh] sm:min-h-[50vh]"
          >
            <ImageSlot label={`Archive image slot ${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
