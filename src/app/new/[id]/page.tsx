import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { forceWhiteStyle } from "@/lib/force-white";
import { NEW_PRODUCTS, STAND_NOTE, STORE_URL, getNewProduct } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return NEW_PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getNewProduct(id);
  if (!product) return { title: "new" };
  return { title: product.name };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getNewProduct(id);
  if (!product) notFound();

  return (
    <article className="site-page site-gutter pt-8 pb-24 sm:pt-20 sm:pb-32" style={forceWhiteStyle}>
      <Link
        href="/new"
        className="text-[11px] font-normal lowercase tracking-[0.14em] no-underline hover:no-underline"
        style={{ color: "#999999" }}
      >
        new
      </Link>

      <div className="mt-10 grid items-start gap-12 md:mt-16 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className="product-card" style={forceWhiteStyle}>
          <div className="relative aspect-square overflow-hidden" style={forceWhiteStyle}>
            <div className="product-empty absolute inset-0">
              <Image
                src={product.emptySrc}
                alt={product.emptyAlt}
                fill
                priority
                sizes="(min-width: 768px) 46vw, 92vw"
                className="object-contain object-center"
              />
            </div>
            <div className="product-moss absolute inset-0">
              <Image
                src={product.mossSrc}
                alt={product.mossAlt}
                fill
                sizes="(min-width: 768px) 46vw, 92vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>

        <div className="max-w-sm md:pt-4">
          <h1 className="text-[13px] font-normal tracking-[0.04em]" style={{ color: "#111111" }}>
            {product.name}
          </h1>
          <p className="mt-2 text-[13px] tracking-[0.04em]" style={{ color: "#111111" }}>
            {product.price}
          </p>

          <div className="mt-10 space-y-6">
            <section lang="en" className="space-y-2 text-[13px] leading-[1.9] tracking-[0.02em]">
              {STAND_NOTE.en.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </section>
            <section lang="ko" className="space-y-2 text-[13px] leading-[2] tracking-[0.04em]">
              {STAND_NOTE.kr.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </section>
          </div>

          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-block text-[11px] lowercase tracking-[0.14em] no-underline hover:no-underline"
            style={{ color: "#111111" }}
          >
            store
          </a>
        </div>
      </div>
    </article>
  );
}
