import type { Metadata } from "next";

import { LEGAL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "legals",
};

const ROWS = [
  { label: "상호", value: `${LEGAL.company} (${LEGAL.companyKr})` },
  { label: "대표", value: LEGAL.ceo },
  { label: "사업자등록번호", value: LEGAL.businessNumber },
  { label: "통신판매업신고", value: LEGAL.mailOrderNumber },
  { label: "주소", value: LEGAL.address },
  { label: "이메일", value: LEGAL.email },
  { label: "전화", value: LEGAL.phone },
] as const;

export default function LegalPage() {
  return (
    <article className="site-page px-5 pt-8 pb-24 sm:px-6 sm:pt-24 sm:pb-32">
      <h1 className="text-[11px] font-normal lowercase tracking-[0.18em]">legals</h1>
      <p className="mt-8 max-w-xl text-[13px] leading-7 tracking-[0.02em] text-foreground/70">
        Business information for {SITE_NAME}. Details below are placeholders until
        registration is confirmed.
      </p>
      <dl className="mt-12 max-w-xl space-y-4 text-[13px] leading-7 tracking-[0.02em]">
        {ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr]">
            <dt className="text-foreground/50">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
