import type { Metadata } from "next";

import { CONTACT_EMAIL, LEGAL, STORE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "contact",
};

export default function ContactPage() {
  return (
    <article className="px-5 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-32">
      <h1 className="text-[11px] font-normal lowercase tracking-[0.18em]">contact</h1>
      <div className="mt-12 max-w-xl space-y-8 text-[13px] leading-7 tracking-[0.02em]">
        <section className="space-y-2">
          <p>Inquiries</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="block lowercase hover:opacity-50">
            {CONTACT_EMAIL}
          </a>
        </section>
        <section className="space-y-2">
          <p>문의</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="block lowercase hover:opacity-50">
            {CONTACT_EMAIL}
          </a>
        </section>
        <section className="space-y-1 text-foreground/70">
          <p>{LEGAL.company}</p>
          <p>{LEGAL.address}</p>
        </section>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-[11px] lowercase tracking-[0.14em] no-underline"
          style={{ color: "#111111" }}
        >
          store
        </a>
      </div>
    </article>
  );
}
