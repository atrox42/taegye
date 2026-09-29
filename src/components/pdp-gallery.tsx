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
  empty: ReactNode;
  moss: ReactNode;
};

export function PdpGallery({ empty, moss }: PdpGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const userMoved = useRef(false);
  const [page, setPage] = useState(1);

  const snapIdle = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth;
    if (width <= 0) return;
    if (!userMoved.current && track.scrollLeft !== 0) {
      track.scrollLeft = 0;
    }
    setPage(track.scrollLeft >= width * 0.5 ? 2 : 1);
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
  }, [snapIdle]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY };
    userMoved.current = true;
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
    userMoved.current = true;
    track.scrollTo({ left: next ? rect.width : 0, behavior: "smooth" });
  };

  return (
    <div className="pdp-gallery" style={forceWhiteStyle}>
      <WhiteSurfaceFill className="pdp-gallery-plate" />
      <div
        ref={trackRef}
        className="pdp-gallery-track"
        data-gallery-scroller="true"
        onPointerDown={onPointerDown}
        onClick={onTrackClick}
      >
        <div className="pdp-gallery-slide" style={forceWhiteStyle}>
          <WhiteSurfaceFill />
          {empty}
        </div>
        <div className="pdp-gallery-slide" style={forceWhiteStyle}>
          <WhiteSurfaceFill />
          {moss}
        </div>
      </div>
      <p className="pdp-gallery-index site-type" aria-live="polite">
        {page} / 2
      </p>
    </div>
  );
}
