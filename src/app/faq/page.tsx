import type { Metadata } from "next";

import { StoreLink, StoreMention } from "@/components/store-mention";
import { FAQ_ITEMS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Faq",
};

export default function FaqPage() {
  return (
    <article className="site-page site-gutter pt-8 pb-24 sm:pt-24 sm:pb-32">
      <h1 className="text-[11px] font-normal tracking-[var(--tracking-title)]">Faq</h1>
      <div className="mt-12 max-w-xl space-y-12">
        {FAQ_ITEMS.map((item) => (
          <section key={item.q.en} className="space-y-4">
            <h2 className="text-[13px] leading-6 tracking-[var(--tracking-copy)]">{item.q.en}</h2>
            <p className="text-[13px] leading-6 tracking-[var(--tracking-copy)] text-foreground/70">
              <StoreMention text={item.a.en} />
            </p>
            <h2 className="pt-2 text-[13px] leading-6 tracking-[var(--tracking-copy-kr)]">{item.q.kr}</h2>
            <p className="text-[13px] leading-6 tracking-[var(--tracking-copy-kr)] text-foreground/70">
              {item.a.kr}
            </p>
          </section>
        ))}
        <StoreLink className="inline-flex text-[11px] tracking-[var(--tracking-label-lg)] no-underline" />
      </div>
    </article>
  );
}
