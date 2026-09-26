import Link from "next/link";

import { FloatLogo } from "@/components/float-logo";
import { FooterLegal } from "@/components/footer-legal";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";
import { FOOTER_LINKS, type FooterLinkItem } from "@/lib/site";

function FooterLink({ label, href, external }: FooterLinkItem) {
  const className = "site-type site-footer-link no-underline hover:no-underline";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="site-footer-inner site-gutter">
        <FloatLogo />
        <div className="site-footer-row">
          <div className="site-footer-brand">
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
