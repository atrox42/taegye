import Image from "next/image";

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
      className="grid min-h-dvh grid-cols-1 md:grid-cols-2"
    >
      {HERO_PANELS.map((panel) => (
        <div
          key={panel.src}
          className="relative min-h-[50dvh] bg-[#f6f6f6] md:min-h-dvh"
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
