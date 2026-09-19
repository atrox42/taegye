"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { StoreLabel } from "@/components/store-label";
import { NAV_ITEMS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 bg-transparent">
      <nav
        aria-label="Primary"
        className="site-nav pointer-events-auto mx-3 mt-3 flex items-center gap-x-2.5 rounded-lg px-3.5 py-2.5 shadow-[0_1px_10px_rgba(0,0,0,0.08)] md:mx-0 md:mt-0 md:rounded-none md:px-6 md:py-5 md:shadow-none"
      >
        {NAV_ITEMS.map((item, index) => {
          const isExternal = "external" in item && item.external;
          const isActive =
            !isExternal &&
            (item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));
          const isStore = item.label === "store";

          const className = cn(
            "text-[11px] font-normal lowercase leading-none tracking-[0.14em] no-underline",
            isActive && "underline underline-offset-4"
          );

          const label = isStore ? <StoreLabel /> : item.label;

          const node = isExternal ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              style={{ color: "#111111" }}
            >
              {label}
            </a>
          ) : (
            <Link href={item.href} className={className} style={{ color: "#111111" }}>
              {label}
            </Link>
          );

          return (
            <span key={item.label} className="flex items-center gap-x-2.5">
              {index > 0 ? (
                <span aria-hidden className="text-[11px] leading-none" style={{ color: "#111111" }}>
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
