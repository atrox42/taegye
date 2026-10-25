import type { Metadata } from "next";

import {
  ABOUT,
  CONTACT_EMAIL,
  FAQ_ITEMS,
  INSTAGRAM_URL,
  NEW_PRODUCTS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  STORE_URL,
  PRODUCT_SPEC_LABELS,
  productNote,
  productNoteLead,
  productSpecValue,
  type NewProduct,
} from "@/lib/site";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const prefix = path.startsWith("/") ? "" : "/";
  return `${SITE_URL}${prefix}${path}`;
}

export function offerPrice(price?: string): string | null {
  if (!price) return null;
  const digits = price.replace(/[^\d]/g, "");
  return digits || null;
}

export function productImagePath(product: NewProduct): string {
  return (product.mossSrc ?? product.emptySrc).split("?")[0];
}

export function productDescription(product: NewProduct): string {
  return productNoteLead(product);
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image ?? "/logo-taegye.png");
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function productMetadata(product: NewProduct): Metadata {
  return pageMetadata({
    title: `${product.name} | ${SITE_NAME}`,
    description: productDescription(product),
    path: `/new/${product.id}`,
    image: productImagePath(product),
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/logo-taegye.png"),
        sameAs: [INSTAGRAM_URL, STORE_URL],
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    ],
  };
}

export function productJsonLd(product: NewProduct) {
  const price = offerPrice(product.price);
  const url = absoluteUrl(`/new/${product.id}`);
  const specs = (["dimensions", "planting"] as const).flatMap((key) => {
    const value = productSpecValue(product, key);
    return value ? [{ "@type": "PropertyValue" as const, name: PRODUCT_SPEC_LABELS[key], value }] : [];
  });
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productNote(product),
    brand: { "@type": "Brand", name: SITE_NAME },
    image: absoluteUrl(productImagePath(product)),
    url,
    ...(specs.length ? { additionalProperty: specs } : {}),
    offers: {
      "@type": "Offer",
      ...(price ? { price, priceCurrency: "KRW" } : {}),
      availability: "https://schema.org/InStock",
      url,
    },
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q.en,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a.en,
      },
    })),
  };
}

export const HOME_DESCRIPTION = SITE_DESCRIPTION;
export const ABOUT_DESCRIPTION = `${ABOUT.en[0][0]} ${ABOUT.en[0][1]}`;
export const NEW_DESCRIPTION = `TAEGYE products: ${NEW_PRODUCTS.map((product) => product.name).join(", ")}.`;
export const CONTACT_DESCRIPTION = `Contact ${SITE_NAME} at ${CONTACT_EMAIL}.`;
export const FAQ_DESCRIPTION = FAQ_ITEMS.map((item) => item.q.en).join(" ");
export const LEGAL_DESCRIPTION = `Business information for ${SITE_NAME}.`;
export const ARCHIVE_DESCRIPTION = `${SITE_NAME} archive.`;
