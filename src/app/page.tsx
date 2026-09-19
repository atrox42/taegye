import Image from "next/image";

import { forceWhiteStyle } from "@/lib/force-white";

const HERO_PANELS = [
  {
    src: "/hero-silver.webp",
    alt: "TAEGYE frosted acrylic stand",
  },
  {
    src: "/hero-black.webp",
    alt: "TAEGYE black stand",
  },
] as const;

export default function HomePage() {
  return (
    <section
      aria-label="Featured products"
      className="site-page grid grid-cols-1 md:grid-cols-2"
      style={forceWhiteStyle}
    >
      {HERO_PANELS.map((panel) => (
        <div
          key={panel.src}
          className="relative aspect-square md:aspect-auto md:min-h-svh"
          style={forceWhiteStyle}
        >
          <Image
            src={panel.src}
            alt={panel.alt}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain object-center"
          />
        </div>
      ))}
    </section>
  );
}
