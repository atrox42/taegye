"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed top-3 left-3 z-50 w-max md:inset-x-0 md:top-0 md:left-0 md:w-full">
      <nav
        aria-label="Primary"
        className="site-nav pointer-events-auto inline-flex items-center gap-x-3.5 rounded-lg px-3.5 py-2.5 shadow-[0_2px_16px_rgba(0,0,0,0.12)] md:flex md:w-full md:rounded-none md:px-6 md:py-5 md:shadow-none"
        style={{ colorScheme: "only light" }}
      >
        {NAV_ITEMS.map((item) => {
          const isExternal = "external" in item && item.external;
          const isActive =
            !isExternal &&
            (item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));

          const className = cn(
            "text-[11px] lowercase leading-none tracking-[0.14em] no-underline hover:no-underline focus:no-underline active:no-underline",
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
