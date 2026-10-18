import type { Metadata } from "next";

import { HomeHero } from "@/components/home-hero";
import { HomeNewIn } from "@/components/home-new-in";
import { parseHeroScales, shuffleHeroScales } from "@/lib/hero-scale";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_NAME_KR } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} (${SITE_NAME_KR})`,
  description: HOME_DESCRIPTION,
  path: "/",
  image: "/products/stand-silver-moss.webp",
});

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ scales?: string }>;
}) {
  const params = await searchParams;
  const scales = parseHeroScales(params.scales ?? null) ?? shuffleHeroScales();

  return (
    <>
      <HomeHero scales={scales} />
      <HomeNewIn />
    </>
  );
}
