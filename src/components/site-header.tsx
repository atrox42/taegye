"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { forceWhiteStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";
import { NAV_ITEMS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header pointer-events-none fixed z-50">
      <nav
        aria-label="Primary"
        className="site-nav pointer-events-auto relative flex w-full items-center justify-between"
        style={forceWhiteStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts next/image wrappers */}
        <img
          src={WHITE_BITMAP_SRC}
          alt=""
          aria-hidden
          className="site-nav-bitmap pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {NAV_ITEMS.map((item) => {
          const isExternal = "external" in item && item.external;
          const isActive =
            !isExternal &&
            (item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));

          const className = cn("site-nav-link site-type relative z-10", isActive && "is-active");

          if (isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {item.label}
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={className}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
