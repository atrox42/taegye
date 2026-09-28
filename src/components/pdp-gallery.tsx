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

type PdpGalleryProps = {
  empty: ReactNode;
  moss: ReactNode;
};

export function PdpGallery({ empty, moss }: PdpGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [page, setPage] = useState(1);

  const syncPage = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth;
    if (width <= 0) return;
    setPage(track.scrollLeft >= width * 0.5 ? 2 : 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    syncPage();
    track.addEventListener("scroll", syncPage, { passive: true });
    window.addEventListener("resize", syncPage);
    return () => {
      track.removeEventListener("scroll", syncPage);
      window.removeEventListener("resize", syncPage);
    };
  }, [syncPage]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY };
  };

  const onTrackClick = (event: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(min-width: 768px)").matches) return;
    const start = pointer.current;
    pointer.current = null;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const next = event.clientX - rect.left >= rect.width * 0.5;
    track.scrollTo({ left: next ? rect.width : 0, behavior: "smooth" });
  };

  return (
    <div className="pdp-gallery">
      <div
        ref={trackRef}
        className="pdp-gallery-track"
        data-gallery-scroller="true"
        onPointerDown={onPointerDown}
        onClick={onTrackClick}
      >
        <div className="pdp-gallery-slide">
          {empty}
        </div>
        <div className="pdp-gallery-slide">
          {moss}
        </div>
      </div>
      <p className="pdp-gallery-index site-type" aria-live="polite">
        {page} / 2
      </p>
    </div>
  );
}
