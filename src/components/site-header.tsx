"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { forceWhiteStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";
import { NAV_ITEMS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header pointer-events-none fixed top-3 right-3 left-3 z-50 w-auto max-w-none md:inset-x-0 md:top-0 md:right-0 md:left-0 md:w-full">
      <nav
        aria-label="Primary"
        className="site-nav pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-lg px-2.5 py-2.5 shadow-[0_2px_16px_rgba(0,0,0,0.12)] md:justify-start md:gap-x-3.5 md:overflow-visible md:rounded-none md:px-6 md:py-5 md:shadow-none"
        style={forceWhiteStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts next/image wrappers */}
        <img
          src={WHITE_BITMAP_SRC}
          alt=""
          aria-hidden
          className="site-nav-bitmap pointer-events-none absolute inset-0 h-full w-full object-cover md:hidden"
        />
        {NAV_ITEMS.map((item) => {
          const isExternal = "external" in item && item.external;
          const isActive =
            !isExternal &&
            (item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));

          const className = cn(
            "relative z-10 min-w-0 flex-1 text-center text-[10px] lowercase leading-none tracking-[0.08em] no-underline hover:no-underline focus:no-underline active:no-underline md:flex-none md:text-left md:text-[11px] md:tracking-[0.14em]",
            isActive ? "font-medium" : "font-normal"
          );

          const style = { color: isActive ? "#111111" : "#999999" };

          if (isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                style={style}
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
              style={style}
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
