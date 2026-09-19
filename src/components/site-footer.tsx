import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { FooterLegal } from "@/components/footer-legal";
import { forceWhiteStyle } from "@/lib/force-white";
import { FOOTER_COLUMNS, SITE_NAME, type FooterLinkItem } from "@/lib/site";

function FooterLink({ label, href, external }: FooterLinkItem) {
  const className = "text-[12px] font-normal tracking-[0.04em] no-underline";
  const style = { color: "#111111" };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" style={forceWhiteStyle}>
      <div className="flex flex-col gap-10 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:py-12 lg:px-10">
        <Link href="/" className="inline-flex shrink-0 items-center" aria-label={SITE_NAME}>
          <BrandLogo />
        </Link>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-16 gap-y-8 sm:gap-x-20 lg:gap-x-24"
        >
          {FOOTER_COLUMNS.map((column) => (
            <ul
              key={column.map((item) => item.label).join("-")}
              className="flex min-w-[7rem] flex-col leading-[2.2]"
            >
              {column.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <FooterLink {...item} />
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </div>

      <div className="overflow-visible px-5 pb-[max(2.5rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))] sm:px-8 lg:px-10">
        <FooterLegal />
      </div>
    </footer>
  );
}
