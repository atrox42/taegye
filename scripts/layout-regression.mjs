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
      assert.ok(Math.abs(hero.h - 915) <= 2, `hero should be 100lvh, got ${hero.h}`);
      assert.equal(hero.overflow, "hidden");
      assert.equal(hero.justify, "center");
      assert.equal(hero.align, "center");
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
      console.log("ok  mobile home: three equal 138px loops, 100lvh, floating logo");
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

    await withPage(browser, DESKTOP, "/?scales=1.25,1,0.4&layout=0", (page) =>
      assertDesktopScatter(page, "desktop 1440×900"),
    );
    await withPage(browser, DESKTOP_FHD, "/?scales=1.25,1,0.4&layout=0", (page) =>
      assertDesktopScatter(page, "desktop 1920×1080"),
    );
  } finally {
    await browser.close();
  }
}

assertMath();
await runBrowser();
console.log("layout-regression: all checks passed");
