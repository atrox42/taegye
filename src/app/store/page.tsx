import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { pageMetadata } from "@/lib/seo";
import { STORE_URL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Store",
  description: "TAEGYE Store.",
  path: "/store",
});

export default function StorePage() {
  redirect(STORE_URL);
}
