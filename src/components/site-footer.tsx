import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { FooterLegal } from "@/components/footer-legal";
import { forceWhiteStyle } from "@/lib/force-white";
import { FOOTER_COLUMNS, SITE_NAME, type FooterLinkItem } from "@/lib/site";

function FooterLink({ label, href, external }: FooterLinkItem) {
  const className =
    "text-[11px] font-normal lowercase leading-none tracking-[0.06em] no-underline";
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
      <div className="flex w-full flex-col gap-12 px-6 pt-14 pb-8 md:flex-row md:items-start md:justify-between md:gap-0 md:px-10 md:pt-16 md:pb-10 lg:px-14">
        <Link href="/" className="inline-flex shrink-0 self-start" aria-label={SITE_NAME}>
          <BrandLogo />
        </Link>

        <nav
          aria-label="Footer"
          className="ml-0 grid w-full max-w-[20rem] grid-cols-2 gap-x-10 md:ml-auto md:w-auto md:max-w-none md:gap-x-24 lg:gap-x-32"
        >
          {FOOTER_COLUMNS.map((column) => (
            <ul
              key={column.map((item) => item.label).join("-")}
              className="flex min-w-[6.5rem] flex-col"
              style={{ lineHeight: 2.42 }}
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

      <div className="overflow-visible px-6 pb-[max(2.5rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))] md:px-10 lg:px-14">
        <FooterLegal />
      </div>
    </footer>
  );
}
