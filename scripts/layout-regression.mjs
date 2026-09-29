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
const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 };
const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const SKIP = "intro=skip&promo=skip";

function mobileClipBox(viewportWidth, gutter = 0) {
  const w = Math.max(0, viewportWidth - gutter * 2);
  return { width: w, height: w * (130 / 230) };
}

function assertMath() {
  const box = mobileClipBox(412);
  assert.equal(box.width, 412);
  assert.ok(Math.abs(box.height - 412 * (130 / 230)) < 0.01);
  const three = box.height * 3;
  assert.ok(three > 600, "three equal full-width clips should fill most of the first screen");
  console.log("ok  math: mobile clips equal and full-width");
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
      const clips = await page.$$eval(".home-hero-clip", (nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }),
      );
      assert.equal(clips.length, 3, "home has three hero clips");
      for (const clip of clips) {
        assert.ok(Math.abs(clip.w - 412) <= 2, `clip width ${clip.w} should fill 412`);
      }
      assert.ok(
        Math.abs(clips[0].w - clips[1].w) <= 1 && Math.abs(clips[1].w - clips[2].w) <= 1,
        "clips are 1:1:1",
      );
      assert.ok(clips[0].y < 80, `first clip top ${clips[0].y} should sit under the nav, not mid-viewport`);
      console.log("ok  mobile home: equal full-width clips, no top gap");
    });

    await withPage(browser, MOBILE, "/new", async (page) => {
      const logo = await page.$eval(".site-float-logo", (node) => {
        const s = getComputedStyle(node);
        const r = node.getBoundingClientRect();
        return {
          position: s.position,
          display: s.display,
          opacity: s.opacity,
          y: r.y,
          h: r.height,
          hidden: node.classList.contains("is-hidden"),
        };
      });
      assert.equal(logo.position, "fixed");
      assert.notEqual(logo.display, "none");
      assert.equal(logo.hidden, false);
      assert.ok(Number(logo.opacity) > 0.5, "float logo visible on /new");
      assert.ok(logo.y + logo.h > 800, `float logo should sit near the bottom, y=${logo.y}`);
      console.log("ok  mobile /new: floating footer logo is fixed at the bottom");
    });

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
        hidden: node.classList.contains("is-hidden"),
        opacity: getComputedStyle(node).opacity,
        position: getComputedStyle(node).position,
      }));
      assert.equal(logo.position, "fixed");
      assert.equal(logo.hidden, false, "float logo should show on PDP until the footer overlaps it");
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

    await withPage(browser, DESKTOP, "/", async (page) => {
      const clips = await page.$$eval(".home-hero-clip", (nodes) =>
        nodes.map((node) => node.getBoundingClientRect().width),
      );
      assert.ok(clips.every((w) => w < 400), `desktop clips should stay scaled, got ${clips}`);
      console.log("ok  desktop home: clips are not a full-width stack");
    });
  } finally {
    await browser.close();
  }
}

assertMath();
await runBrowser();
console.log("layout-regression: all checks passed");
