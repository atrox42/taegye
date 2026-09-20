import type { Metadata } from "next";
import { Fragment } from "react";

import { ABOUT } from "@/lib/site";

export const metadata: Metadata = {
  title: "about",
};

function AboutLines({
  lang,
  lines,
}: {
  lang: "en" | "ko";
  lines: readonly (readonly string[])[];
}) {
  return (
    <p lang={lang} className="site-type site-type-copy about-copy">
      {lines.map((line, lineIndex) => (
        <span key={line.join(" ")} className="about-line">
          {line.map((phrase, phraseIndex) => (
            <Fragment key={phrase}>
              {phraseIndex > 0 ? (
                <>
                  {" "}
                  <br className="about-break-sm" />
                </>
              ) : null}
              {phrase}
            </Fragment>
          ))}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

export default function AboutPage() {
  return (
    <article className="site-page site-gutter pt-8 pb-24 sm:pt-24 sm:pb-32">
      <h1 className="site-type lowercase">about</h1>
      <div className="about-stack mt-12 sm:mt-16">
        <AboutLines lang="en" lines={ABOUT.en} />
        <AboutLines lang="ko" lines={ABOUT.kr} />
      </div>
    </article>
  );
}
