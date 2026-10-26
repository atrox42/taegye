"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";

type PdpGalleryProps = {
  slides: ReactNode[];
};

export function PdpGallery({ slides }: PdpGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const userMoved = useRef(false);
  const [page, setPage] = useState(1);
  const count = slides.length;

  const snapIdle = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth;
    if (width <= 0) return;
    if (!userMoved.current && track.scrollLeft !== 0) {
      track.scrollLeft = 0;
    }
    const total = track.querySelectorAll(":scope > .pdp-gallery-slide").length || 1;
    const index = Math.round(track.scrollLeft / width);
    setPage(Math.min(total, Math.max(1, index + 1)));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    snapIdle();
    track.addEventListener("scroll", snapIdle, { passive: true });
    window.addEventListener("resize", snapIdle);
    const ro = new ResizeObserver(snapIdle);
    ro.observe(track);
    const imgs = track.querySelectorAll("img");
    imgs.forEach((img) => img.addEventListener("load", snapIdle));
    return () => {
      track.removeEventListener("scroll", snapIdle);
      window.removeEventListener("resize", snapIdle);
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", snapIdle));
    };
  }, [snapIdle, count]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY };
    userMoved.current = true;
  };

  const onTrackClick = (event: MouseEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const width = rect.width;
    if (width <= 0) return;
    const total = track.querySelectorAll(":scope > .pdp-gallery-slide").length;
    const current = Math.round(track.scrollLeft / width);
    const forward = event.clientX - rect.left >= width * 0.5;
    const target = forward ? Math.min(total - 1, current + 1) : Math.max(0, current - 1);
    userMoved.current = true;
    track.scrollTo({ left: target * width, behavior: "smooth" });
  };

  return (
    <div className="pdp-gallery pdp-mobile-gallery" style={forceWhiteStyle}>
      <WhiteSurfaceFill className="pdp-gallery-plate" />
      <div
        ref={trackRef}
        className="pdp-gallery-track"
        data-gallery-scroller="true"
        onPointerDown={onPointerDown}
        onClick={onTrackClick}
      >
        {slides.map((slide, index) => (
          <div key={index} className="pdp-gallery-slide" style={forceWhiteStyle}>
            <WhiteSurfaceFill />
            {slide}
          </div>
        ))}
      </div>
      {count > 1 ? (
        <p className="pdp-gallery-index site-type" aria-live="polite">
          {page} / {count}
        </p>
      ) : null}
    </div>
  );
}
