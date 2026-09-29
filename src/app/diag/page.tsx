import type { Metadata } from "next";

import { SamsungDiag } from "@/components/samsung-diag";

export const metadata: Metadata = {
  title: "diag",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default function DiagPage() {
  return <SamsungDiag />;
}
