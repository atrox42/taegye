"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { CanvasWhitePlate } from "@/components/canvas-white-plate";
import { InkBars, InkClose, InkHairline } from "@/components/ink-icons";
import { forceWhiteStyle } from "@/lib/force-white";
import { DEFAULT_NEW_CATEGORY, NEW_CATEGORIES, STORE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

function categoryHref(id: string) {
  return id === DEFAULT_NEW_CATEGORY ? "/new" : `/new?cat=${id}`;
}

function useMobileViewport() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767.98px)");
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return mobile;
}

export function SiteHeader() {
  const pathname = usePathname();
  const mobile = useMobileViewport();
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!mobile) {
      setOpen(false);
      setProductOpen(false);
    }
  }, [mobile]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-nav-open", open);
    return () => {
      document.documentElement.classList.remove("is-nav-open");
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

  const toggleProduct = () => setProductOpen((value) => !value);

  return (
    <header className={cn("site-header pointer-events-none fixed z-50", open && "is-open")}>
      <CanvasWhitePlate />
      {mobile ? (
        <div className="site-menubar pointer-events-auto" style={forceWhiteStyle}>
          <CanvasWhitePlate />
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
      ) : null}

      {mobile && open ? (
        <div
          id={panelId}
          className="site-menu is-open"
          style={forceWhiteStyle}
        >
          <CanvasWhitePlate />
          <nav aria-label="Mobile" className="site-menu-nav">
            <InkHairline />
            <Link href="/" className="site-menu-row" onClick={closeMenu}>
              <span className="site-menu-label">Home</span>
              <InkHairline />
            </Link>
            <div
              className={cn("site-menu-row", productOpen && "is-expanded")}
              role="button"
              tabIndex={0}
              onClick={toggleProduct}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleProduct();
                }
              }}
            >
              <span className="site-menu-label">Product</span>
              <InkHairline />
            </div>
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
                    <InkHairline />
                  </Link>
                ))}
              </div>
            ) : null}
            <Link href="/about" className="site-menu-row" onClick={closeMenu}>
              <span className="site-menu-label">About</span>
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
              <InkHairline />
            </a>
          </nav>
        </div>
      ) : null}

      <nav
        aria-label="Primary"
        className="site-nav pointer-events-auto relative flex w-full items-center justify-between"
        style={forceWhiteStyle}
      >
        <CanvasWhitePlate />
        <DesktopNavLinks pathname={pathname} />
      </nav>
    </header>
  );
}

function DesktopNavLinks({ pathname }: { pathname: string }) {
  const homeActive = pathname === "/";
  const productActive = pathname === "/new" || pathname.startsWith("/new/");
  const aboutActive = pathname === "/about";

  return (
    <>
      <Link
        href="/"
        className={cn("site-nav-link site-type relative z-10", homeActive && "is-active")}
        aria-current={homeActive ? "page" : undefined}
      >
        Home
      </Link>
      <Link
        href="/new"
        className={cn("site-nav-link site-type relative z-10", productActive && "is-active")}
        aria-current={productActive ? "page" : undefined}
      >
        Product
      </Link>
      <Link
        href="/about"
        className={cn("site-nav-link site-type relative z-10", aboutActive && "is-active")}
        aria-current={aboutActive ? "page" : undefined}
      >
        About
      </Link>
      <a
        href={STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="site-nav-link site-type relative z-10"
      >
        Store
      </a>
    </>
  );
}
