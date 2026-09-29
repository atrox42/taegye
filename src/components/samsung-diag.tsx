"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { CANVAS_WHITE, PAGE_WHITE_CANVAS_ID, paintOpaqueWhite } from "@/lib/canvas-white";
import { DIM_BLACK_PNG_SRC, WHITE_BITMAP_SRC } from "@/lib/force-white";

const PRODUCT_PNG = "/products/stand-silver-moss.webp";
const WHITE_PNG = "/bg-white.png";

type LayerRow = {
  tag: string;
  id: string;
  className: string;
  pos: string;
  z: string;
  opacity: string;
  mix: string;
  filter: string;
  backdrop: string;
  size: string;
};

type Readback = {
  ok: boolean;
  text: string;
};

function Swatch({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: "2px solid #111",
        minHeight: 120,
        position: "relative",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "6px 8px",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#111",
          background: "rgba(255,255,0,0.85)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ProductOn({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", height: "100%", minHeight: 120 }}>
      {children}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PRODUCT_PNG}
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          top: 28,
          transform: "translateX(-50%)",
          width: 72,
          height: 72,
          objectFit: "contain",
          zIndex: 1,
        }}
      />
    </div>
  );
}

function WhiteCanvasFill() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const paint = () => {
      const w = parent?.clientWidth || 80;
      const h = parent?.clientHeight || 120;
      paintOpaqueWhite(canvas, w, h);
    };
    paint();
    const ro = parent ? new ResizeObserver(paint) : null;
    if (parent) ro?.observe(parent);
    return () => ro?.disconnect();
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

export function SamsungDiag() {
  const [ua, setUa] = useState("…");
  const [scheme, setScheme] = useState("…");
  const [forced, setForced] = useState("…");
  const [readback, setReadback] = useState<Readback>({ ok: false, text: "…" });
  const [scroll, setScroll] = useState("…");
  const [layers, setLayers] = useState<LayerRow[]>([]);
  const [flags, setFlags] = useState("…");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setUa(navigator.userAgent);
    setScheme(media.matches ? "dark" : "light");
    const html = document.documentElement;
    const body = document.body;
    setForced(
      [
        `html.cs=${getComputedStyle(html).colorScheme}`,
        `body.cs=${getComputedStyle(body).colorScheme}`,
        `html.bg=${getComputedStyle(html).backgroundColor}`,
        `body.bg=${getComputedStyle(body).backgroundColor}`,
        `promo=${html.dataset.promo || "none"}`,
        `intro=${html.dataset.intro || "none"}`,
        `promoOpen=${html.classList.contains("is-promo-open") ? "yes" : "no"}`,
        `splash=${getComputedStyle(document.querySelector(".site-splash") || html).display}`,
        `promoEl=${document.querySelector(".site-promo") ? "in-dom" : "absent"}`,
        `dimImg=${document.querySelector(".site-promo-dim-bitmap") ? "in-dom" : "absent"}`,
        `dissolve=${document.querySelector(".grid-dissolve-canvas") ? "in-dom" : "absent"}`,
        `pageCanvas=${document.getElementById(PAGE_WHITE_CANVAS_ID) ? "yes" : "no"}`,
      ].join(" · "),
    );

    const canvas = document.getElementById(PAGE_WHITE_CANVAS_ID);
    if (canvas instanceof HTMLCanvasElement) {
      try {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setReadback({ ok: false, text: "no 2d context" });
        } else {
          const x = Math.max(0, Math.floor(canvas.width / 2));
          const y = Math.max(0, Math.floor(canvas.height / 2));
          const d = ctx.getImageData(x, y, 1, 1).data;
          const white = d[0] >= 250 && d[1] >= 250 && d[2] >= 250 && d[3] >= 250;
          setReadback({
            ok: white,
            text: `rgb(${d[0]},${d[1]},${d[2]},${d[3]}) ${canvas.width}x${canvas.height} ${white ? "WHITE" : "NOT WHITE"}`,
          });
        }
      } catch (error) {
        setReadback({ ok: false, text: `readback error: ${String(error)}` });
      }
    } else {
      setReadback({ ok: false, text: "missing #taegye-page-white" });
    }

    const collect = () => {
      const rows: LayerRow[] = [];
      document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" && cs.position !== "sticky") return;
        if (cs.display === "none" || cs.visibility === "hidden") return;
        rows.push({
          tag: el.tagName.toLowerCase(),
          id: el.id,
          className: String(el.className || "").slice(0, 42),
          pos: cs.position,
          z: cs.zIndex,
          opacity: cs.opacity,
          mix: cs.mixBlendMode,
          filter: cs.filter,
          backdrop: cs.backdropFilter || (cs as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter || "none",
          size: `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`,
        });
      });
      setLayers(rows);
      setScroll(
        `y=${Math.round(window.scrollY)} inner=${window.innerHeight} doc=${document.documentElement.scrollHeight} vv=${Math.round(window.visualViewport?.height ?? 0)}`,
      );
    };
    collect();
    const onScroll = () => collect();
    window.addEventListener("scroll", onScroll, { passive: true });
    setFlags(
      `canvases=${document.querySelectorAll("canvas").length} mixNonNormal=${[...document.querySelectorAll("body *")].filter((el) => getComputedStyle(el).mixBlendMode !== "normal").length} opacityLt1=${[...document.querySelectorAll("body *")].filter((el) => Number(getComputedStyle(el).opacity) < 1 && getComputedStyle(el).display !== "none").length}`,
    );
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main
      className="site-page site-gutter"
      style={{
        position: "relative",
        zIndex: 1,
        padding: "4.5rem 12px 48px",
        color: "#111",
        fontSize: 18,
        lineHeight: 1.35,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, margin: "0 0 12px", letterSpacing: 0 }}>SAMSUNG DIAG</h1>
      <p style={{ margin: "0 0 8px", fontWeight: 700 }}>UA</p>
      <p style={{ margin: "0 0 16px", fontSize: 15, wordBreak: "break-all" }}>{ua}</p>
      <p style={{ margin: "0 0 8px", fontWeight: 700 }}>prefers-color-scheme: {scheme}</p>
      <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
        page canvas readback:{" "}
        <span style={{ color: readback.ok ? "#0a0" : "#c00" }}>{readback.text}</span>
      </p>
      <p style={{ margin: "0 0 8px", fontSize: 15 }}>{forced}</p>
      <p style={{ margin: "0 0 8px", fontSize: 15 }}>{flags}</p>
      <p style={{ margin: "0 0 16px", fontWeight: 700 }}>scroll {scroll}</p>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px" }}>White techniques</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Swatch label="1 CSS #FFF">
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }} />
        </Swatch>
        <Swatch label="2 opaque JPG">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WHITE_BITMAP_SRC} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </Swatch>
        <Swatch label="3 PNG">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WHITE_PNG} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </Swatch>
        <Swatch label="4 inline SVG">
          <svg viewBox="0 0 10 10" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <rect width="10" height="10" fill="#FFFFFF" />
          </svg>
        </Swatch>
        <Swatch label="5 canvas">
          <WhiteCanvasFill />
        </Swatch>
        <Swatch label="6 canvas+CSS">
          <WhiteCanvasFill />
          <div style={{ position: "absolute", inset: 0, background: "transparent", opacity: 1, mixBlendMode: "normal" }} />
        </Swatch>
      </div>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px" }}>Product PNG on each</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Swatch label="P1 CSS">
          <ProductOn>
            <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }} />
          </ProductOn>
        </Swatch>
        <Swatch label="P2 JPG">
          <ProductOn>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WHITE_BITMAP_SRC} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </ProductOn>
        </Swatch>
        <Swatch label="P3 PNG">
          <ProductOn>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WHITE_PNG} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </ProductOn>
        </Swatch>
        <Swatch label="P4 SVG">
          <ProductOn>
            <svg viewBox="0 0 10 10" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <rect width="10" height="10" fill="#FFFFFF" />
            </svg>
          </ProductOn>
        </Swatch>
        <Swatch label="P5 canvas">
          <ProductOn>
            <WhiteCanvasFill />
          </ProductOn>
        </Swatch>
        <Swatch label="P6 canvas+CSS">
          <ProductOn>
            <WhiteCanvasFill />
            <div style={{ position: "absolute", inset: 0, background: "transparent" }} />
          </ProductOn>
        </Swatch>
      </div>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px" }}>Compare overlays</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Swatch label="dim-black PNG">
          <WhiteCanvasFill />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={DIM_BLACK_PNG_SRC} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill" }} />
        </Swatch>
        <Swatch label="CSS 40% black">
          <WhiteCanvasFill />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        </Swatch>
        <Swatch label={`brand ${CANVAS_WHITE} vs #6F5C82`}>
          <div style={{ position: "absolute", inset: 0, background: "#6F5C82" }} />
        </Swatch>
        <Swatch label="View product replica">
          <div style={{ position: "absolute", inset: 0, background: "#6F5C82" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/purple-6F5C82.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "relative", zIndex: 1, color: "#fff", textAlign: "center", paddingTop: 48, fontWeight: 700 }}>View product</div>
        </Swatch>
      </div>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px" }}>Fixed / sticky layers</h2>
      <div style={{ fontSize: 14, lineHeight: 1.35 }}>
        {layers.length === 0 ? <p>none visible</p> : null}
        {layers.map((row, index) => (
          <p key={`${row.tag}-${index}`} style={{ margin: "0 0 8px", wordBreak: "break-word" }}>
            {row.tag}#{row.id || "—"} .{row.className || "—"}
            <br />
            {row.pos} z={row.z} op={row.opacity} mix={row.mix} filter={row.filter} backdrop={row.backdrop} {row.size}
          </p>
        ))}
      </div>
    </main>
  );
}
