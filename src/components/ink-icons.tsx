import { cn } from "@/lib/utils";

export function InkBars({ className }: { className?: string }) {
  return (
    <span className={cn("site-ink-bars", className)} aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

export function InkClose({ className }: { className?: string }) {
  return (
    <span className={cn("site-ink-glyph", className)} aria-hidden>
      ×
    </span>
  );
}

export function InkChevron({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <span className={cn("site-ink-glyph site-ink-chevron", open && "is-open", className)} aria-hidden>
      ›
    </span>
  );
}
