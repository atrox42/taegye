import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product-detail";
import { NEW_PRODUCTS, getNewProduct } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return NEW_PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getNewProduct(id);
  if (!product) return { title: "Product" };
  return { title: product.name };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getNewProduct(id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
