import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";
import { NEW_PRODUCTS } from "@/lib/site";

const STATIC_PATHS = ["/", "/new", "/about", "/contact", "/faq", "/legal", "/archive", "/store"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_PATHS.map((path) => ({
      url: absoluteUrl(path),
    })),
    ...NEW_PRODUCTS.map((product) => ({
      url: absoluteUrl(`/new/${product.id}`),
    })),
  ];
}
