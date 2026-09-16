import type { Metadata } from "next";

import { FAQ_ITEMS, STORE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "faq",
};

export default function FaqPage() {
  return (
    <article className="px-5 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-32">
      <h1 className="text-[11px] font-normal lowercase tracking-[0.18em]">faq</h1>
      <div className="mt-12 max-w-xl space-y-12">
        {FAQ_ITEMS.map((item) => (
          <section key={item.q.en} className="space-y-4">
            <h2 className="text-[13px] leading-6 tracking-[0.02em]">{item.q.en}</h2>
            <p className="text-[13px] leading-6 tracking-[0.02em] text-foreground/70">
              {item.a.en}
            </p>
            <h2 className="pt-2 text-[13px] leading-6 tracking-[0.04em]">{item.q.kr}</h2>
            <p className="text-[13px] leading-6 tracking-[0.04em] text-foreground/70">
              {item.a.kr}
            </p>
          </section>
        ))}
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[11px] lowercase tracking-[0.14em] transition-opacity hover:opacity-50"
        >
          smart store
        </a>
      </div>
    </article>
  );
}
