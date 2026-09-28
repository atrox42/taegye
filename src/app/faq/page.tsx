import type { Metadata } from "next";

import { StoreMention } from "@/components/store-mention";
import { FAQ_ITEMS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Faq",
};

export default function FaqPage() {
  return (
    <article className="site-page text-page site-gutter">
      <h1 className="text-page-title site-type">Faq</h1>
      <div className="faq-body text-page-body">
        {FAQ_ITEMS.map((item) => (
          <section key={item.q.en} className="space-y-4">
            <h2 className="site-type site-type-copy">{item.q.en}</h2>
            <p className="site-type site-type-copy">
              <StoreMention text={item.a.en} />
            </p>
            <h2 lang="ko" className="site-type site-type-copy pt-2">
              {item.q.kr}
            </h2>
            <p lang="ko" className="site-type site-type-copy">
              {item.a.kr}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
