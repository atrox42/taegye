import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { FooterLegal } from "@/components/footer-legal";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import { FOOTER_LINKS, SITE_NAME, type FooterLinkItem } from "@/lib/site";

function FooterLink({ label, href, external }: FooterLinkItem) {
  const className = "site-type site-footer-link no-underline hover:no-underline";
  const style = forceInkStyle;

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
      <WhiteSurfaceFill />
      <div className="site-footer-inner site-gutter">
        <div className="site-footer-row">
          <div className="site-footer-brand">
            <Link href="/" className="site-footer-logo inline-flex shrink-0" aria-label={SITE_NAME}>
              <BrandLogo />
            </Link>
            <FooterLegal />
          </div>

          <nav aria-label="Footer">
            <ul className="site-footer-nav">
              {FOOTER_LINKS.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <FooterLink {...item} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
