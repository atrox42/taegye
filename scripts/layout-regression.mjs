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
      const strip = document.querySelector(".site-promo-strip-btn canvas");
      return (
        title instanceof HTMLCanvasElement &&
        title.width > 4 &&
        strip instanceof HTMLCanvasElement &&
        strip.width > 4
      );
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
      assert.ok(bottom.ctaToFooter >= 105, `home CTA→footer ${bottom.ctaToFooter}`);
      assert.ok(bottom.footerContentToPage >= 34, `home footer→page ${bottom.footerContentToPage}`);
      assert.ok(bottom.logoFromBottom >= 88, `home logo from bottom ${bottom.logoFromBottom}`);
      assert.ok(
        Math.abs(bottom.ctaToLogo - 50.4) <= 2,
        `button→logo should be ~50.4px (double 25.2), got ${bottom.ctaToLogo}`,
      );
      assert.ok(
        Math.abs(bottom.logoToCopy - 19.8) <= 1,
        `logo→copyright must stay ~19.8px, got ${bottom.logoToCopy}`,
      );
      assert.ok(
        Math.abs(bottom.logoFromBottom - 92) <= 1,
        `logo bottom offset must stay 92px, got ${bottom.logoFromBottom}`,
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
        const h = window.innerHeight;
        return {
          ctaToLogo: cta && mark ? mark.top - cta.bottom : null,
          logoToCopy: mark && copy ? copy.top - mark.bottom : null,
          logoFromBottom: mark ? h - mark.bottom : null,
        };
      });
      assert.ok(
        Math.abs(bottom360.ctaToLogo - 50.4) <= 2,
        `360 button→logo should be ~50.4px, got ${bottom360.ctaToLogo}`,
      );
      assert.ok(
        Math.abs(bottom360.logoFromBottom - 92) <= 1,
        `360 logo bottom offset must stay 92px, got ${bottom360.logoFromBottom}`,
      );
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
      console.log("ok  mobile /new: floating logo stays visible at the footer");
    });

    async function assertFooterLogoMatchesHome(page, label) {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await new Promise((resolve) => setTimeout(resolve, 250));
      const bottom = await page.evaluate(() => {
        const logo = document.querySelector(".site-float-logo")?.getBoundingClientRect();
        const copy = document.querySelector(".site-footer-copy-line")?.getBoundingClientRect();
        const h = window.innerHeight;
        const w = window.innerWidth;
        return {
          w: logo?.width ?? null,
          h: logo?.height ?? null,
          x: logo?.x ?? null,
          logoFromBottom: logo ? h - logo.bottom : null,
          logoToCopy: logo && copy ? copy.top - logo.bottom : null,
          centerOff: logo ? logo.x + logo.width / 2 - w / 2 : null,
        };
      });
      assert.ok(Math.abs((bottom.w ?? 0) - 67) <= 1, `${label}: logo width ${bottom.w}`);
      assert.ok(Math.abs((bottom.h ?? 0) - 43) <= 1, `${label}: logo height ${bottom.h}`);
      assert.ok(Math.abs(bottom.centerOff ?? 99) <= 2, `${label}: logo not centered, off=${bottom.centerOff}`);
      assert.ok(
        Math.abs((bottom.logoFromBottom ?? 0) - 92) <= 1,
        `${label}: logo from bottom ${bottom.logoFromBottom}`,
      );
      assert.ok(
        Math.abs((bottom.logoToCopy ?? 0) - 19.8) <= 1,
        `${label}: logo→copyright ${bottom.logoToCopy}`,
      );
    }

    for (const id of [
      "silver",
      "purple",
      "black",
      "green",
      "white",
      "one-port-purple",
      "one-port-black",
      "one-port-white",
    ]) {
      await withPage(browser, MOBILE, `/new/${id}`, async (page) => {
        await assertFooterLogoMatchesHome(page, `412 ${id}`);
        console.log(`ok  mobile 412 PDP ${id}: float logo matches home`);
      });
    }
    await withPage(browser, MOBILE_360, "/new/silver", async (page) => {
      await assertFooterLogoMatchesHome(page, "360 silver");
      console.log("ok  mobile 360 PDP silver: float logo matches home");
    });
    await withPage(browser, MOBILE, "/new", async (page) => {
      await assertFooterLogoMatchesHome(page, "412 /new");
      console.log("ok  mobile 412 /new: float logo matches home");
    });
    await withPage(browser, MOBILE, "/new?cat=one-port", async (page) => {
      await assertFooterLogoMatchesHome(page, "412 /new?cat=one-port");
      console.log("ok  mobile 412 /new?cat=one-port: float logo matches home");
    });
    await withPage(browser, MOBILE_360, "/new", async (page) => {
      await assertFooterLogoMatchesHome(page, "360 /new");
      console.log("ok  mobile 360 /new: float logo matches home");
    });

    await withPage(browser, MOBILE, "/new?cat=one-port&moss=0", async (page) => {
      const prices = await page.$$eval(".product-price", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.ok(prices.length >= 3, `one-port catalog cards ${prices.length}`);
      for (const price of prices) {
        assert.equal(price, "KRW 38,000", `one-port card ${price}`);
      }
      const names = await page.$$eval(".product-caption p.site-type:not(.product-price)", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.deepEqual(names, ["Dot Port, Purple", "Dot Port, Black", "Dot Port, White"]);
      console.log("ok  mobile /new?cat=one-port: KRW 38,000, Dot Port names");
    });

    await withPage(browser, MOBILE, "/new/one-port-purple", async (page) => {
      const price = await page.$eval(".pdp-price", (node) => (node.textContent || "").trim());
      assert.equal(price, "KRW 38,000", `one-port PDP ${price}`);
      const name = await page.$eval(".pdp-name", (node) => (node.textContent || "").trim());
      assert.equal(name, "Dot Port, Purple");
      const title = await page.title();
      assert.match(title, /Dot Port, Purple/);
      console.log("ok  mobile one-port PDP: KRW 38,000, Dot Port title");
    });

    await withPage(browser, MOBILE, "/new", async (page) => {
      const tabs = await page.evaluate(() =>
        [...document.querySelectorAll(".new-subnav-item")].map((node) => ({
          label: (node.textContent || "").trim(),
          href: node.getAttribute("href") || "",
        })),
      );
      assert.deepEqual(
        tabs.map((tab) => tab.label),
        ["All", "Wall-kit", "Dot-port", "Drain Tower", "Cascade"],
      );
      assert.deepEqual(
        tabs.map((tab) => tab.href),
        ["/new", "/new?cat=wall-kit", "/new?cat=one-port", "/new?cat=drain-tower", "/new?cat=cascade"],
      );
      console.log("ok  mobile /new tabs: Dot-port, Drain Tower, Cascade");
    });

    await withPage(browser, MOBILE, "/new?cat=cascade", async (page) => {
      const empty = await page.$eval(".new-empty", (node) => (node.textContent || "").trim());
      assert.equal(empty, "coming soon", "cascade empty");
      console.log("ok  mobile /new?cat=cascade: coming soon");
    });

    await withPage(browser, MOBILE, "/new?cat=drain-tower&moss=0", async (page) => {
      const report = await page.evaluate(() => {
        const card = document.querySelector(".product-card");
        const img = card?.querySelector(".product-empty img");
        return {
          count: document.querySelectorAll(".product-card").length,
          name: card?.querySelector(".product-caption p.site-type")?.textContent?.trim() || "",
          price: card?.querySelector(".product-price")?.textContent?.trim() || null,
          tag: card?.tagName || "",
          href: card?.getAttribute("href"),
          still: Boolean(card?.classList.contains("is-still")),
          src: img?.getAttribute("src") || "",
          moss: Boolean(card?.querySelector(".product-moss")),
        };
      });
      assert.equal(report.count, 1, `drain-tower cards ${report.count}`);
      assert.equal(report.name, "Drain Tower 100");
      assert.equal(report.price, null, `drain-tower should have no price, got ${report.price}`);
      assert.equal(report.tag, "DIV", "drain-tower card must not be a link");
      assert.equal(report.href, null);
      assert.equal(report.still, true);
      assert.equal(report.src, "/products/drain-tower-100.png");
      assert.equal(report.moss, false, "drain-tower must not have a hover image");
      console.log("ok  mobile /new?cat=drain-tower: Drain Tower 100, no price, no PDP");
    });

    await withPage(browser, MOBILE, "/new?moss=0", async (page) => {
      const names = await page.$$eval(".product-caption p.site-type:not(.product-price)", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.ok(names.includes("Drain Tower 100"), `All missing Drain Tower 100: ${names}`);
      console.log("ok  mobile /new All: Drain Tower 100 listed");
    });

    await withPage(browser, MOBILE, "/new/drain-tower-100", async (page) => {
      const missing = await page.evaluate(() => {
        const status = document.querySelector(".pdp-name") ? "pdp" : "no-pdp";
        const heading = (document.querySelector("h1")?.textContent || "").trim();
        return { status, heading, path: location.pathname };
      });
      assert.notEqual(missing.status, "pdp", "listed-only drain tower must not render a PDP");
      console.log("ok  /new/drain-tower-100: no product detail");
    });

    for (const path of ["/new", "/new?cat=one-port", "/new/one-port-purple", "/new/one-port-black", "/new/one-port-white"]) {
      await withPage(browser, MOBILE, path, async (page) => {
        const leak = await page.evaluate(() => {
          const text = `${document.title}\n${document.body.innerText}`;
          const alts = [...document.querySelectorAll("img[alt]")].map((img) => img.getAttribute("alt") || "");
          return { text, alts };
        });
        assert.equal(/One Port|One-port/i.test(leak.text), false, `${path} visible One Port: ${leak.text}`);
        assert.ok(
          leak.alts.every((alt) => !/one port/i.test(alt)),
          `${path} alt One Port: ${leak.alts}`,
        );
        console.log(`ok  ${path}: no visible One Port`);
      });
    }

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
        const darkest = (sel) => {
          const canvas = document.querySelector(sel);
          if (!(canvas instanceof HTMLCanvasElement) || canvas.width < 2) return null;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let best = [255, 255, 255, 0];
          let score = Infinity;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 200) continue;
            const s = data[i] + data[i + 1] + data[i + 2];
            if (s < score) {
              score = s;
              best = [data[i], data[i + 1], data[i + 2], data[i + 3]];
            }
          }
          return score === Infinity ? null : best;
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
          stripInk: darkest(".site-promo-strip-btn canvas"),
          stripPlate: sampleCanvas(".site-promo-strip .canvas-white-fill", 0.5, 0.5),
          hideLabel: document.querySelector(".site-promo-strip-btn .sr-only")?.textContent || "",
          closeLabel:
            document.querySelector(".site-promo-strip-close .sr-only")?.textContent || "",
          open: Boolean(document.querySelector(".site-promo-card")),
          ctaToPurple: (() => {
            const cta = document.querySelector(".site-promo-cta")?.getBoundingClientRect();
            const visual = document.querySelector(".site-promo-visual")?.getBoundingClientRect();
            return cta && visual ? visual.bottom - cta.bottom : null;
          })(),
          vw: window.innerWidth,
        };
      });
      assert.equal(report.strip, true, `${label}: hide-today / close strip missing`);
      assert.equal(report.stripBtns, 2, `${label}: strip buttons`);
      assert.equal(report.hideLabel, "오늘 하루 보지 않기", `${label}: hide-today label`);
      assert.equal(report.closeLabel, "닫기", `${label}: close label`);
      assert.equal(report.dimTag, "DIV", `${label}: dim must not be a button`);
      assert.ok(report.xW >= 44 && report.xH >= 44, `${label}: X hit ${report.xW}×${report.xH}`);
      const expectedPad = report.vw <= 400 ? 25.2 : 31.5;
      assert.ok(
        Math.abs((report.ctaToPurple ?? 0) - expectedPad) <= 1,
        `${label}: CTA→purple should be ~${expectedPad}px, got ${report.ctaToPurple}`,
      );
      assert.ok(report.title, `${label}: title canvas empty`);
      assert.ok(report.cta, `${label}: cta canvas empty`);
      assert.ok(report.purple, `${label}: purple plate empty`);
      assert.ok(report.ctaPlate, `${label}: cta plate empty`);
      assert.ok(report.stripInk, `${label}: strip ink canvas empty`);
      assert.ok(report.stripPlate, `${label}: strip white plate empty`);
      const titleContrast = contrastRatio(report.title.slice(0, 3), report.purple.slice(0, 3));
      const ctaContrast = contrastRatio(report.cta.slice(0, 3), report.ctaPlate.slice(0, 3));
      const lineContrast = contrastRatio(report.line.slice(0, 3), report.purple.slice(0, 3));
      const stripContrast = contrastRatio(report.stripInk.slice(0, 3), report.stripPlate.slice(0, 3));
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
      assert.ok(
        stripContrast >= 4.5,
        `${label}: strip contrast ${stripContrast.toFixed(2)} ink=${report.stripInk} plate=${report.stripPlate}`,
      );
      assert.ok(report.title[0] >= 240 && report.title[1] >= 240 && report.title[2] >= 240, `${label}: title not white ${report.title}`);
      assert.ok(
        report.stripInk[0] <= 30 && report.stripInk[1] <= 30 && report.stripInk[2] <= 30,
        `${label}: strip ink must stay near-black, got ${report.stripInk}`,
      );
      assert.ok(
        report.stripPlate[0] >= 240 && report.stripPlate[1] >= 240 && report.stripPlate[2] >= 240,
        `${label}: strip plate must stay white, got ${report.stripPlate}`,
      );

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
      return { titleContrast, ctaContrast, lineContrast, stripContrast };
    }

    async function assertPromoActions(page, label) {
      const before = await page.evaluate(() => ({
        hideUntil: window.localStorage.getItem("taegye-promo-hide-until"),
        closed: window.sessionStorage.getItem("taegye-promo-closed"),
      }));
      assert.equal(before.hideUntil, null, `${label}: hide-until should start empty`);
      await page.click(".site-promo-strip-close");
      await new Promise((resolve) => setTimeout(resolve, 250));
      assert.equal(await page.$(".site-promo-card"), null, `${label}: 닫기 should close promo`);
      const afterClose = await page.evaluate(() => ({
        hideUntil: window.localStorage.getItem("taegye-promo-hide-until"),
        closed: window.sessionStorage.getItem("taegye-promo-closed"),
      }));
      assert.equal(afterClose.closed, "1", `${label}: 닫기 should mark the session`);
      assert.equal(afterClose.hideUntil, null, `${label}: 닫기 must not hide today`);
    }

    for (const [name, vp, dark] of [
      ["mobile 412 forced-dark", MOBILE, true],
      ["mobile 360 forced-dark", MOBILE_360, true],
      ["mobile 412 light", MOBILE, false],
    ]) {
      await withPromo(browser, vp, dark, async (page) => {
        const ratios = await assertPromo(page, name);
        console.log(
          `ok  promo ${name}: strip+X; title ${ratios.titleContrast.toFixed(2)}:1 CTA ${ratios.ctaContrast.toFixed(2)}:1 strip ${ratios.stripContrast.toFixed(2)}:1`,
        );
      });
    }

    async function assertPromoScrollLock(page, label) {
      const before = await page.evaluate(() => {
        const box = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { y: r.y, h: r.height };
        };
        return {
          y: window.scrollY,
          hero: box(".home-hero"),
          newIn: box(".home-new-in-title"),
          card: box(".site-promo-card"),
          bodyPos: getComputedStyle(document.body).position,
        };
      });
      assert.equal(before.bodyPos, "fixed", `${label}: body should be fixed while promo open`);
      assert.ok(before.hero, `${label}: missing hero`);
      assert.ok(before.card, `${label}: missing card`);
      await page.mouse.move(200, 80);
      await page.mouse.wheel({ deltaY: 700 });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const vp = page.viewport();
      await page.touchscreen.touchStart(vp.width / 2, 120);
      await page.touchscreen.touchMove(vp.width / 2, 20);
      await page.touchscreen.touchEnd();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await page.evaluate(() => window.scrollTo(0, 800));
      await new Promise((resolve) => setTimeout(resolve, 200));
      const after = await page.evaluate(() => {
        const box = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { y: r.y, h: r.height };
        };
        return {
          y: window.scrollY,
          hero: box(".home-hero"),
          newIn: box(".home-new-in-title"),
          card: box(".site-promo-card"),
        };
      });
      assert.ok(
        Math.abs(after.hero.y - before.hero.y) <= 1,
        `${label}: hero moved ${before.hero.y} → ${after.hero.y}`,
      );
      assert.ok(
        Math.abs(after.card.y - before.card.y) <= 1,
        `${label}: card moved ${before.card.y} → ${after.card.y}`,
      );
      assert.ok(
        Math.abs((after.newIn?.y ?? 0) - (before.newIn?.y ?? 0)) <= 1,
        `${label}: New In moved ${before.newIn?.y} → ${after.newIn?.y}`,
      );
      await page.click(".site-promo-x");
      await new Promise((resolve) => setTimeout(resolve, 250));
      const restored = await page.evaluate(() => ({
        y: window.scrollY,
        pos: getComputedStyle(document.body).position,
        open: Boolean(document.querySelector(".site-promo-card")),
      }));
      assert.equal(restored.open, false, `${label}: promo still open`);
      assert.notEqual(restored.pos, "fixed", `${label}: body still fixed after close`);
      assert.ok(
        Math.abs(restored.y - before.y) <= 2,
        `${label}: scroll restored ${restored.y} vs ${before.y}`,
      );
      await page.evaluate(() => window.scrollTo(0, 400));
      await new Promise((resolve) => setTimeout(resolve, 150));
      const canScroll = await page.evaluate(() => window.scrollY);
      assert.ok(canScroll >= 300, `${label}: page should scroll after close, got ${canScroll}`);
    }

    for (const [name, vp] of [
      ["mobile 412", MOBILE],
      ["mobile 360", MOBILE_360],
    ]) {
      await withPromo(browser, vp, false, async (page) => {
        await assertPromoScrollLock(page, name);
        console.log(`ok  promo ${name}: background stays pinned while open`);
      });
    }

    await withPromo(browser, MOBILE, false, async (page) => {
      await assertPromoActions(page, "mobile 412 close");
      console.log("ok  promo 닫기 closes for the session only");
    });
    await withPromo(browser, MOBILE, false, async (page) => {
      await page.click(".site-promo-strip-btn:not(.site-promo-strip-close)");
      await new Promise((resolve) => setTimeout(resolve, 250));
      assert.equal(await page.$(".site-promo-card"), null, "hide-today should close promo");
      const stored = await page.evaluate(() => ({
        hideUntil: Number(window.localStorage.getItem("taegye-promo-hide-until") || "0"),
        closed: window.sessionStorage.getItem("taegye-promo-closed"),
      }));
      assert.equal(stored.closed, "1", "hide-today should mark the session");
      assert.ok(stored.hideUntil > Date.now(), `hide-today until ${stored.hideUntil}`);
      assert.ok(stored.hideUntil <= Date.now() + 24 * 60 * 60 * 1000 + 1000, "hide-today window");
      console.log("ok  promo 오늘 하루 보지 않기 stores hide-until");
    });

    async function withSplash(browser, viewport, fn) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      await page.goto(`${BASE}/?intro=hold&promo=skip`, {
        waitUntil: "load",
        timeout: 60000,
      });
      await page.waitForSelector(".site-splash-copy");
      await page.waitForFunction(
        () => document.querySelector(".site-splash-line.is-painted"),
        { timeout: 15000 },
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      try {
        return await fn(page);
      } finally {
        await page.close();
      }
    }

    for (const [name, vp] of [
      ["mobile 412", MOBILE],
      ["mobile 360", MOBILE_360],
    ]) {
      await withSplash(browser, vp, async (page) => {
        const report = await page.evaluate(() => {
          const copy = document.querySelector(".site-splash-copy");
          const s = copy ? getComputedStyle(copy) : null;
          const canvas = document.querySelector(".site-splash-type");
          let ink = null;
          if (canvas instanceof HTMLCanvasElement && canvas.width > 2) {
            const ctx = canvas.getContext("2d");
            const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let best = null;
            let dark = 999;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] < 200) continue;
              const v = data[i] + data[i + 1] + data[i + 2];
              if (v < dark) {
                dark = v;
                best = [data[i], data[i + 1], data[i + 2], data[i + 3]];
              }
            }
            ink = best;
          }
          return {
            text: (copy?.textContent || "").replace(/\s+/g, " ").trim(),
            fontSize: s?.fontSize || "",
            letterSpacing: s?.letterSpacing || "",
            splashDisplay: getComputedStyle(document.querySelector(".site-splash")).display,
            painted: document.querySelectorAll(".site-splash-line.is-painted").length,
            ink,
          };
        });
        assert.match(report.text, /ALL/);
        assert.match(report.text, /TAEGYE-RIUM/);
        assert.equal(report.splashDisplay, "flex");
        assert.equal(report.painted, 2);
        const fs = parseFloat(report.fontSize);
        const ls = parseFloat(report.letterSpacing);
        assert.ok(Math.abs(fs - 18.4) < 0.05, `${name} font-size ${report.fontSize}`);
        assert.ok(Math.abs(ls - 1.1776) < 0.05, `${name} letter-spacing ${report.letterSpacing}`);
        assert.ok(report.ink, `${name}: no black canvas pixels`);
        assert.ok(report.ink[0] <= 8 && report.ink[1] <= 8 && report.ink[2] <= 8, `${name}: not black ${report.ink}`);
        console.log(`ok  splash ${name}: ${report.fontSize} / ${report.letterSpacing}, canvas black`);
      });
    }
  } finally {
    await browser.close();
  }
}

assertMath();
await runBrowser();
console.log("layout-regression: all checks passed");
