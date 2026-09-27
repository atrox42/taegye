"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

function useDeviceHair() {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const update = () => setDpr(window.devicePixelRatio || 1);
    update();
    window.addEventListener("resize", update);
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener?.("change", update);
    };
  }, []);

  const strokeDev = 2;
  const stroke = strokeDev / dpr;
  const barDev = Math.round(11 * dpr);
  const gapDev = Math.max(1, Math.floor((barDev - strokeDev * 3) / 2));
  const tops = [
    0,
    (strokeDev + gapDev) / dpr,
    (strokeDev * 2 + gapDev * 2) / dpr,
  ];
  const height = (strokeDev * 3 + gapDev * 2) / dpr;

  return { stroke, tops, height, dpr };
}

export function InkBars({ className }: { className?: string }) {
  const { stroke, tops, height } = useDeviceHair();

  return (
    <span className={cn("site-ink-bars", className)} style={{ height }} aria-hidden>
      {tops.map((top) => (
        <span key={top} className="site-ink-crop" style={{ top, height: stroke }}>
          <span className="site-ink-fill" />
        </span>
      ))}
    </span>
  );
}

export function InkClose({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "white";
}) {
  const { stroke } = useDeviceHair();

  return (
    <span className={cn("site-ink-mark site-ink-x", tone === "white" && "is-white", className)} aria-hidden>
      <span className="site-ink-x-arm" style={{ height: stroke }}>
        <span className="site-ink-fill" />
      </span>
      <span className="site-ink-x-arm is-cross" style={{ height: stroke }}>
        <span className="site-ink-fill" />
      </span>
    </span>
  );
}

export function InkChevron({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <span className={cn("site-ink-mark site-ink-chevron", open && "is-open", className)} aria-hidden>
      <span className="site-ink-fill" />
    </span>
  );
}

export function InkHairline({ className }: { className?: string }) {
  return (
    <span className={cn("site-ink-hairline", className)} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- large gray JPEG crop survives Force Dark */}
      <img src="/line-e5.jpg" alt="" width={256} height={256} />
    </span>
  );
}
