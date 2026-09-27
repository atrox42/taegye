import type { Metadata } from "next";

import { ContactEmail } from "@/components/contact-email";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <article className="site-page contact-page site-gutter pt-8 pb-24 sm:pt-24 sm:pb-32" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <h1 className="text-[11px] font-normal tracking-[var(--tracking-title)]">Contact</h1>
      <div className="contact-body">
        <ContactEmail />
      </div>
    </article>
  );
}
