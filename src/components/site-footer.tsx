import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { FooterLegal } from "@/components/footer-legal";
import { forceWhiteStyle } from "@/lib/force-white";
import { FOOTER_COLUMNS, SITE_NAME, type FooterLinkItem } from "@/lib/site";

function FooterLink({ label, href, external }: FooterLinkItem) {
  const className = "site-type no-underline hover:no-underline";
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
      <div className="site-footer-inner site-gutter">
        <div className="site-footer-row">
          <Link href="/" className="site-footer-logo inline-flex shrink-0 self-start" aria-label={SITE_NAME}>
            <BrandLogo />
          </Link>

          <nav aria-label="Footer" className="site-footer-nav">
            {FOOTER_COLUMNS.map((column) => (
              <ul
                key={column.map((item) => item.label).join("-")}
                className="site-footer-col"
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

        <div className="site-footer-legal">
          <FooterLegal />
        </div>
      </div>
    </footer>
  );
}
