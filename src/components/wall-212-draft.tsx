"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ProductPhoto } from "@/components/product-photo";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import {
  NEW_PRODUCTS,
  PRODUCT_SPEC_LABELS,
  PRODUCT_SPEC_PENDING,
  STAND_FEATURES,
  STAND_ORIGIN,
  STAND_STAR_NOTE,
  STORE_URL,
  finishLabel,
  productFamilyLabel,
  productNote,
  productSpecValue,
  type FinishCode,
  type NewProduct,
} from "@/lib/site";

const WALL = NEW_PRODUCTS.filter((product) => product.category === "wall-kit");

const ACCESSORIES = NEW_PRODUCTS.filter((product, index, list) => {
  if (product.category === "wall-kit") return false;
  return list.findIndex((item) => item.category === product.category) === index;
});

const FINISH_CODES: FinishCode[] = ["HOLLOW", "ODD", "VOID", "BUG", "MIST"];

function finishFromProduct(product: NewProduct): FinishCode {
  const code = product.name.split(", ")[1]?.replace(/\([^)]*\)$/, "") as FinishCode | undefined;
  return code && FINISH_CODES.includes(code) ? code : "HOLLOW";
}

function Mark({ d }: { d: string }) {
  return (
    <svg className="wall-draft-ico" viewBox="0 0 10 10" width="10" height="10" aria-hidden>
      <path d={d} fill="none" stroke="#111111" strokeWidth="1" strokeLinejoin="miter" />
    </svg>
  );
}

function Plate({
  product,
  kind,
  active,
  priority = false,
}: {
  product: NewProduct;
  kind: "empty" | "moss";
  active: boolean;
  priority?: boolean;
}) {
  const src = kind === "moss" ? product.mossSrc : product.emptySrc;
  const mobileSrc = kind === "moss" ? product.mossSrcMobile : product.emptySrcMobile;
  const alt = kind === "moss" ? (product.mossAlt ?? product.emptyAlt) : product.emptyAlt;
  if (!src) return null;
  return (
    <div className={`wall-draft-layer${active ? " is-on" : ""}`} aria-hidden={!active}>
      <ProductPhoto src={src} mobileSrc={mobileSrc} alt={active ? alt : ""} fill priority={priority && active} />
    </div>
  );
}

export function Wall212Draft({ initialId }: { initialId: string }) {
  const [id, setId] = useState(WALL.some((item) => item.id === initialId) ? initialId : WALL[0].id);
  const product = WALL.find((item) => item.id === id) ?? WALL[0];
  const buyRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = buyRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: "-64px 0px 0px 0px",
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const select = (next: string) => {
    if (next === id) return;
    setId(next);
    window.history.replaceState(null, "", `/product/wall-212/draft?c=${next}`);
  };

  const finish = finishFromProduct(product);
  const finishName = finishLabel(finish);
  const note = productNote(product);
  const family = productFamilyLabel(product);
  const specs = [
    {
      key: "dimensions",
      mark: "M1.5 3h7v6h-7zM1.5 3L5 1.4 8.5 3M3.5 5.6h3",
      label: PRODUCT_SPEC_LABELS.dimensions,
      value: productSpecValue(product, "dimensions") || PRODUCT_SPEC_PENDING,
      empty: !productSpecValue(product, "dimensions"),
    },
    {
      key: "planting",
      mark: "M5 8.6V4.6M5 4.6C5 3 3.4 2.2 2.2 2.2 2.2 4.2 3.6 5.2 5 5.6M5 4.6C5 3 6.6 2.2 7.8 2.2 7.8 4.2 6.4 5.2 5 5.6",
      label: PRODUCT_SPEC_LABELS.planting,
      value: productSpecValue(product, "planting") || PRODUCT_SPEC_PENDING,
      empty: !productSpecValue(product, "planting"),
    },
    {
      key: "origin",
      mark: "M5 8.6S2.4 6.2 2.4 4.4a2.6 2.6 0 1 1 5.2 0C7.6 6.2 5 8.6 5 8.6zM5 5.3a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8z",
      label: "Origin",
      value: STAND_ORIGIN,
      empty: false,
    },
  ] as const;

  return (
    <article className="site-page site-gutter wall-draft" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <p className="site-type wall-draft-kicker" style={forceInkStyle}>
        Draft preview
      </p>

      <div className="wall-draft-stage">
        <div className="wall-draft-visual">
          <figure className="wall-draft-hero" style={forceWhiteStyle}>
            <WhiteSurfaceFill />
            <div className="wall-draft-hero-stage">
              {WALL.map((item) => (
                <Plate key={`e-${item.id}`} product={item} kind="empty" active={item.id === id} priority={item.id === id} />
              ))}
            </div>
            <figcaption className="site-type wall-draft-cap" style={forceInkStyle}>
              01
            </figcaption>
          </figure>
          <figure className="wall-draft-hero" style={forceWhiteStyle}>
            <WhiteSurfaceFill />
            <div className="wall-draft-hero-stage">
              {WALL.map((item) => (
                <Plate key={`m-${item.id}`} product={item} kind="moss" active={item.id === id} />
              ))}
            </div>
            <figcaption className="site-type wall-draft-cap" style={forceInkStyle}>
              02
            </figcaption>
          </figure>
        </div>

        <div className="wall-draft-info">
          <header className="wall-draft-head">
            <h1 className="site-type wall-draft-title" style={forceInkStyle}>
              {family}
            </h1>
            <p className="site-type wall-draft-finish" style={forceInkStyle}>
              {finishName}
            </p>
          </header>

          <div ref={buyRef} className="wall-draft-buy">
            {product.price ? (
              <p className="site-type wall-draft-price" style={forceInkStyle}>
                {product.price}
              </p>
            ) : null}
            <div className="wall-draft-swatches" role="list" aria-label="Color">
              {WALL.map((item) => {
                const code = finishFromProduct(item);
                const label = finishLabel(code);
                const current = item.id === id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="listitem"
                    className={`wall-draft-chip${current ? " is-current" : ""}${code === "MIST" ? " is-mist" : ""}`}
                    aria-current={current ? "true" : undefined}
                    aria-label={label}
                    onClick={() => select(item.id)}
                  >
                    <span className="wall-draft-dot">
                      {/* eslint-disable-next-line @next/next/no-img-element -- raster swatch skips Force Dark invert */}
                      <img src={`/swatches/${item.id}.png`} alt="" />
                    </span>
                    <span className="site-type" style={forceInkStyle}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-type wall-draft-store no-underline hover:no-underline"
              style={forceInkStyle}
            >
              Store
              <span className="wall-draft-chevron" aria-hidden />
            </a>
          </div>

          {note ? (
            <p lang="ko" className="site-type wall-draft-note" style={forceInkStyle}>
              {note}
            </p>
          ) : null}

          <dl className="wall-draft-specs">
            {specs.map((spec, index) => (
              <div key={spec.key} className="wall-draft-spec" data-pdp-spec={spec.key === "origin" ? undefined : spec.key}>
                <dt>
                  <span className="site-type wall-draft-idx" style={forceInkStyle}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Mark d={spec.mark} />
                  <span className="site-type" style={forceInkStyle}>
                    {spec.label}
                  </span>
                </dt>
                <dd className={`site-type${spec.empty ? " is-empty" : ""}`} style={spec.empty ? undefined : forceInkStyle}>
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="wall-draft-points">
            {STAND_FEATURES.map((line) => (
              <li key={line} className="site-type" style={forceInkStyle}>
                {line}
              </li>
            ))}
          </ul>
          <p className="site-type wall-draft-star" style={forceInkStyle}>
            {STAND_STAR_NOTE}
          </p>
        </div>
      </div>

      <section className="wall-draft-accessories" aria-label="Product">
        <ul className="wall-draft-accessories-row">
          {ACCESSORIES.map((item, index) => (
            <li key={item.id}>
              <Link href={`/new/${item.id}`} className="wall-draft-acc no-underline hover:no-underline">
                <span className="site-type wall-draft-idx" style={forceInkStyle}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="wall-draft-acc-photo" style={forceWhiteStyle}>
                  <WhiteSurfaceFill />
                  <ProductPhoto src={item.emptySrc} mobileSrc={item.emptySrcMobile} alt={item.emptyAlt} fill />
                </div>
                <p className="site-type" style={forceInkStyle}>
                  {item.name}
                </p>
                {item.price ? (
                  <p className="site-type wall-draft-acc-price" style={forceInkStyle}>
                    {item.price}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className={`wall-draft-bar${stuck ? " is-on" : ""}`} aria-hidden={!stuck}>
        <WhiteSurfaceFill />
        <div className="wall-draft-bar-inner">
          <p className="site-type" style={forceInkStyle}>
            {family}
            <span className="wall-draft-bar-dot" aria-hidden />
            {finishName}
          </p>
          <div className="wall-draft-bar-buy">
            {product.price ? (
              <p className="site-type" style={forceInkStyle}>
                {product.price}
              </p>
            ) : null}
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-type wall-draft-store no-underline hover:no-underline"
              style={forceInkStyle}
              tabIndex={stuck ? 0 : -1}
            >
              Store
              <span className="wall-draft-chevron" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
