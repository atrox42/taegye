import type { Metadata } from "next";

import { ABOUT } from "@/lib/site";

export const metadata: Metadata = {
  title: "about",
};

export default function AboutPage() {
  return (
    <article className="site-page site-gutter pt-8 pb-24 sm:pt-24 sm:pb-32">
      <h1 className="text-[11px] font-normal lowercase tracking-[0.18em]">about</h1>
      <div className="mt-12 max-w-xl space-y-16 sm:mt-16 sm:space-y-20">
        <section lang="en" className="space-y-7 text-[13px] leading-[1.9] tracking-[0.02em]">
          {ABOUT.en.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <section lang="ko" className="space-y-7 text-[13px] leading-[2] tracking-[0.04em]">
          {ABOUT.kr.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      </div>
    </article>
  );
}
