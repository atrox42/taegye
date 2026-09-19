import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { FooterLegal } from "@/components/footer-legal";
import { forceWhiteStyle } from "@/lib/force-white";
import { FOOTER_COLUMNS, SITE_NAME, type FooterLinkItem } from "@/lib/site";

function FooterLink({ label, href, external }: FooterLinkItem) {
  const className =
    "text-[11px] font-normal leading-none tracking-[0.06em] no-underline";
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
      <div className="site-footer-row site-gutter">
        <Link href="/" className="inline-flex shrink-0 self-start" aria-label={SITE_NAME}>
          <BrandLogo />
        </Link>

        <nav aria-label="Footer" className="site-footer-nav">
          {FOOTER_COLUMNS.map((column) => (
            <ul
              key={column.map((item) => item.label).join("-")}
              className="flex min-w-0 flex-col"
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

      <div className="site-gutter overflow-visible pb-[max(2.5rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))]">
        <FooterLegal />
      </div>
    </footer>
  );
}
