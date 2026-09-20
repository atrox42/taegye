import type { Metadata } from "next";

import { ABOUT } from "@/lib/site";

export const metadata: Metadata = {
  title: "about",
};

function AboutParagraph({
  lang,
  lines,
}: {
  lang: "en" | "ko";
  lines: readonly string[];
}) {
  return (
    <p lang={lang} className="site-type site-type-copy about-copy">
      {lines.map((line, index) => (
        <span key={line} className="about-line">
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

export default function AboutPage() {
  return (
    <article className="site-page site-gutter pt-8 pb-24 sm:pt-24 sm:pb-32">
      <div className="about-langs">
        <div className="about-stack">
          {ABOUT.en.map((lines) => (
            <AboutParagraph key={lines[0]} lang="en" lines={lines} />
          ))}
        </div>
        <div className="about-stack">
          {ABOUT.kr.map((lines) => (
            <AboutParagraph key={lines[0]} lang="ko" lines={lines} />
          ))}
        </div>
      </div>
    </article>
  );
}
