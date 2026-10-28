"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
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
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const userMoved = useRef(false);
  const [page, setPage] = useState(1);
  const count = slides.length;

  const readIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const width = track.clientWidth;
    if (width <= 0) return 0;
    return Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / width)));
  }, [count]);

  const syncPage = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth;
    if (width <= 0) return;
    if (!userMoved.current && track.scrollLeft !== 0) track.scrollLeft = 0;
    const index = Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / width)));
    const nextPage = index + 1;
    setPage((prev) => (prev === nextPage ? prev : nextPage));
  }, [count]);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const width = track.clientWidth;
      if (width <= 0) return;
      const target = Math.min(count - 1, Math.max(0, index));
      userMoved.current = true;
      track.scrollTo({ left: target * width, behavior: "smooth" });
    },
    [count],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    syncPage();
    track.addEventListener("scroll", syncPage, { passive: true });
    window.addEventListener("resize", syncPage);
    const ro = new ResizeObserver(syncPage);
    ro.observe(track);
    const imgs = track.querySelectorAll("img");
    imgs.forEach((img) => img.addEventListener("load", syncPage));
    return () => {
      track.removeEventListener("scroll", syncPage);
      window.removeEventListener("resize", syncPage);
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", syncPage));
    };
  }, [syncPage, count]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    drag.current = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, moved: false };
    track.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state || !track || event.pointerId !== state.id) return;
    const dx = event.clientX - state.x;
    if (Math.abs(dx) > 6) state.moved = true;
    if (state.moved) track.scrollLeft = state.left - dx;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    drag.current = null;
    suppressClick.current = state.moved;
    if (state.moved) {
      userMoved.current = true;
      const track = trackRef.current;
      if (!track) return;
      const width = track.clientWidth;
      if (width <= 0) return;
      const index = Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / width)));
      track.scrollTo({ left: index * width, behavior: "smooth" });
    }
  };

  const onTrackClick = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    const track = trackRef.current;
    if (!track || track.scrollWidth <= track.clientWidth + 2) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const forward = event.clientX - rect.left >= rect.width * 0.5;
    goTo(readIndex() + (forward ? 1 : -1));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(readIndex() + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(readIndex() - 1);
    }
  };

  const thumb = count > 1 ? `${100 / count}%` : "100%";

  return (
    <div className="pdp-gallery pdp-mobile-gallery" style={forceWhiteStyle}>
      <WhiteSurfaceFill className="pdp-gallery-plate" />
      <div
        ref={trackRef}
        className="pdp-gallery-track"
        data-gallery-scroller="true"
        tabIndex={count > 1 ? 0 : undefined}
        aria-label={count > 1 ? "Product images" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onTrackClick}
        onKeyDown={onKeyDown}
      >
        {slides.map((slide, index) => (
          <div key={index} className="pdp-gallery-slide" style={forceWhiteStyle}>
            <WhiteSurfaceFill />
            {slide}
          </div>
        ))}
      </div>
      {count > 1 ? (
        <div className="pdp-gallery-meta">
          <p className="pdp-gallery-index site-type" aria-live="polite">
            {page} / {count}
          </p>
          <div className="pdp-gallery-meter" aria-hidden="true">
            <span
              className="pdp-gallery-meter-thumb"
              style={{ width: thumb, transform: `translateX(${(page - 1) * 100}%)` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
