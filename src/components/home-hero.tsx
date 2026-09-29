"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";
import {
  parseHeroScales,
  placeScaledClips,
  type HeroScaleTriple,
  type HeroSlot,
} from "@/lib/hero-scale";
import { HERO_CLIP, HERO_CLIPS } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Desktop-only scatter presets — 230×130 clips, clear of the nav, no overlap. */
export const HERO_LAYOUT_PRESETS: HeroSlot[][] = [
  [
    { top: "19%", left: "12%" },
    { top: "28%", left: "71%" },
    { top: "56%", left: "39%" },
  ],
  [
    { top: "14%", left: "8%" },
    { top: "22%", left: "68%" },
    { top: "60%", left: "30%" },
  ],
  [
    { top: "16%", left: "62%" },
    { top: "34%", left: "10%" },
    { top: "58%", left: "44%" },
  ],
  [
    { top: "15%", left: "22%" },
    { top: "18%", left: "70%" },
    { top: "55%", left: "48%" },
  ],
  [
    { top: "14%", left: "58%" },
    { top: "46%", left: "8%" },
    { top: "62%", left: "54%" },
  ],
  [
    { top: "20%", left: "6%" },
    { top: "42%", left: "40%" },
    { top: "18%", left: "72%" },
  ],
  [
    { top: "24%", left: "16%" },
    { top: "14%", left: "64%" },
    { top: "58%", left: "34%" },
  ],
];

export function HomeHero({ scales }: { scales: HeroScaleTriple }) {
  const heroRef = useRef<HTMLElement>(null);
  const layoutIndexRef = useRef<number | null>(null);
  const [slots, setSlots] = useState<HeroSlot[] | null>(null);

  useLayoutEffect(() => {
    const desktopMq = window.matchMedia("(min-width: 768px)");

    const resolveIndex = () => {
      if (layoutIndexRef.current !== null) return layoutIndexRef.current;
      const raw = new URLSearchParams(window.location.search).get("layout");
      const parsed = raw === null ? Number.NaN : Number(raw);
      const index = Number.isInteger(parsed)
        ? ((parsed % HERO_LAYOUT_PRESETS.length) + HERO_LAYOUT_PRESETS.length) %
          HERO_LAYOUT_PRESETS.length
        : Math.floor(Math.random() * HERO_LAYOUT_PRESETS.length);
      layoutIndexRef.current = index;
      return index;
    };

    const place = () => {
      const params = new URLSearchParams(window.location.search);
      const resolved = parseHeroScales(params.get("scales")) ?? scales;
      if (!desktopMq.matches) {
        setSlots(null);
        return;
      }
      const preset = HERO_LAYOUT_PRESETS.at(resolveIndex()) ?? HERO_LAYOUT_PRESETS[0];
      const box = heroRef.current?.getBoundingClientRect();
      // A 0×0 hero box would clamp every clip to pad (24,56) — the top-left pile.
      const vw = box && box.width >= 200 ? box.width : window.innerWidth;
      const vh = box && box.height >= 200 ? box.height : window.innerHeight;
      if (vw < 200 || vh < 200) return;
      setSlots(placeScaledClips(resolved, vw, vh, preset));
    };

    place();
    const node = heroRef.current;
    const ro = new ResizeObserver(place);
    if (node) ro.observe(node);
    window.addEventListener("resize", place);
    desktopMq.addEventListener("change", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
      desktopMq.removeEventListener("change", place);
    };
  }, [scales]);

  return (
    <section
      ref={heroRef}
      className={cn("home-hero", slots && "is-placed")}
      aria-label="TAEGYE"
      data-hero-scales={scales.join(",")}
      data-hero-mobile-equal="1"
      style={forceWhiteStyle}
    >
      <WhiteSurfaceFill />
      {HERO_CLIPS.map((clip, index) => {
        const scale = scales[index];
        const slot = slots?.[index];
        return (
          <div
            key={clip.id}
            className={`home-hero-clip home-hero-clip-${clip.id}`}
            data-hero-scale={String(scale)}
            style={{
              ["--hero-scale" as string]: String(scale),
              ...(slot ? { top: slot.top, left: slot.left, right: "auto" } : null),
            }}
          >
            <video
              className="home-hero-media"
              width={HERO_CLIP.width}
              height={HERO_CLIP.height}
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              disablePictureInPicture
              preload="auto"
              poster={clip.poster}
            >
              <source src={clip.src} type="video/mp4" />
            </video>
          </div>
        );
      })}
    </section>
  );
}
