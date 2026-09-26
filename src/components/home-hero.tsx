"use client";

import { useEffect, useState } from "react";

import { forceWhiteStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";
import { HERO_CLIP, HERO_CLIPS } from "@/lib/site";
import { cn } from "@/lib/utils";

type Slot = { top: string; left: string };

/** Desktop-only scatter presets — 230×130 clips, clear of the nav, no overlap. */
export const HERO_LAYOUT_PRESETS: Slot[][] = [
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

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function HomeHero() {
  const [placed, setPlaced] = useState<{ slots: Slot[] | null; order: number[] } | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) {
      setPlaced({ slots: null, order: [0, 1, 2] });
      return;
    }
    const raw = new URLSearchParams(window.location.search).get("layout");
    const parsed = raw === null ? Number.NaN : Number(raw);
    const index = Number.isInteger(parsed)
      ? ((parsed % HERO_LAYOUT_PRESETS.length) + HERO_LAYOUT_PRESETS.length) % HERO_LAYOUT_PRESETS.length
      : Math.floor(Math.random() * HERO_LAYOUT_PRESETS.length);
    setPlaced({
      slots: HERO_LAYOUT_PRESETS.at(index) ?? HERO_LAYOUT_PRESETS[0],
      order: shuffle([0, 1, 2]),
    });
  }, []);

  return (
    <section className={cn("home-hero", placed && "is-placed")} aria-label="TAEGYE" style={forceWhiteStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS paint; raster stays white */}
      <img
        src={WHITE_BITMAP_SRC}
        alt=""
        aria-hidden
        className="home-hero-bitmap"
      />
      {HERO_CLIPS.map((clip, index) => {
        const slot = placed?.slots?.[placed.order[index]];
        return (
          <div
            key={clip.id}
            className={`home-hero-clip home-hero-clip-${clip.id}`}
            style={slot ? { top: slot.top, left: slot.left, right: "auto" } : undefined}
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
