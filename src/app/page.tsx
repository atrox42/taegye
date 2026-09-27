import { HomeHero } from "@/components/home-hero";
import { HomeNewIn } from "@/components/home-new-in";
import { parseHeroScales, shuffleHeroScales } from "@/lib/hero-scale";

export const dynamic = "force-dynamic";

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
