import type { Metadata } from "next";

import { ABOUT } from "@/lib/site";

export const metadata: Metadata = {
  title: "about",
};

export default function AboutPage() {
  return (
    <article className="px-5 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-32">
      <div className="max-w-xl space-y-16">
        <section>
          <h1 className="text-[11px] font-normal lowercase tracking-[0.18em]">
            {ABOUT.en.kicker.toLowerCase()}
          </h1>
          <div className="mt-8 space-y-6 text-[13px] leading-7 tracking-[0.02em]">
            {ABOUT.en.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-normal tracking-[0.18em]">{ABOUT.kr.kicker}</h2>
          <div className="mt-8 space-y-6 text-[13px] leading-7 tracking-[0.04em]">
            {ABOUT.kr.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
