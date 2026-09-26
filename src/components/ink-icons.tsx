import { cn } from "@/lib/utils";

export function InkBars({ className }: { className?: string }) {
  return (
    <span className={cn("site-ink-bars", className)} aria-hidden>
      <span className="site-ink-crop">
        <span className="site-ink-fill" />
      </span>
      <span className="site-ink-crop">
        <span className="site-ink-fill" />
      </span>
      <span className="site-ink-crop">
        <span className="site-ink-fill" />
      </span>
    </span>
  );
}

export function InkClose({ className }: { className?: string }) {
  return (
    <span className={cn("site-ink-mark site-ink-x", className)} aria-hidden>
      <span className="site-ink-fill" />
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
