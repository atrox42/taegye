import type { Metadata } from "next";

import { Wall212Draft } from "@/components/wall-212-draft";
import { NEW_PRODUCTS } from "@/lib/site";

import "./wall-draft.css";

const WALL = NEW_PRODUCTS.filter((product) => product.category === "wall-kit");

export const metadata: Metadata = {
  title: { absolute: "Wall 212 draft | TAEGYE" },
  robots: { index: false, follow: false },
};

type DraftPageProps = {
  searchParams: Promise<{ c?: string }>;
};

export default async function Wall212DraftPage({ searchParams }: DraftPageProps) {
  const { c } = await searchParams;
  const initial = WALL.some((product) => product.id === c) ? c : WALL[0]?.id;
  return <Wall212Draft initialId={initial ?? "silver"} />;
}
