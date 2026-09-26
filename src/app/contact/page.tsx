import type { Metadata } from "next";

import { StoreLink } from "@/components/store-mention";
import { CONTACT_EMAIL, LEGAL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <article className="site-page site-gutter pt-8 pb-24 sm:pt-24 sm:pb-32">
      <h1 className="text-[11px] font-normal tracking-[var(--tracking-title)]">Contact</h1>
      <div className="mt-12 max-w-xl space-y-8 text-[13px] leading-7 tracking-[var(--tracking-copy)]">
        <section className="space-y-2">
          <p>Inquiries</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:opacity-50">
            {CONTACT_EMAIL}
          </a>
        </section>
        <section className="space-y-2">
          <p>문의</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:opacity-50">
            {CONTACT_EMAIL}
          </a>
        </section>
        <section className="space-y-1 text-foreground/70">
          <p>{LEGAL.company}</p>
          <p>{LEGAL.address}</p>
        </section>
        <StoreLink className="inline-flex text-[11px] tracking-[var(--tracking-label-lg)] no-underline" />
      </div>
    </article>
  );
}
