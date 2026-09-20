import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductAccordions } from "@/components/product-accordions";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import {
  NEW_PRODUCTS,
  STAND_FEATURES,
  STAND_FEATURES_TAIL,
  STAND_ORIGIN,
  STAND_STAR_NOTE,
  STORE_URL,
  getNewProduct,
} from "@/lib/site";

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

  const features = [...STAND_FEATURES, product.finish, ...STAND_FEATURES_TAIL];

  return (
    <article className="site-page site-gutter pdp pt-8 pb-24 sm:pt-20 sm:pb-32" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="product-card pdp-visual" style={forceWhiteStyle}>
        <WhiteSurfaceFill />
        <div className="pdp-stage relative aspect-square overflow-hidden" style={forceWhiteStyle}>
          <WhiteSurfaceFill />
          <div className="product-empty absolute inset-0">
            <Image
              src={product.emptySrc}
              alt={product.emptyAlt}
              fill
              priority
              sizes="280px"
              className="object-contain object-center"
            />
          </div>
          <div className="product-moss absolute inset-0">
            <Image
              src={product.mossSrc}
              alt={product.mossAlt}
              fill
              sizes="280px"
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>

      <div className="pdp-copy" style={forceWhiteStyle}>
        <p className="site-type pdp-label" style={forceInkStyle}>Description -</p>
        <h1 className="site-type pdp-title" style={forceInkStyle}>{product.name}</h1>
        <p className="site-type pdp-title-kr" style={forceInkStyle}>{product.nameKr}</p>
        <p className="site-type pdp-price product-price" style={forceInkStyle}>{product.price}</p>

        <ul className="pdp-features">
          {features.map((line) => (
            <li key={line} className="site-type site-type-copy" style={forceInkStyle}>
              {line}
            </li>
          ))}
        </ul>

        <p className="site-type site-type-copy pdp-note" style={forceInkStyle}>{STAND_STAR_NOTE}</p>
        <p className="site-type pdp-origin" style={forceInkStyle}>{STAND_ORIGIN}</p>

        <ProductAccordions />

        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="site-type pdp-store no-underline hover:no-underline"
          style={forceInkStyle}
        >
          Store
        </a>
      </div>
    </article>
  );
}
