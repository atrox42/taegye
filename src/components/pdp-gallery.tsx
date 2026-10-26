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

import { createPortal } from "react-dom";

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
  const [ratio, setRatio] = useState(0);
  const [railOn, setRailOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = slides.length;

  const snapIdle = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideNodes = [...track.querySelectorAll<HTMLElement>(":scope > .pdp-gallery-slide")];
    const total = slideNodes.length || 1;
    const horizontal = !window.matchMedia("(min-width: 768px)").matches;
    if (horizontal) {
      const width = track.clientWidth;
      if (width <= 0) return;
      if (!userMoved.current && track.scrollLeft !== 0) {
        track.scrollLeft = 0;
      }
      const index = Math.round(track.scrollLeft / width);
      const nextPage = Math.min(total, Math.max(1, index + 1));
      const nextRatio = total <= 1 ? 0 : (nextPage - 1) / (total - 1);
      setPage((prev) => (prev === nextPage ? prev : nextPage));
      setRatio((prev) => (Math.abs(prev - nextRatio) < 0.001 ? prev : nextRatio));
      setRailOn(false);
      return;
    }
    const first = slideNodes[0]?.getBoundingClientRect();
    const last = slideNodes[total - 1]?.getBoundingClientRect();
    if (!first || !last) return;
    const span = last.top - first.top;
    const anchor = Math.min(window.innerHeight * 0.28, 180);
    const nextRatio = span <= 1 ? 0 : Math.min(1, Math.max(0, (anchor - first.top) / span));
    const nextPage = Math.min(total, Math.max(1, Math.round(nextRatio * (total - 1)) + 1));
    const visible = slideNodes.some((slide) => {
      const rect = slide.getBoundingClientRect();
      return rect.bottom > 80 && rect.top < window.innerHeight - 40;
    });
    setPage((prev) => (prev === nextPage ? prev : nextPage));
    setRatio((prev) => (Math.abs(prev - nextRatio) < 0.001 ? prev : nextRatio));
    setRailOn(visible && total > 1);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    snapIdle();
    track.addEventListener("scroll", snapIdle, { passive: true });
    window.addEventListener("scroll", snapIdle, { passive: true });
    window.addEventListener("resize", snapIdle);
    const ro = new ResizeObserver(snapIdle);
    ro.observe(track);
    const imgs = track.querySelectorAll("img");
    imgs.forEach((img) => img.addEventListener("load", snapIdle));
    return () => {
      track.removeEventListener("scroll", snapIdle);
      window.removeEventListener("scroll", snapIdle);
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
    if (!track || track.scrollWidth <= track.clientWidth + 2) return;
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
      {mounted && count > 1
        ? createPortal(
            <div className={railOn ? "pdp-scroll-rail is-on" : "pdp-scroll-rail"} aria-hidden="true">
              <span
                className="pdp-scroll-rail-thumb"
                style={{
                  height: `${100 / count}%`,
                  transform: `translateY(${ratio * (count - 1) * 100}%)`,
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
