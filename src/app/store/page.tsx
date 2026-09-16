import { redirect } from "next/navigation";

import { STORE_URL } from "@/lib/site";

export default function StorePage() {
  redirect(STORE_URL);
}
