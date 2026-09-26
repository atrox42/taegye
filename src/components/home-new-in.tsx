import Link from "next/link";

import { forceInkStyle, forceMutedStyle, forceWhiteStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";
import { HOME_NEW_IN, getNewProduct } from "@/lib/site";

const FEATURED = HOME_NEW_IN.map((item) => {
  const product = getNewProduct(item.id);
  if (!product) return null;
  return { ...item, product };
}).filter((item): item is NonNullable<typeof item> => item !== null);

export function HomeNewIn() {
  return (
    <section className="home-new-in" aria-label="New In" style={forceWhiteStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS paint */}
      <img src={WHITE_BITMAP_SRC} alt="" aria-hidden className="home-new-in-bitmap" />
      <div className="home-new-in-head">
        <h2 className="home-new-in-title site-type" style={forceInkStyle}>
          New In
        </h2>
        <Link href="/new" className="home-new-in-more site-type" style={forceInkStyle}>
          View more +
        </Link>
      </div>
      <div className="home-new-in-grid">
        {FEATURED.map((item, index) => (
          <article
            key={item.id}
            className={index === 0 ? "home-new-in-card is-primary" : "home-new-in-card is-secondary"}
          >
            <Link href={`/new/${item.product.id}`} className="home-new-in-visual">
              {/* eslint-disable-next-line @next/next/no-img-element -- product photo stays photographic under Force Dark */}
              <img src={item.product.mossSrc} alt={item.product.mossAlt} />
            </Link>
            <div className="home-new-in-caption">
              <span className="home-new-in-kicker site-type" style={forceMutedStyle}>
                Featured:
              </span>
              <span className="home-new-in-line site-type" style={forceInkStyle}>
                {item.caption}
              </span>
            </div>
            <Link href={`/new/${item.product.id}`} className="home-new-in-cta">
              <span className="home-new-in-cta-face">
                <span className="home-new-in-cta-label site-type" style={forceInkStyle}>
                  View product
                </span>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
