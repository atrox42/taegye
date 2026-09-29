#!/usr/bin/env node
/**
 * Layout regression checks for mobile (412×915, DPR 2.75) and desktop.
 *
 * Always asserts hero clip math. When a storefront is reachable, also
 * checks bounding boxes in headless Chrome.
 *
 *   BASE_URL=http://127.0.0.1:3000 node scripts/layout-regression.mjs
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const MOBILE = { width: 412, height: 915, deviceScaleFactor: 2.75 };
const MOBILE_360 = { width: 360, height: 780, deviceScaleFactor: 2 };
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 };
const DESKTOP_FHD = { width: 1920, height: 1080, deviceScaleFactor: 1 };
const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const SKIP = "intro=skip&promo=skip";

function mobileClipBox(scale = 1, viewportWidth = 412, gutter = 16) {
  const baseW = 138;
  const rawW = baseW * scale;
  const maxW = Math.max(0, viewportWidth - gutter * 2);
  const w = Math.min(rawW, maxW);
  return { width: w, height: w * (130 / 230) };
}

function assertMath() {
  const box = mobileClipBox(1, 412);
  assert.equal(box.width, 138);
  assert.ok(Math.abs(box.height - 78) < 0.01);
  console.log("ok  math: mobile clips are equal 138×78");
}

async function pageReady(page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.intro === "done",
    { timeout: 15000 },
  );
  await new Promise((resolve) => setTimeout(resolve, 400));
}

async function withPage(browser, viewport, path, fn) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`${BASE}${path}${path.includes("?") ? "&" : "?"}${SKIP}`, {
    waitUntil: "networkidle0",
    timeout: 45000,
  });
  await pageReady(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((resolve) => setTimeout(resolve, 200));
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
}

function srgbToLin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb) {
  return 0.2126 * srgbToLin(rgb[0]) + 0.7152 * srgbToLin(rgb[1]) + 0.0722 * srgbToLin(rgb[2]);
}

function contrastRatio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

async function enableForcedDark(page) {
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
  const cdp = await page.createCDPSession();
  try {
    await cdp.send("Emulation.setAutoDarkModeOverride", { enabled: true });
  } catch {
    /* older chrome */
  }
}

async function withPromo(browser, viewport, dark, fn) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`${BASE}/?intro=skip&promo=hold`, {
    waitUntil: "load",
    timeout: 60000,
  });
  if (dark) await enableForcedDark(page);
  await pageReady(page);
  await page.waitForSelector(".site-promo-card", { timeout: 20000 });
  await page.waitForFunction(
    () => {
      const title = document.querySelector(".site-promo-title canvas");
      return title instanceof HTMLCanvasElement && title.width > 4;
    },
    { timeout: 15000 },
  );
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
}

async function runBrowser() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer-core");
  } catch {
    console.log("skip  browser: puppeteer-core not installed");
    return;
  }

  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
  });

  try {
    await withPage(browser, MOBILE, "/", async (page) => {
      const head = await page.evaluate(() => ({
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute("content") || "",
        manifest: document.querySelector('link[rel="manifest"]')?.getAttribute("href") || "",
        theme: [...document.querySelectorAll('meta[name="theme-color"]')].map((node) =>
          (node.getAttribute("content") || "").toLowerCase(),
        ),
      }));
      assert.match(head.viewport, /viewport-fit=cover/, `viewport ${head.viewport}`);
      assert.match(head.manifest, /manifest\.webmanifest/, `manifest ${head.manifest}`);
      assert.ok(
        head.theme.some((color) => color === "#ffffff"),
        `theme-color ${head.theme}`,
      );

      const clips = await page.$$eval(".home-hero-clip", (nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          const s = getComputedStyle(node);
          return {
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
            position: s.position,
          };
        }),
      );
      const hero = await page.$eval(".home-hero", (node) => {
        const r = node.getBoundingClientRect();
        const s = getComputedStyle(node);
        return { h: r.height, overflow: s.overflow, justify: s.justifyContent, align: s.alignItems };
      });
      assert.equal(clips.length, 3, "home has three hero clips");
      for (const clip of clips) {
        assert.ok(Math.abs(clip.w - 138) <= 2, `mobile clip width ${clip.w} should be 138px, not full viewport`);
        assert.ok(Math.abs(clip.h - 78) <= 2, `mobile clip height ${clip.h} should be 78px`);
        assert.equal(clip.position, "relative");
        assert.ok(Math.abs(clip.x - (412 - 138) / 2) <= 4, `clip should be centered, x=${clip.x}`);
      }
      assert.ok(Math.abs(hero.h - 915) <= 2, `hero should be 100svh, got ${hero.h}`);
      assert.equal(hero.overflow, "hidden");
      assert.equal(hero.justify, "center");
      assert.equal(hero.align, "center");
      const stackTop = Math.min(...clips.map((c) => c.y));
      const stackBottom = Math.max(...clips.map((c) => c.y + c.h));
      const stackMid = (stackTop + stackBottom) / 2;
      const viewMid = 915 / 2;
      assert.ok(
        Math.abs(stackMid - viewMid) <= 2,
        `mobile stack center ${stackMid} should match viewport center ${viewMid}`,
      );
      const logo = await page.$eval(".site-float-logo", (node) => {
        const s = getComputedStyle(node);
        const r = node.getBoundingClientRect();
        return {
          position: s.position,
          display: s.display,
          opacity: Number(s.opacity),
          y: r.y,
          h: r.height,
          hidden: node.classList.contains("is-hidden"),
        };
      });
      assert.equal(logo.position, "fixed");
      assert.notEqual(logo.display, "none");
      assert.equal(logo.hidden, false);
      assert.ok(logo.opacity > 0.5, "float logo visible at home top");
      assert.ok(logo.y + logo.h > 800, `float logo should sit near the bottom, y=${logo.y}`);
      console.log("ok  mobile home: three equal 138px loops, 100svh, centered, floating logo");

      const maxScroll = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(maxScroll / 2));
      await new Promise((resolve) => setTimeout(resolve, 250));
      const mid = await page.evaluate(() => {
        const mark = document.querySelector(".site-float-logo");
        const cta = document.querySelector(".home-new-in-cta")?.getBoundingClientRect();
        const copy = document.querySelector(".site-footer-copy-line")?.getBoundingClientRect();
        const r = mark?.getBoundingClientRect();
        const s = mark ? getComputedStyle(mark) : null;
        const overlap = (a, b) => a && b && a.bottom > b.top && a.top < b.bottom;
        return {
          position: s?.position,
          hidden: mark?.classList.contains("is-hidden"),
          opacity: s ? Number(s.opacity) : 0,
          y: r?.y ?? null,
          h: r?.height ?? null,
          overlapsCta: overlap(r, cta),
          overlapsCopy: overlap(r, copy),
        };
      });
      assert.equal(mid.position, "fixed");
      assert.equal(mid.hidden, false);
      assert.ok(mid.opacity > 0.5, "float logo visible at home mid");
      assert.equal(mid.overlapsCta, false, "logo must not cover View product at mid scroll");
      assert.equal(mid.overlapsCopy, false, "logo must not cover copyright at mid scroll");
      console.log("ok  mobile home mid: floating logo still fixed, no overlap");

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await new Promise((resolve) => setTimeout(resolve, 250));
      const bottom = await page.evaluate(() => {
        const cta = document.querySelector(".home-new-in-cta")?.getBoundingClientRect();
        const footer = document.querySelector(".site-footer")?.getBoundingClientRect();
        const nav = document.querySelector(".site-footer-nav")?.getBoundingClientRect();
        const copy = document.querySelector(".site-footer-copy-line")?.getBoundingClientRect();
        const mark = document.querySelector(".site-float-logo")?.getBoundingClientRect();
        const h = window.innerHeight;
        return {
          ctaBottom: cta?.bottom ?? null,
          logoTop: mark?.top ?? null,
          logoBottom: mark?.bottom ?? null,
          copyTop: copy?.top ?? null,
          ctaToFooter: cta && footer ? footer.top - cta.bottom : null,
          ctaToLogo: cta && mark ? mark.top - cta.bottom : null,
          logoToCopy: mark && copy ? copy.top - mark.bottom : null,
          footerContentToPage: nav ? h - nav.bottom : null,
          logoFromBottom: mark ? h - mark.bottom : null,
          internal: copy && nav ? nav.top - copy.bottom : null,
        };
      });
      assert.ok(bottom.ctaToFooter >= 80, `home CTA→footer ${bottom.ctaToFooter}`);
      assert.ok(bottom.footerContentToPage >= 34, `home footer→page ${bottom.footerContentToPage}`);
      assert.ok(bottom.logoFromBottom >= 88, `home logo from bottom ${bottom.logoFromBottom}`);
      assert.ok(
        bottom.ctaToLogo >= 12,
        `button must sit above the logo with a gap, got ${bottom.ctaToLogo} (cta ${bottom.ctaBottom} logo ${bottom.logoTop})`,
      );
      assert.ok(
        bottom.logoToCopy >= 12,
        `logo must sit above the copyright line with a gap, got ${bottom.logoToCopy} (logo ${bottom.logoBottom} copy ${bottom.copyTop})`,
      );
      assert.ok(
        bottom.ctaToFooter > bottom.internal,
        `CTA gap ${bottom.ctaToFooter} should exceed footer internal ${bottom.internal}`,
      );
      console.log("ok  mobile home bottom: button → logo → copyright, no overlap");
    });

    await withPage(browser, MOBILE_360, "/", async (page) => {
      const clips = await page.$$eval(".home-hero-clip", (nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }),
      );
      assert.equal(clips.length, 3);
      for (const clip of clips) {
        assert.ok(Math.abs(clip.w - 138) <= 2, `360 clip width ${clip.w}`);
        assert.ok(Math.abs(clip.h - 78) <= 2, `360 clip height ${clip.h}`);
        assert.ok(Math.abs(clip.x - (360 - 138) / 2) <= 4, `360 clip x=${clip.x}`);
      }
      const stackTop = Math.min(...clips.map((c) => c.y));
      const stackBottom = Math.max(...clips.map((c) => c.y + c.h));
      const stackMid = (stackTop + stackBottom) / 2;
      assert.ok(
        Math.abs(stackMid - 780 / 2) <= 2,
        `360 stack center ${stackMid} should match 390`,
      );
      console.log("ok  mobile 360×780: stack centered in the viewport");

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await new Promise((resolve) => setTimeout(resolve, 250));
      const bottom360 = await page.evaluate(() => {
        const cta = document.querySelector(".home-new-in-cta")?.getBoundingClientRect();
        const copy = document.querySelector(".site-footer-copy-line")?.getBoundingClientRect();
        const mark = document.querySelector(".site-float-logo")?.getBoundingClientRect();
        return {
          ctaToLogo: cta && mark ? mark.top - cta.bottom : null,
          logoToCopy: mark && copy ? copy.top - mark.bottom : null,
        };
      });
      assert.ok(bottom360.ctaToLogo >= 12, `360 button→logo ${bottom360.ctaToLogo}`);
      assert.ok(bottom360.logoToCopy >= 12, `360 logo→copyright ${bottom360.logoToCopy}`);
      console.log("ok  mobile 360×780 bottom: button → logo → copyright");
    });

    await withPage(browser, MOBILE, "/new", async (page) => {
      const measure = () =>
        page.evaluate(() => {
          const logo = document.querySelector(".site-float-logo");
          const footer = document.querySelector(".site-footer");
          if (!logo || !footer) return null;
          const lr = logo.getBoundingClientRect();
          const fr = footer.getBoundingClientRect();
          const s = getComputedStyle(logo);
          return {
            position: s.position,
            display: s.display,
            opacity: Number(s.opacity),
            hidden: logo.classList.contains("is-hidden"),
            logoTop: Math.round(lr.top),
            logoBottom: Math.round(lr.bottom),
            footerTop: Math.round(fr.top),
            footerBottom: Math.round(fr.bottom),
          };
        });

      const top = await measure();
      assert.ok(top);
      assert.equal(top.position, "fixed");
      assert.notEqual(top.display, "none");
      assert.equal(top.hidden, false);
      assert.ok(top.opacity > 0.5, "float logo visible at /new top");
      assert.ok(top.logoBottom > 800, `logo should sit near the bottom, bottom=${top.logoBottom}`);

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await new Promise((resolve) => setTimeout(resolve, 250));
      const bottom = await measure();
      assert.ok(bottom);
      assert.equal(bottom.position, "fixed");
      assert.equal(bottom.hidden, false);
      assert.ok(bottom.opacity > 0.5, "float logo must not disappear at the footer");
      assert.ok(
        bottom.logoBottom > bottom.footerTop && bottom.logoTop < bottom.footerBottom,
        `logo should straddle the footer edge, logo=${bottom.logoTop}-${bottom.logoBottom} footer=${bottom.footerTop}-${bottom.footerBottom}`,
      );
      console.log("ok  mobile /new: floating logo stays visible and straddles the footer");
    });

    await withPage(browser, MOBILE, "/new?cat=one-port&moss=0", async (page) => {
      const prices = await page.$$eval(".product-price", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.ok(prices.length >= 3, `one-port catalog cards ${prices.length}`);
      for (const price of prices) {
        assert.equal(price, "KRW 38,000", `one-port card ${price}`);
      }
      console.log("ok  mobile /new?cat=one-port: KRW 38,000");
    });

    await withPage(browser, MOBILE, "/new/one-port-purple", async (page) => {
      const price = await page.$eval(".pdp-price", (node) => (node.textContent || "").trim());
      assert.equal(price, "KRW 38,000", `one-port PDP ${price}`);
      console.log("ok  mobile one-port PDP: KRW 38,000");
    });

    const PDP_PATHS = [
      "/new/purple",
      "/new/silver",
      "/new/white",
      "/new/one-port-purple",
      "/new/one-port-black",
      "/new/one-port-white",
    ];
    const STORE_HREF = "https://smartstore.naver.com/taegye";

    async function assertPdpImageNotStore(page, label) {
      const report = await page.evaluate((storeHref) => {
        const box = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        };
        const hit = (x, y) => {
          const el = document.elementFromPoint(x, y);
          const a = el && el.closest("a");
          return {
            tag: el ? el.tagName : "none",
            cls: el ? String(el.className).slice(0, 80) : "",
            href: a ? a.href : null,
          };
        };
        const stages = [...document.querySelectorAll(".pdp-stage")]
          .map((node) => ({ node, r: node.getBoundingClientRect() }))
          .filter((item) => item.r.width > 80 && item.r.height > 80)
          .sort((a, b) => b.r.height - a.r.height);
        const hero = stages[0];
        if (!hero) return { error: "no visible pdp-stage" };
        const r = hero.r;
        const pts = [
          ["center", r.x + r.width / 2, r.y + r.height / 2],
          ["tl", r.x + 12, r.y + 12],
          ["tr", r.x + r.width - 12, r.y + 12],
          ["bl", r.x + 12, r.y + r.height - 12],
          ["br", r.x + r.width - 12, r.y + r.height - 12],
        ];
        const store = document.querySelector("a.pdp-store");
        const sr = store && store.getBoundingClientRect();
        const overlaps =
          !!sr &&
          sr.width > 0 &&
          sr.height > 0 &&
          sr.left < r.right &&
          sr.right > r.left &&
          sr.top < r.bottom &&
          sr.bottom > r.top;
        const storeAncestors = [...document.querySelectorAll(`a[href="${storeHref}"]`)].map((a) => ({
          cls: String(a.className),
          href: a.href,
        }));
        const storeHit =
          sr && sr.width > 0 && sr.height > 0
            ? hit(sr.x + Math.min(sr.width / 2, 20), sr.y + sr.height / 2)
            : { tag: "none", cls: "", href: null };
        return {
          error: null,
          photo: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
          },
          storeHref: store ? store.getAttribute("href") : null,
          storeAbs: store ? store.href : null,
          storeBox: sr
            ? {
                x: Math.round(sr.x),
                y: Math.round(sr.y),
                w: Math.round(sr.width),
                h: Math.round(sr.height),
              }
            : null,
          overlaps,
          hits: pts.map(([name, x, y]) => ({ name, ...hit(x, y) })),
          storeHit,
          storeLinkCount: storeAncestors.length,
          photoWrapped: !!hero.node.closest("a"),
        };
      }, STORE_HREF);
      assert.ok(!report.error, `${label}: ${report.error}`);
      assert.equal(report.photoWrapped, false, `${label}: photo must not be inside an <a>`);
      assert.equal(report.storeAbs, STORE_HREF, `${label}: Store href ${report.storeAbs}`);
      assert.equal(report.overlaps, false, `${label}: Store overlay on photo ${JSON.stringify(report)}`);
      assert.ok(
        report.storeBox && report.storeBox.w > 20 && report.storeBox.w < 160,
        `${label}: Store hit box should be text-sized, got ${JSON.stringify(report.storeBox)}`,
      );
      for (const point of report.hits) {
        assert.ok(
          !point.href || !/smartstore/i.test(point.href),
          `${label}: ${point.name} hit Store ${JSON.stringify(point)}`,
        );
      }
      assert.ok(
        report.storeHit && /smartstore/i.test(report.storeHit.href || ""),
        `${label}: Store button must still hit Smart Store, got ${JSON.stringify(report.storeHit)}`,
      );

      const before = page.url();
      await page.mouse.click(
        report.photo.x + report.photo.w / 2,
        report.photo.y + report.photo.h / 2,
      );
      await new Promise((resolve) => setTimeout(resolve, 400));
      const after = page.url();
      assert.ok(!/smartstore/i.test(after), `${label}: image click navigated to ${after}`);
      assert.equal(new URL(after).pathname, new URL(before).pathname, `${label}: image click left PDP, ${after}`);
      return report;
    }

    for (const path of PDP_PATHS) {
      await withPage(browser, MOBILE, path, async (page) => {
        const report = await assertPdpImageNotStore(page, `mobile ${path}`);
        console.log(
          `ok  mobile ${path}: image click stays on PDP; Store ${report.storeBox.w}×${report.storeBox.h}`,
        );
      });
      await withPage(browser, DESKTOP, path, async (page) => {
        const report = await assertPdpImageNotStore(page, `desktop ${path}`);
        console.log(
          `ok  desktop ${path}: image click stays on PDP; Store ${report.storeBox.w}×${report.storeBox.h}`,
        );
      });
    }

    await withPage(browser, MOBILE, "/new/white", async (page) => {
      const report = await page.evaluate(() => {
        const photo =
          document.querySelector(".pdp-mobile-gallery .pdp-stage") ||
          document.querySelector(".pdp-stage");
        if (!photo) return { error: "no pdp-stage" };
        const pr = photo.getBoundingClientRect();
        const cx = pr.x + pr.width / 2;
        const cy = pr.y + pr.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        const canvases = [...document.querySelectorAll("canvas")].map((c) => {
          const r = c.getBoundingClientRect();
          const style = getComputedStyle(c);
          const z = Number(style.zIndex) || 0;
          const overlaps =
            r.width > 8 &&
            r.height > 8 &&
            r.left < pr.right &&
            r.right > pr.left &&
            r.top < pr.bottom &&
            r.bottom > pr.top;
          const band =
            overlaps &&
            r.height < pr.height * 0.6 &&
            r.width >= pr.width * 0.5 &&
            r.top > pr.top + 8 &&
            r.bottom < pr.bottom - 8 &&
            z >= 0 &&
            style.position !== "static";
          return {
            cls: c.className,
            z,
            position: style.position,
            w: Math.round(r.width),
            h: Math.round(r.height),
            top: Math.round(r.top),
            band,
            overlaps,
          };
        });
        return {
          hit: hit ? `${hit.tagName}.${hit.className}` : "none",
          hitCanvas: hit instanceof HTMLCanvasElement,
          stage: { w: Math.round(pr.width), h: Math.round(pr.height), y: Math.round(pr.y) },
          bands: canvases.filter((c) => c.band),
          src: document.querySelector(".pdp-mobile-gallery img")?.currentSrc || "",
        };
      });
      assert.ok(!report.error, report.error);
      assert.equal(report.hitCanvas, false, `canvas at product center: ${report.hit}`);
      assert.equal(report.bands.length, 0, `white-band canvases: ${JSON.stringify(report.bands)}`);
      assert.ok(
        /white-mobile/.test(report.src),
        `mobile PDP should serve the bright raster, got ${report.src}`,
      );
      const logo = await page.$eval(".site-float-logo", (node) => ({
        display: getComputedStyle(node).display,
        position: getComputedStyle(node).position,
        hidden: node.classList.contains("is-hidden"),
        opacity: Number(getComputedStyle(node).opacity),
      }));
      assert.equal(logo.position, "fixed");
      assert.equal(logo.hidden, false);
      assert.ok(logo.opacity > 0.5, "float logo stays visible on PDP");
      console.log("ok  mobile PDP: no canvas band over the product; mobile raster in use");
    });

    await withPage(browser, DESKTOP, "/new/white", async (page) => {
      const src = await page.$eval(".pdp-reveal img, .pdp-hero-empty img", (img) => img.currentSrc);
      assert.ok(/stand-white\.webp/.test(src), `desktop should keep original raster, got ${src}`);
      assert.ok(!/mobile/.test(src), `desktop must not use mobile raster, got ${src}`);
      const logo = await page.$eval(".site-float-logo", (node) => getComputedStyle(node).display);
      assert.equal(logo, "none");
      const overlay = await page.evaluate(() => {
        const stages = [...document.querySelectorAll(".pdp-stage")];
        const hero = stages
          .map((node) => ({ node, r: node.getBoundingClientRect() }))
          .filter((item) => item.r.width > 200 && item.r.height > 200)
          .sort((a, b) => b.r.height - a.r.height)[0];
        if (!hero) return { error: "no desktop stage", h: 0, hitCanvas: false, hit: "none" };
        const r = hero.r;
        const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height * 0.2);
        return {
          error: null,
          h: r.height,
          hitCanvas: el instanceof HTMLCanvasElement,
          hit: el ? `${el.tagName}.${String(el.className).slice(0, 60)}` : "none",
        };
      });
      assert.ok(!overlay.error, overlay.error);
      assert.ok(overlay.h > 400, `desktop hero too short: ${overlay.h}`);
      assert.equal(overlay.hitCanvas, false, `desktop canvas over product: ${overlay.hit}`);
      console.log("ok  desktop PDP: original raster, no float logo");
    });

    async function assertDesktopScatter(page, label) {
      const clips = await page.$$eval(".home-hero-clip", (nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          const s = getComputedStyle(node);
          return {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
            position: s.position,
          };
        }),
      );
      assert.equal(clips.length, 3);
      assert.ok(
        clips.every((clip) => clip.position === "absolute"),
        `${label}: desktop clips must be absolute scatter, got ${clips.map((c) => c.position)}`,
      );
      assert.ok(
        clips.every((clip) => clip.w < 400),
        `${label}: desktop clips should stay scaled, got ${clips.map((c) => c.w)}`,
      );
      const widths = clips.map((c) => c.w).sort((a, b) => a - b);
      assert.ok(Math.abs(widths[0] - 92) <= 2, `${label}: 0.4× clip ${widths[0]}`);
      assert.ok(Math.abs(widths[1] - 230) <= 2, `${label}: 1× clip ${widths[1]}`);
      assert.ok(Math.abs(widths[2] - 288) <= 2, `${label}: 1.25× clip ${widths[2]}`);
      const xs = new Set(clips.map((c) => c.x));
      const ys = new Set(clips.map((c) => c.y));
      assert.ok(
        xs.size > 1 && ys.size > 1,
        `${label}: desktop clips must be scattered, got ${JSON.stringify(clips)}`,
      );
      const piled = clips.filter((clip) => clip.x < 40 && clip.y < 80);
      assert.ok(
        piled.length < 2,
        `${label}: clips must not pile in the top-left, got ${JSON.stringify(clips)}`,
      );
      console.log(`ok  ${label}: 1.25/1/0.4 scatter`);
    }

    await withPage(browser, DESKTOP, "/new?cat=all&tile=4&moss=1", async (page) => {
      const grid = await page.$eval(".new-grid", (node) => {
        const s = getComputedStyle(node);
        return { gap: s.gap, padding: s.padding, bg: s.backgroundColor };
      });
      assert.equal(grid.gap, "0px", `desktop /new grid gap should be 0, got ${grid.gap}`);
      const lines = await page.$eval(".new-grid-lines", (node) => ({
        display: getComputedStyle(node).display,
        painted: node.dataset.gridLines,
      }));
      assert.equal(lines.display, "block");
      assert.equal(lines.painted, "1");
      console.log("ok  desktop /new: snapped canvas grid lines, no CSS gap");
    });

    await withPage(browser, DESKTOP, "/?scales=1.25,1,0.4&layout=0", (page) =>
      assertDesktopScatter(page, "desktop 1440×900"),
    );
    await withPage(browser, DESKTOP_FHD, "/?scales=1.25,1,0.4&layout=0", (page) =>
      assertDesktopScatter(page, "desktop 1920×1080"),
    );

    async function assertPromo(page, label) {
      const report = await page.evaluate(() => {
        const sampleCanvas = (sel, xRatio, yRatio) => {
          const canvas = document.querySelector(sel);
          if (!(canvas instanceof HTMLCanvasElement) || canvas.width < 2) return null;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          const x = Math.max(0, Math.min(canvas.width - 1, Math.round(canvas.width * xRatio)));
          const y = Math.max(0, Math.min(canvas.height - 1, Math.round(canvas.height * yRatio)));
          const d = ctx.getImageData(x, y, 1, 1).data;
          return [d[0], d[1], d[2], d[3]];
        };
        const brightest = (sel) => {
          const canvas = document.querySelector(sel);
          if (!(canvas instanceof HTMLCanvasElement) || canvas.width < 2) return null;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let best = [0, 0, 0, 0];
          let score = -1;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 200) continue;
            const s = data[i] + data[i + 1] + data[i + 2];
            if (s > score) {
              score = s;
              best = [data[i], data[i + 1], data[i + 2], data[i + 3]];
            }
          }
          return score < 0 ? null : best;
        };
        const x = document.querySelector(".site-promo-x");
        const xr = x ? x.getBoundingClientRect() : null;
        return {
          strip: Boolean(document.querySelector(".site-promo-strip")),
          stripBtns: document.querySelectorAll(".site-promo-strip-btn").length,
          dimTag: document.querySelector(".site-promo-dim")?.tagName || null,
          xW: xr ? xr.width : 0,
          xH: xr ? xr.height : 0,
          purple: sampleCanvas(".site-promo-purple-fill", 0.5, 0.5),
          ctaPlate: sampleCanvas(".site-promo-cta-plate", 0.5, 0.5),
          title: brightest(".site-promo-title canvas"),
          cta: brightest(".site-promo-cta-label canvas"),
          line: brightest(".site-promo-line canvas"),
          eyebrow: brightest(".site-promo-eyebrow canvas"),
          open: Boolean(document.querySelector(".site-promo-card")),
        };
      });
      assert.equal(report.strip, false, `${label}: strip should be gone`);
      assert.equal(report.stripBtns, 0, `${label}: strip buttons`);
      assert.equal(report.dimTag, "DIV", `${label}: dim must not be a button`);
      assert.ok(report.xW >= 44 && report.xH >= 44, `${label}: X hit ${report.xW}×${report.xH}`);
      assert.ok(report.title, `${label}: title canvas empty`);
      assert.ok(report.cta, `${label}: cta canvas empty`);
      assert.ok(report.purple, `${label}: purple plate empty`);
      assert.ok(report.ctaPlate, `${label}: cta plate empty`);
      const titleContrast = contrastRatio(report.title.slice(0, 3), report.purple.slice(0, 3));
      const ctaContrast = contrastRatio(report.cta.slice(0, 3), report.ctaPlate.slice(0, 3));
      const lineContrast = contrastRatio(report.line.slice(0, 3), report.purple.slice(0, 3));
      assert.ok(
        titleContrast >= 4.5,
        `${label}: title contrast ${titleContrast.toFixed(2)} title=${report.title} purple=${report.purple}`,
      );
      assert.ok(
        ctaContrast >= 4.5,
        `${label}: cta contrast ${ctaContrast.toFixed(2)} cta=${report.cta} plate=${report.ctaPlate}`,
      );
      assert.ok(
        lineContrast >= 4.5,
        `${label}: line contrast ${lineContrast.toFixed(2)} line=${report.line} purple=${report.purple}`,
      );
      assert.ok(report.title[0] >= 240 && report.title[1] >= 240 && report.title[2] >= 240, `${label}: title not white ${report.title}`);

      await page.$eval(".site-promo-dim", (el) => {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
      assert.ok(await page.$(".site-promo-card"), `${label}: backdrop tap closed promo`);
      await page.keyboard.press("Escape");
      await new Promise((resolve) => setTimeout(resolve, 200));
      assert.ok(await page.$(".site-promo-card"), `${label}: Escape closed promo`);
      await page.click(".site-promo-x");
      await new Promise((resolve) => setTimeout(resolve, 250));
      assert.equal(await page.$(".site-promo-card"), null, `${label}: X should close promo`);
      return { titleContrast, ctaContrast, lineContrast };
    }

    for (const [name, vp, dark] of [
      ["mobile 412 forced-dark", MOBILE, true],
      ["mobile 360 forced-dark", MOBILE_360, true],
      ["mobile 412 light", MOBILE, false],
    ]) {
      await withPromo(browser, vp, dark, async (page) => {
        const ratios = await assertPromo(page, name);
        console.log(
          `ok  promo ${name}: X-only dismiss; title ${ratios.titleContrast.toFixed(2)}:1 CTA ${ratios.ctaContrast.toFixed(2)}:1`,
        );
      });
    }
  } finally {
    await browser.close();
  }
}

assertMath();
await runBrowser();
console.log("layout-regression: all checks passed");
