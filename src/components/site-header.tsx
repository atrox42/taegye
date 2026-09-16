"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 bg-transparent">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex items-center gap-x-2 px-5 py-4 sm:gap-x-3 sm:px-6 sm:py-5"
      >
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            !("external" in item && item.external) &&
            (item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));

          const className = cn(
            "text-[11px] font-normal lowercase leading-none tracking-[0.14em] text-foreground transition-opacity hover:opacity-50",
            isActive && "opacity-100",
            !isActive && "opacity-80"
          );

          const node =
            "external" in item && item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className={className}>
                {item.label}
              </Link>
            );

          return (
            <span key={item.label} className="flex items-center gap-x-2 sm:gap-x-3">
              {index > 0 ? (
                <span aria-hidden className="text-[11px] leading-none text-foreground/40">
                  ·
                </span>
              ) : null}
              {node}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
