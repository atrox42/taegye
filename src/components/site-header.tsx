"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { InkBars, InkChevron, InkClose, InkHairline } from "@/components/ink-icons";
import { forceWhiteStyle, PANEL_BITMAP_SRC, WHITE_BITMAP_SRC } from "@/lib/force-white";
import { DEFAULT_NEW_CATEGORY, NEW_CATEGORIES, STORE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

function categoryHref(id: string) {
  return id === DEFAULT_NEW_CATEGORY ? "/new" : `/new?cat=${id}`;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setProductOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setProductOpen(false);
  };

  return (
    <header className={cn("site-header pointer-events-none fixed z-50", open && "is-open")}>
      <div className="site-menubar pointer-events-auto" style={forceWhiteStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS paint */}
        <img
          src={WHITE_BITMAP_SRC}
          alt=""
          aria-hidden
          className="site-menubar-bitmap"
        />
        <button
          type="button"
          className="site-menubar-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <InkClose /> : <InkBars />}
        </button>
      </div>

      <div
        id={panelId}
        className={cn("site-menu", open && "is-open")}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        style={{
          ...forceWhiteStyle,
          backgroundColor: "#fafafa",
          backgroundImage: `url("${PANEL_BITMAP_SRC}"), url("${WHITE_BITMAP_SRC}")`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS paint */}
        <img src={PANEL_BITMAP_SRC} alt="" aria-hidden className="site-menu-bitmap" />
        <nav aria-label="Mobile" className="site-menu-nav">
          <InkHairline />
          <Link href="/" className="site-menu-row" onClick={closeMenu}>
            <span className="site-menu-label">Home</span>
            <InkChevron />
            <InkHairline />
          </Link>
          <button
            type="button"
            className={cn("site-menu-row", productOpen && "is-expanded")}
            aria-expanded={productOpen}
            onClick={() => setProductOpen((value) => !value)}
          >
            <span className="site-menu-label">Product</span>
            <InkChevron open={productOpen} />
            <InkHairline />
          </button>
          {productOpen ? (
            <div className="site-menu-sub">
              {NEW_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={categoryHref(category.id)}
                  className="site-menu-row site-menu-subrow"
                  onClick={closeMenu}
                >
                  <span className="site-menu-label">{category.label}</span>
                  <InkChevron />
                  <InkHairline />
                </Link>
              ))}
            </div>
          ) : null}
          <Link href="/about" className="site-menu-row" onClick={closeMenu}>
            <span className="site-menu-label">About</span>
            <InkChevron />
            <InkHairline />
          </Link>
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-menu-row"
            onClick={closeMenu}
          >
            <span className="site-menu-label">Store</span>
            <InkChevron />
            <InkHairline />
          </a>
        </nav>
      </div>

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
        <DesktopNavLinks pathname={pathname} />
      </nav>
    </header>
  );
}

function DesktopNavLinks({ pathname }: { pathname: string }) {
  const items = [
    { label: "Home", href: "/" },
    { label: "Product", href: "/new" },
    { label: "About", href: "/about" },
    { label: "Store", href: STORE_URL, external: true },
  ] as const;

  return items.map((item) => {
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
  });
}
