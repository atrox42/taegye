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
const MOBILE_412_780 = { width: 412, height: 780, deviceScaleFactor: 2 };
const MOBILE_390 = { width: 390, height: 844, deviceScaleFactor: 2 };
const MOBILE_360 = { width: 360, height: 780, deviceScaleFactor: 2 };
const MOBILE_320 = { width: 320, height: 700, deviceScaleFactor: 2 };
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

function matrixParts(transform) {
  if (!transform || transform === "none") return [1, 0, 0, 1, 0, 0];
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) return null;
  return match[1].split(",").map((value) => Number.parseFloat(value.trim()));
}

async function sampleAccordionIcon(page) {
  return page.evaluate(async () => {
    const button = document.querySelector(".pdp-spec-toggle");
    const mark = button.querySelector(".pdp-spec-toggle-mark");
    const spin = button.querySelector(".pdp-spec-toggle-spin");
    const bar = button.querySelector(".pdp-spec-toggle-bar-v");
    const label = button.querySelector(".pdp-spec-label-text");
    const name = document.querySelector(".pdp-name");
    const read = () => ({
      mark: getComputedStyle(spin).transform,
      bar: getComputedStyle(bar).transform,
      opacity: Number.parseFloat(getComputedStyle(bar).opacity),
    });
    const box = (el) => {
      const rect = el.getBoundingClientRect();
      return { t: rect.top, l: rect.left, w: rect.width, h: rect.height };
    };
    const origins = {
      button: box(button),
      label: box(label),
      mark: box(mark),
      name: name ? box(name) : null,
    };
    let shift = { button: 0, label: 0, mark: 0, name: 0, markW: 0, markH: 0 };
    const track = () => {
      const next = { button: box(button), label: box(label), mark: box(mark), name: name ? box(name) : null };
      for (const key of ["button", "label", "mark", "name"]) {
        if (!origins[key] || !next[key]) continue;
        shift[key] = Math.max(shift[key], Math.abs(next[key].t - origins[key].t), Math.abs(next[key].l - origins[key].l));
      }
      shift.markW = Math.max(shift.markW, Math.abs(next.mark.w - origins.mark.w));
      shift.markH = Math.max(shift.markH, Math.abs(next.mark.h - origins.mark.h));
    };
    const markStyle = getComputedStyle(spin);
    const barStyle = getComputedStyle(bar);
    const before = read();
    const capture = () =>
      new Promise((resolve) => {
        const frames = [];
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve(frames);
        };
        spin.addEventListener(
          "transitionrun",
          () => {
            const start = performance.now();
            const step = () => {
              track();
              frames.push({ t: Math.round(performance.now() - start), ...read() });
              if (performance.now() - start < 340) requestAnimationFrame(step);
              else finish();
            };
            requestAnimationFrame(step);
          },
          { once: true },
        );
        setTimeout(finish, 700);
      });
    const opening = capture();
    button.click();
    const openFrames = await opening;
    const opened = read();
    track();
    const closing = capture();
    button.click();
    const closeFrames = await closing;
    track();
    window.scrollTo(0, 160);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const pin = button.getBoundingClientRect().top;
    const pinName = name ? name.getBoundingClientRect().top : pin;
    const pinMark = mark.getBoundingClientRect();
    button.click();
    let scrolled = 0;
    const pinStart = performance.now();
    await new Promise((resolve) => {
      const step = () => {
        const markBox = mark.getBoundingClientRect();
        scrolled = Math.max(
          scrolled,
          Math.abs(button.getBoundingClientRect().top - pin),
          Math.abs((name ? name.getBoundingClientRect().top : pin) - pinName),
          Math.abs(markBox.top - pinMark.top),
          Math.abs(markBox.width - pinMark.width),
          Math.abs(markBox.height - pinMark.height),
        );
        if (performance.now() - pinStart < 480) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 460));
    window.scrollTo(0, 0);
    return {
      markDuration: markStyle.transitionDuration,
      markProperty: markStyle.transitionProperty,
      barDuration: barStyle.transitionDuration,
      barProperty: barStyle.transitionProperty,
      before,
      openFrames,
      closeFrames,
      opened,
      closed: read(),
      shift,
      scrolled,
    };
  });
}

async function sampleStoreHover(page, selector) {
  await page.evaluate((selector) => {
    const link = document.querySelector(selector);
    const face = link.querySelector(".pdp-store-face");
    const arrow = link.querySelector(".pdp-store-arrow");
    const read = () => ({
      sweep: getComputedStyle(face, "::after").transform,
      width: Number.parseFloat(getComputedStyle(arrow).width),
      opacity: Number.parseFloat(getComputedStyle(arrow).opacity),
      duration: getComputedStyle(arrow).transitionDuration,
    });
    window.__storeRest = read();
    window.__storeMotion = [];
    arrow.addEventListener(
      "transitionrun",
      () => {
        const start = performance.now();
        const step = () => {
          window.__storeMotion.push({ t: Math.round(performance.now() - start), ...read() });
          if (performance.now() - start < 280) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { once: true },
    );
  }, selector);
  await page.hover(selector);
  await page.waitForFunction(() => (window.__storeMotion || []).length > 3, { timeout: 2000 });
  await new Promise((resolve) => setTimeout(resolve, 280));
  return page.evaluate((selector) => {
    const link = document.querySelector(selector);
    const face = link.querySelector(".pdp-store-face");
    const arrow = link.querySelector(".pdp-store-arrow");
    return {
      rest: window.__storeRest,
      frames: window.__storeMotion,
      settled: {
        sweep: getComputedStyle(face, "::after").transform,
        width: Number.parseFloat(getComputedStyle(arrow).width),
        opacity: Number.parseFloat(getComputedStyle(arrow).opacity),
        duration: getComputedStyle(arrow).transitionDuration,
      },
    };
  }, selector);
}

function assertStoreHover(report, label) {
  assert.equal(report.rest.width, 0, `${label} arrow starts hidden`);
  assert.equal(report.rest.opacity, 0, `${label} arrow starts invisible`);
  const restSweep = matrixParts(report.rest.sweep);
  assert.ok(restSweep && Math.abs(restSweep[0]) < 0.05, `${label} sweep starts closed`);
  const settled = report.settled;
  assert.ok(settled.width >= 11, `${label} arrow slides in, width ${settled.width}`);
  assert.ok(settled.opacity > 0.95, `${label} arrow becomes visible`);
  const endSweep = matrixParts(settled.sweep);
  assert.ok(endSweep && endSweep[0] > 0.95, `${label} sweep fills, got ${settled.sweep}`);
  assert.ok(String(settled.duration).startsWith("0.24s"), `${label} duration ${settled.duration}`);
  const mid = report.frames.some((frame) => {
    const parts = matrixParts(frame.sweep);
    return frame.t > 16 && frame.t < 220 && parts && parts[0] > 0.05 && parts[0] < 0.92;
  });
  assert.ok(mid, `${label} sweep should animate`);
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
      const name = document.querySelector(".site-promo-name canvas");
      const strip = document.querySelector(".site-promo-strip-btn canvas");
      return (
        name instanceof HTMLCanvasElement &&
        name.width > 4 &&
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
        capable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.getAttribute("content") || "",
        mobileCapable: document.querySelector('meta[name="mobile-web-app-capable"]')?.getAttribute("content") || "",
        appleIcon: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") || "",
        favicon: document.querySelector('link[rel="icon"]')?.getAttribute("href") || "",
        theme: [...document.querySelectorAll('meta[name="theme-color"]')].map((node) =>
          (node.getAttribute("content") || "").toLowerCase(),
        ),
      }));
      assert.match(head.viewport, /viewport-fit=cover/, `viewport ${head.viewport}`);
      assert.equal(head.manifest, "", `manifest should not be linked, got ${head.manifest}`);
      assert.equal(head.capable, "", `apple-mobile-web-app-capable should be absent, got ${head.capable}`);
      assert.equal(head.mobileCapable, "", `mobile-web-app-capable should be absent, got ${head.mobileCapable}`);
      assert.match(head.appleIcon, /apple-icon\.png/, `apple-touch-icon ${head.appleIcon}`);
      assert.ok(head.favicon.length > 0, "favicon should stay linked");
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
        const cta = document.querySelector(".home-new-in-copy")?.getBoundingClientRect();
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
        const cta = document.querySelector(".home-new-in-copy")?.getBoundingClientRect();
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
        const cta = document.querySelector(".home-new-in-copy")?.getBoundingClientRect();
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

    await withPage(browser, MOBILE, "/", async (page) => {
      const report = await page.evaluate(() => {
        const track = document.querySelector(".home-new-in-track");
        const title = document.querySelector(".home-new-in-title");
        const rule = document.querySelector(".home-new-in-rule");
        const ts = title ? getComputedStyle(title) : null;
        const tr = track ? getComputedStyle(track) : null;
        const dots = [...document.querySelectorAll(".home-new-in-slide:first-child .home-new-in-dot")].map((node) => {
          const r = node.getBoundingClientRect();
          const s = getComputedStyle(node);
          return {
            w: +r.width.toFixed(1),
            h: +r.height.toFixed(1),
            radius: s.borderRadius,
            src: node.querySelector("img")?.getAttribute("src") || "",
          };
        });
        const leak = `${document.querySelector(".home-new-in")?.innerText || ""}\n${document.title}`;
        return {
          title: title?.textContent?.trim() || "",
          titleFs: ts?.fontSize || null,
          titleFw: ts?.fontWeight || null,
          ruleH: rule ? +rule.getBoundingClientRect().height.toFixed(1) : 0,
          slides: document.querySelectorAll(".home-new-in-slide").length,
          snap: tr?.scrollSnapType || "",
          overflowX: tr?.overflowX || "",
          names: [...document.querySelectorAll(".home-new-in-name")].map((n) => n.textContent.trim()),
          prices: [...document.querySelectorAll(".home-new-in-price")].map((n) => n.textContent.trim()),
          hrefs: [...document.querySelectorAll(".home-new-in-card")].map((n) => n.getAttribute("href")),
          featured: /Featured:|View product|moss on steel/i.test(leak),
          cta: Boolean(document.querySelector(".home-new-in-cta")),
          dots,
        };
      });
      assert.equal(report.title, "New In");
      assert.equal(report.titleFs, "36px", `New In size ${report.titleFs}`);
      assert.ok(Number(report.titleFw) >= 700, `New In weight ${report.titleFw}`);
      assert.ok(report.ruleH >= 1 && report.ruleH <= 2, `New In rule ${report.ruleH}`);
      assert.equal(report.slides, 2);
      assert.match(report.snap, /mandatory/);
      assert.equal(report.overflowX, "auto");
      assert.deepEqual(report.names, ["Wall 212, HOLLOW(Translucent)", "Wall 212, ODD(Indigo Purple)"]);
      assert.deepEqual(report.prices, ["KRW 106,000", "KRW 86,000"]);
      assert.deepEqual(report.hrefs, ["/new/silver", "/new/purple"]);
      assert.equal(report.featured, false, "old Featured / View product still visible");
      assert.equal(report.cta, false);
      assert.equal(report.dots.length, 5, `color dots ${report.dots.length}`);
      for (const dot of report.dots) {
        assert.ok(dot.w >= 8 && dot.w <= 10 && Math.abs(dot.w - dot.h) <= 0.5, `dot box ${dot.w}×${dot.h}`);
        assert.equal(dot.radius, "50%", `dot radius ${dot.radius}`);
        assert.match(dot.src, /^\/swatches\/.+\.png$/);
      }
      assert.deepEqual(
        report.dots.map((dot) => dot.src),
        ["/swatches/silver.png", "/swatches/purple.png", "/swatches/black.png", "/swatches/green.png", "/swatches/white.png"],
      );
      const before = await page.evaluate(() => document.querySelector(".home-new-in-track")?.scrollLeft || 0);
      await page.evaluate(() => {
        const track = document.querySelector(".home-new-in-track");
        const slide = document.querySelector(".home-new-in-slide");
        if (track && slide) track.scrollBy({ left: slide.getBoundingClientRect().width, behavior: "instant" });
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const after = await page.evaluate(() => document.querySelector(".home-new-in-track")?.scrollLeft || 0);
      assert.ok(after > before + 40, `412 swipe scrollLeft ${before} → ${after}`);
      console.log("ok  mobile 412 New In: big title, circular swatch dots, swipe snaps");
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
          buybar: document.documentElement.classList.contains("has-pdp-buybar"),
        };
      });
      assert.ok(Math.abs((bottom.w ?? 0) - 67) <= 1, `${label}: logo width ${bottom.w}`);
      assert.ok(Math.abs((bottom.h ?? 0) - 43) <= 1, `${label}: logo height ${bottom.h}`);
      assert.ok(Math.abs(bottom.centerOff ?? 99) <= 2, `${label}: logo not centered, off=${bottom.centerOff}`);
      const fromBottom = bottom.buybar ? 148 : 92;
      assert.ok(
        Math.abs((bottom.logoFromBottom ?? 0) - fromBottom) <= 1,
        `${label}: logo from bottom ${bottom.logoFromBottom}`,
      );
      assert.ok(
        Math.abs((bottom.logoToCopy ?? 0) - 19.8) <= 1,
        `${label}: logo→copyright ${bottom.logoToCopy}`,
      );
    }

    async function assertPdpHeaderLogo(page, label) {
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      const overlaps = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        document.querySelector(".pdp-spec-toggle")?.click();
        await sleep(60);
        const headerLogo = document.querySelector(".site-pdp-logo");
        const float = document.querySelector(".site-float-logo");
        const bar = document.querySelector("[data-pdp-buybar]");
        const plate = document.querySelector(".pdp-float-plate");
        const store = document.querySelector("[data-pdp-store]");
        const max = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const docTop = (sel) => {
          const node = document.querySelector(sel);
          if (!node) return 0;
          return node.getBoundingClientRect().top + window.scrollY;
        };
        const area = (a, b) => {
          const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          return w > 0.5 && h > 0.5 ? w * h : 0;
        };
        const contentSelectors = [
          ".pdp img",
          ".pdp-crumb",
          ".pdp-name",
          ".pdp-title-color",
          ".pdp-price",
          ".pdp-swatches",
          ".pdp-swatch",
          "[data-pdp-store]",
          ".pdp-features-title",
          ".pdp-features-line",
          ".pdp-features-num",
          ".pdp-spec-toggle",
          ".pdp-spec-body",
          ".pdp-acc-row",
          ".site-footer-copy-line",
          ".site-footer-nav",
          ".site-footer-link",
        ];
        const sample = async (sampleName, y) => {
          window.scrollTo(0, Math.max(0, Math.min(max(), y)));
          await sleep(80);
          const lr = float.getBoundingClientRect();
          const floatStyle = getComputedStyle(float);
          const headerStyle = headerLogo ? getComputedStyle(headerLogo) : null;
          const br = bar.getBoundingClientRect();
          const pr = plate.getBoundingClientRect();
          const barOn = bar?.getAttribute("data-pdp-buybar") === "on";
          const problems = [];
          if (headerStyle?.display !== "none") problems.push("header logo still shown");
          if (floatStyle.display === "none" || Number(floatStyle.opacity) <= 0.5 || lr.width < 60 || lr.height < 40) {
            problems.push(`float logo ${floatStyle.display} ${lr.width.toFixed(1)}×${lr.height.toFixed(1)}`);
          }
          const centerOff = lr.left + lr.width / 2 - window.innerWidth / 2;
          if (Math.abs(centerOff) > 2) problems.push(`logo off center ${centerOff.toFixed(1)}`);
          const fromBottom = window.innerHeight - lr.bottom;
          if (Math.abs(fromBottom - 92) > 1.5) problems.push(`logo from bottom ${fromBottom.toFixed(1)}`);
          if (!store) problems.push("in-flow Store missing");
          if (!barOn) problems.push("purchase bar hidden");
          const gap = lr.top - br.bottom;
          if (gap < 15) problems.push(`bar→logo gap ${gap.toFixed(1)}`);
          if (pr.bottom < window.innerHeight - 1 || pr.top > br.top + 1 || pr.width < window.innerWidth - 2) {
            problems.push(`plate ${pr.top.toFixed(0)}-${pr.bottom.toFixed(0)} w=${pr.width.toFixed(0)}`);
          }
          for (const sel of contentSelectors) {
            for (const node of document.querySelectorAll(sel)) {
              const r = node.getBoundingClientRect();
              if (r.width < 2 || r.height < 2) continue;
              const visible = {
                left: r.left,
                right: r.right,
                top: r.top,
                bottom: Math.min(r.bottom, pr.top),
              };
              if (visible.bottom <= visible.top) continue;
              if (area(lr, visible) > 0 || (barOn && area(br, visible) > 0)) problems.push(`overlaps ${sel}`);
            }
          }
          return { name: sampleName, y: Math.round(window.scrollY), bar: barOn, problems: [...new Set(problems)] };
        };
        const rows = [
          await sample("top", 0),
          await sample("mid", docTop("[data-pdp-store]") - window.innerHeight + 220),
          await sample("features", docTop(".pdp-features-title") - 80),
          await sample("accordions", docTop(".pdp-spec-toggle") - 80),
          await sample("footer", max()),
        ];
        return {
          problems: rows.filter((row) => row.problems.length),
          barShown: rows.every((row) => row.bar),
        };
      });
      assert.deepEqual(overlaps.problems, [], `${label}: float logo ${JSON.stringify(overlaps.problems)}`);
      if (label.includes("cascade")) {
        assert.equal(overlaps.barShown, true, `${label}: purchase bar was not fixed`);
      }
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
        await assertPdpHeaderLogo(page, `412 ${id}`);
        console.log(`ok  mobile 412 PDP ${id}: logo sits in the header`);
      });
    }
    for (const [viewport, label] of [
      [MOBILE_360, "360"],
      [MOBILE_390, "390"],
      [MOBILE_412_780, "412x780"],
      [MOBILE, "412"],
    ]) {
      await withPage(browser, viewport, "/new/purple", async (page) => {
        await assertPdpHeaderLogo(page, `${label} purple`);
        console.log(`ok  mobile ${label} PDP purple: header logo clear of content`);
      });
      await withPage(browser, viewport, "/new/cascade-silver", async (page) => {
        await assertPdpHeaderLogo(page, `${label} cascade-silver`);
        console.log(`ok  mobile ${label} PDP cascade-silver: header logo clear of content`);
      });
    }
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
        assert.equal(price, "KRW 36,000", `one-port card ${price}`);
      }
      const names = await page.$$eval(".product-caption p.site-type:not(.product-price)", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.deepEqual(names, ["Starship 157, ODD(Indigo Purple)", "Starship 157, VOID(Black)", "Starship 157, MIST(White)"]);
      console.log("ok  mobile /new?cat=one-port: KRW 36,000, Starship names");
    });

    await withPage(browser, MOBILE, "/new/one-port-purple", async (page) => {
      const price = await page.$eval(".pdp-price", (node) => (node.textContent || "").trim());
      assert.equal(price, "KRW 36,000", `one-port PDP ${price}`);
      const name = await page.$eval(".pdp-name", (node) => (node.textContent || "").trim());
      const color = await page.$eval(".pdp-title-color", (node) => (node.textContent || "").trim());
      assert.equal(name, "Starship 157");
      assert.equal(color, "ODD(Indigo Purple)");
      const title = await page.title();
      assert.match(title, /Starship 157, ODD\(Indigo Purple\)/);
      const note = await page.$eval(".pdp-note", (node) => (node.textContent || "").trim());
      assert.ok(note.startsWith("Starship은"), `one-port note ${note.slice(0, 24)}`);
      const specs = await page.$$eval("[data-pdp-spec]", (nodes) =>
        nodes.map((el) => ({
          key: el.getAttribute("data-pdp-spec"),
          label:
            el.querySelector(".pdp-spec-label-text")?.innerText?.trim() ||
            el.querySelector(".pdp-spec-label")?.innerText?.trim() ||
            "",
          value: el.querySelector(".pdp-spec-value")?.textContent?.trim() || "",
          lines: [...el.querySelectorAll(".pdp-spec-line, .pdp-spec-subhead")].map((node) => node.textContent.trim()),
        })),
      );
      assert.deepEqual(specs, [
        {
          key: "description",
          label: "Description",
          value: "",
          lines: [note],
        },
        {
          key: "details",
          label: "Details",
          value: "",
          lines: ["Product specifications"],
        },
        {
          key: "delivery",
          label: "Delivery & Return",
          value: "",
          lines: [],
        },
      ]);
      assert.equal(await page.$eval(".pdp-buy", (el) => (el.textContent || "").includes("준비 중")), false);
      console.log("ok  mobile one-port PDP: KRW 36,000, Starship title");
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
        ["All", "Wall 212", "One Port", "Starship", "Cascade", "Drain Tower"],
      );
      assert.deepEqual(
        tabs.map((tab) => tab.href),
        ["/new", "/new?cat=wall-kit", "/new?cat=mini-port", "/new?cat=one-port", "/new?cat=cascade", "/new?cat=drain-tower"],
      );
      await page.click(".site-menubar-toggle");
      await page.waitForSelector(".site-menu.is-open");
      await page.click('.site-menu-row[role="button"]');
      const menu = await page.$$eval(".site-menu-subrow .site-menu-label", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.deepEqual(menu, ["All", "Wall 212", "One Port", "Starship", "Cascade", "Drain Tower"]);
      console.log("ok  mobile /new tabs + Product menu: One Port before Starship, Drain Tower last");
    });

    await withPage(browser, MOBILE, "/new?cat=cascade&moss=0", async (page) => {
      const report = await page.evaluate(() => {
        const cards = [...document.querySelectorAll(".product-card")].map((card) => {
          const img = card.querySelector(".product-empty img");
          return {
            name: card.querySelector(".product-caption p.site-type")?.textContent?.trim() || "",
            price: card.querySelector(".product-price")?.textContent?.trim() || null,
            tag: card.tagName,
            href: card.getAttribute("href"),
            still: card.classList.contains("is-still"),
            src: img?.getAttribute("src") || "",
            moss: Boolean(card.querySelector(".product-moss")),
          };
        });
        return cards;
      });
      assert.equal(report.length, 2, `cascade cards ${report.length}`);
      assert.deepEqual(
        report.map((card) => card.name),
        ["Cascade 600, HOLLOW(Translucent)", "Cascade 600, VOID(Black)"],
      );
      const hrefs = ["/new/cascade-silver", "/new/cascade-black"];
      const prices = ["KRW 236,000", "KRW 197,000"];
      report.forEach((card, index) => {
        assert.equal(card.price, prices[index], `${card.name} price`);
        assert.equal(card.tag, "A", `${card.name} must link to its PDP`);
        assert.equal(card.href, hrefs[index]);
        assert.equal(card.still, true);
        assert.equal(card.moss, false, `${card.name} must not have a hover image`);
      });
      assert.equal(report[0].src, "/products/cascade-silver.png");
      assert.equal(report[1].src, "/products/cascade-black.png");
      const textures = await page.$$eval(".new-grid-item-texture", (nodes) => nodes.length);
      assert.equal(textures, 1, "cascade tab keeps moss tile");
      console.log("ok  mobile /new?cat=cascade: HOLLOW, VOID, priced, linked");
    });

    await withPage(browser, MOBILE, "/new?cat=mini-port&moss=0", async (page) => {
      const report = await page.evaluate(() => {
        const cards = [...document.querySelectorAll(".product-card")].map((card) => {
          const img = card.querySelector(".product-empty img");
          return {
            name: card.querySelector(".product-caption p.site-type")?.textContent?.trim() || "",
            price: card.querySelector(".product-price")?.textContent?.trim() || null,
            tag: card.tagName,
            href: card.getAttribute("href"),
            still: card.classList.contains("is-still"),
            src: img?.getAttribute("src") || "",
            moss: Boolean(card.querySelector(".product-moss")),
          };
        });
        return cards;
      });
      assert.equal(report.length, 3, `mini-port cards ${report.length}`);
      assert.deepEqual(
        report.map((card) => card.name),
        ["One Port 141, ODD(Indigo Purple)", "One Port 141, VOID(Black)", "One Port 141, MIST(White)"],
      );
      const hrefs = ["/new/mini-port-purple", "/new/mini-port-black", "/new/mini-port-white"];
      report.forEach((card, index) => {
        assert.equal(card.price, "KRW 56,000", `${card.name} price`);
        assert.equal(card.tag, "A", `${card.name} must link to its PDP`);
        assert.equal(card.href, hrefs[index]);
        assert.equal(card.still, true);
        assert.equal(card.moss, false, `${card.name} must not have a hover image`);
      });
      assert.equal(report[0].src, "/products/mini-port-purple.png?v=2");
      assert.equal(report[1].src, "/products/mini-port-black.png?v=2");
      assert.equal(report[2].src, "/products/mini-port-white.png?v=2");
      const textures = await page.$$eval(".new-grid-item-texture", (nodes) => nodes.length);
      assert.equal(textures, 1, "mini-port tab keeps moss tile");
      console.log("ok  mobile /new?cat=mini-port: ODD, VOID, MIST, priced, linked");
    });

    await withPage(browser, MOBILE, "/new?cat=drain-tower&moss=0", async (page) => {
      const report = await page.evaluate(() => {
        const cards = [...document.querySelectorAll(".product-card")].map((card) => {
          const img = card.querySelector(".product-empty img");
          const r = img?.getBoundingClientRect();
          return {
            name: card.querySelector(".product-caption p.site-type")?.textContent?.trim() || "",
            price: card.querySelector(".product-price")?.textContent?.trim() || null,
            tag: card.tagName,
            href: card.getAttribute("href"),
            still: card.classList.contains("is-still"),
            src: img?.getAttribute("src") || "",
            moss: Boolean(card.querySelector(".product-moss")),
            imgW: r ? +r.width.toFixed(1) : 0,
            imgH: r ? +r.height.toFixed(1) : 0,
            objectFit: img ? getComputedStyle(img).objectFit : "",
          };
        });
        return cards;
      });
      assert.equal(report.length, 3, `drain-tower cards ${report.length}`);
      assert.deepEqual(
        report.map((card) => card.name),
        ["Drain Tower 80, VOID(Black)", "Drain Tower 40, VOID(Black)", "Drain Tower 20, VOID(Black)"],
      );
      const hrefs = ["/new/drain-tower-80", "/new/drain-tower-40", "/new/drain-tower-20"];
      report.forEach((card, index) => {
        assert.equal(card.tag, "A", `${card.name} must link to its PDP`);
        assert.equal(card.href, hrefs[index]);
        assert.equal(card.still, true);
        assert.equal(card.moss, false, `${card.name} must not have a hover image`);
      });
      assert.deepEqual(
        report.map((card) => card.price),
        ["KRW 9,000", "KRW 5,000", "KRW 3,000"],
      );
      assert.equal(report[0].src, "/products/drain-tower-80.png");
      assert.equal(report[1].src, "/products/drain-tower-40.png?v=3");
      assert.equal(report[2].src, "/products/drain-tower-20.png?v=3");
      const boxes = report.map((card) => `${card.imgW}x${card.imgH}`);
      assert.ok(
        report.every((card) => card.imgW > 0 && card.imgW === report[0].imgW && card.imgH === report[0].imgH),
        `drain-tower image boxes must match, got ${boxes}`,
      );
      assert.ok(
        report.every((card) => card.objectFit === "contain"),
        `drain-tower object-fit contain, got ${report.map((card) => card.objectFit)}`,
      );
      console.log("ok  mobile /new?cat=drain-tower: 80, 40, 20, priced, linked, same image boxes");
    });

    async function rasterCenter(page, src) {
      return page.evaluate(async (url) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);
        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < h; y += 2) {
          for (let x = 0; x < w; x += 2) {
            if (data[(y * w + x) * 4 + 3] > 16) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }
        return {
          w,
          h,
          cx: +((minX + maxX) / 2 / w).toFixed(3),
          cy: +((minY + maxY) / 2 / h).toFixed(3),
          bw: +((maxX - minX + 1) / w).toFixed(3),
          bh: +((maxY - minY + 1) / h).toFixed(3),
        };
      }, src);
    }

    await withPage(browser, MOBILE, "/new?cat=drain-tower&moss=0", async (page) => {
      const rasters = [
        ["/products/drain-tower-40.png?v=3", "drain-40"],
        ["/products/drain-tower-20.png?v=3", "drain-20"],
      ];
      for (const [src, label] of rasters) {
        const box = await rasterCenter(page, src);
        assert.equal(box.w, 1254, `${label} width ${box.w}`);
        assert.equal(box.h, 1254, `${label} height ${box.h}`);
        assert.ok(Math.abs(box.cx - 0.5) <= 0.06, `${label} cx ${box.cx}`);
        assert.ok(Math.abs(box.cy - 0.5) <= 0.06, `${label} cy ${box.cy}`);
      }
      console.log("ok  drain-tower rasters: 1254 square, content centered");
    });

    await withPage(browser, MOBILE, "/new?cat=mini-port&moss=0", async (page) => {
      const cascade = await rasterCenter(page, "/products/cascade-silver.png");
      for (const [src, label] of [
        ["/products/mini-port-purple.png?v=2", "mini-purple"],
        ["/products/mini-port-black.png?v=2", "mini-black"],
        ["/products/mini-port-white.png?v=2", "mini-white"],
      ]) {
        const box = await rasterCenter(page, src);
        assert.equal(box.w, 1254, `${label} width ${box.w}`);
        assert.equal(box.h, 1254, `${label} height ${box.h}`);
        assert.ok(Math.abs(box.cx - 0.5) <= 0.06, `${label} cx ${box.cx}`);
        assert.ok(Math.abs(box.cy - 0.5) <= 0.06, `${label} cy ${box.cy}`);
        assert.ok(Math.abs(box.bw - cascade.bw) <= 0.08, `${label} object width ${box.bw} vs cascade ${cascade.bw}`);
      }
      console.log("ok  mini-port rasters: 1254 square, centered, ~70% object width");
    });

    const ALL_DEFAULT_NAMES = [
      "Wall 212, HOLLOW(Translucent)",
      "Wall 212, ODD(Indigo Purple)",
      "Wall 212, VOID(Black)",
      "Wall 212, BUG(Bamboo Green)",
      "Wall 212, MIST(White)",
      "One Port 141, ODD(Indigo Purple)",
      "One Port 141, VOID(Black)",
      "One Port 141, MIST(White)",
      "Starship 157, ODD(Indigo Purple)",
      "Starship 157, VOID(Black)",
      "Starship 157, MIST(White)",
      "Cascade 600, HOLLOW(Translucent)",
      "Cascade 600, VOID(Black)",
      "Drain Tower 80, VOID(Black)",
      "Drain Tower 40, VOID(Black)",
      "Drain Tower 20, VOID(Black)",
    ];

    await withPage(browser, MOBILE, "/new?moss=0", async (page) => {
      const names = await page.$$eval(".product-caption p.site-type:not(.product-price)", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.deepEqual(names, ALL_DEFAULT_NAMES, `All order ${names}`);
      const wrap412 = await page.evaluate(() =>
        [...document.querySelectorAll(".product-card")].map((card) => {
          const name = card.querySelector(".product-caption p.site-type:not(.product-price)");
          const price = card.querySelector(".product-price");
          const nr = name?.getBoundingClientRect();
          const pr = price?.getBoundingClientRect();
          const cr = card.getBoundingClientRect();
          const fs = name ? parseFloat(getComputedStyle(name).fontSize) : 0;
          return {
            name: name?.textContent?.trim() || "",
            wrapped: Boolean(nr && nr.height > fs * 1.4),
            overlapPrice: Boolean(nr && pr && nr.bottom > pr.top + 1),
            cardOverflow: card.scrollWidth > card.clientWidth + 1,
            nameWiderThanCard: Boolean(nr && nr.width > cr.width + 1),
          };
        }),
      );
      const collisions412 = wrap412.filter((row) => row.overlapPrice || row.cardOverflow || row.nameWiderThanCard);
      assert.deepEqual(collisions412, [], `412 caption collision ${JSON.stringify(collisions412)}`);
      const wraps412 = wrap412.filter((row) => row.wrapped).map((row) => row.name);
      console.log(`ok  mobile 412 /new All: wraps ${wraps412.length} ${JSON.stringify(wraps412)}`);
      const textures = await page.$$eval(".new-grid-item-texture", (nodes) => nodes.length);
      const cards = await page.$$eval(".product-card", (nodes) => nodes.length);
      assert.equal(textures, 0, "All tab must not insert a moss tile");
      assert.equal(cards, 16, `All product cards ${cards}`);
      const mini = await page.evaluate(() =>
        [...document.querySelectorAll(".product-card")]
          .filter((card) => (card.querySelector(".product-caption p.site-type")?.textContent || "").startsWith("One Port"))
          .map((card) => ({
            name: card.querySelector(".product-caption p.site-type")?.textContent?.trim() || "",
            price: card.querySelector(".product-price")?.textContent?.trim() || "",
            href: card.getAttribute("href"),
            still: card.classList.contains("is-still"),
            moss: Boolean(card.querySelector(".product-moss")),
            src: card.querySelector(".product-empty img")?.getAttribute("src") || "",
          })),
      );
      assert.deepEqual(
        mini.map((card) => [card.name, card.price, card.href, card.src, card.still, card.moss]),
        [
          ["One Port 141, ODD(Indigo Purple)", "KRW 56,000", "/new/mini-port-purple", "/products/mini-port-purple.png?v=2", true, false],
          ["One Port 141, VOID(Black)", "KRW 56,000", "/new/mini-port-black", "/products/mini-port-black.png?v=2", true, false],
          ["One Port 141, MIST(White)", "KRW 56,000", "/new/mini-port-white", "/products/mini-port-white.png?v=2", true, false],
        ],
      );
      console.log("ok  mobile /new All: Wall 212 → One Port → Starship → Cascade → Drain Tower, no moss tile");
    });

    await withPage(browser, MOBILE_320, "/new?moss=0", async (page) => {
      const report320 = await page.evaluate(() =>
        [...document.querySelectorAll(".product-card")].map((card) => {
          const name = card.querySelector(".product-caption p.site-type:not(.product-price)");
          const price = card.querySelector(".product-price");
          const nr = name?.getBoundingClientRect();
          const pr = price?.getBoundingClientRect();
          const cr = card.getBoundingClientRect();
          const fs = name ? parseFloat(getComputedStyle(name).fontSize) : 0;
          return {
            name: name?.textContent?.trim() || "",
            wrapped: Boolean(nr && nr.height > fs * 1.4),
            overlapPrice: Boolean(nr && pr && nr.bottom > pr.top + 1),
            cardOverflow: card.scrollWidth > card.clientWidth + 1,
            nameWiderThanCard: Boolean(nr && nr.width > cr.width + 1),
          };
        }),
      );
      const collisions = report320.filter((row) => row.overlapPrice || row.cardOverflow || row.nameWiderThanCard);
      assert.deepEqual(collisions, [], `320 caption collision ${JSON.stringify(collisions)}`);
      const wraps320 = report320.filter((row) => row.wrapped).map((row) => row.name);
      console.log(`ok  mobile 320 /new All: wraps ${wraps320.length} ${JSON.stringify(wraps320)}`);
    });

    await withPage(browser, DESKTOP, "/new?moss=0", async (page) => {
      const names = await page.$$eval(".product-caption p.site-type:not(.product-price)", (nodes) =>
        nodes.map((node) => (node.textContent || "").trim()),
      );
      assert.deepEqual(names, ALL_DEFAULT_NAMES, `1440 All order ${names}`);
      const wrap1440 = await page.evaluate(() =>
        [...document.querySelectorAll(".product-card")].map((card) => {
          const name = card.querySelector(".product-caption p.site-type:not(.product-price)");
          const price = card.querySelector(".product-price");
          const nr = name?.getBoundingClientRect();
          const pr = price?.getBoundingClientRect();
          const cr = card.getBoundingClientRect();
          const fs = name ? parseFloat(getComputedStyle(name).fontSize) : 0;
          return {
            name: name?.textContent?.trim() || "",
            wrapped: Boolean(nr && nr.height > fs * 1.4),
            overlapPrice: Boolean(nr && pr && nr.bottom > pr.top + 1),
            cardOverflow: card.scrollWidth > card.clientWidth + 1,
            nameWiderThanCard: Boolean(nr && nr.width > cr.width + 1),
          };
        }),
      );
      const collisions1440 = wrap1440.filter((row) => row.overlapPrice || row.cardOverflow || row.nameWiderThanCard);
      assert.deepEqual(collisions1440, [], `1440 caption collision ${JSON.stringify(collisions1440)}`);
      const wraps1440 = wrap1440.filter((row) => row.wrapped).map((row) => row.name);
      console.log(`ok  desktop 1440 /new All: wraps ${wraps1440.length} ${JSON.stringify(wraps1440)}`);
    });

    const listed = [
      ["cascade-silver", "Cascade 600, HOLLOW(Translucent)", "KRW 236,000", "/products/cascade-silver.png"],
      ["cascade-black", "Cascade 600, VOID(Black)", "KRW 197,000", "/products/cascade-black.png"],
      ["drain-tower-20", "Drain Tower 20, VOID(Black)", "KRW 3,000", "/products/drain-tower-20.png?v=3"],
      ["drain-tower-40", "Drain Tower 40, VOID(Black)", "KRW 5,000", "/products/drain-tower-40.png?v=3"],
      ["drain-tower-80", "Drain Tower 80, VOID(Black)", "KRW 9,000", "/products/drain-tower-80.png"],
      ["mini-port-purple", "One Port 141, ODD(Indigo Purple)", "KRW 56,000", "/products/mini-port-purple.png?v=2"],
      ["mini-port-black", "One Port 141, VOID(Black)", "KRW 56,000", "/products/mini-port-black.png?v=2"],
      ["mini-port-white", "One Port 141, MIST(White)", "KRW 56,000", "/products/mini-port-white.png?v=2"],
    ];
    for (const [id, name, price, img] of listed) {
      await withPage(browser, MOBILE, `/new/${id}`, async (page) => {
        if (id.startsWith("drain-tower")) {
          await page.evaluate(() => document.querySelector(".pdp-hero-guide")?.scrollIntoView({ block: "center" }));
          await page.waitForFunction(() => {
            const guide = document.querySelector(".pdp-hero-guide img");
            return Boolean(guide && guide.complete && guide.naturalWidth > 0);
          });
        }
        const report = await page.evaluate(() => ({
          name: document.querySelector(".pdp-name")?.textContent?.trim() || "",
          color: document.querySelector(".pdp-title-color")?.textContent?.trim() || "",
          price: document.querySelector(".pdp-price")?.textContent?.trim() || "",
          note: document.querySelector(".pdp-note")?.textContent?.trim() || null,
          specs: [...document.querySelectorAll("[data-pdp-spec]")].map((el) => ({
            key: el.getAttribute("data-pdp-spec"),
            label:
              el.querySelector(".pdp-spec-label-text")?.innerText?.trim() ||
              el.querySelector(".pdp-spec-label")?.innerText?.trim() ||
              "",
            value: el.querySelector(".pdp-spec-value")?.textContent?.trim() || "",
            empty: el.querySelector(".pdp-spec-value")?.classList.contains("is-empty") || false,
            lines: [...el.querySelectorAll(".pdp-spec-line, .pdp-spec-subhead")].map((node) => ({
              role: node.classList.contains("pdp-spec-subhead") ? "subhead" : "line",
              text: (node.textContent || "").trim(),
            })),
            collapsed: el.querySelector(".pdp-spec-body")?.classList.contains("is-collapsed") ?? false,
          })),
          swatches: [...document.querySelectorAll(".pdp-buy .pdp-swatch")].map((el) => ({
            tag: el.tagName.toLowerCase(),
            href: el.getAttribute("href"),
            title: el.getAttribute("title"),
            current: el.getAttribute("aria-current") === "true",
            currentClass: el.classList.contains("is-current"),
            src: el.querySelector("img")?.getAttribute("src") || "",
          })),
          store: document.querySelector("[data-pdp-store]")?.getAttribute("href") || "",
          img: document.querySelector(".pdp-hero-empty img")?.getAttribute("src") || "",
          title: document.title,
          guide: document.querySelector(".pdp-hero-guide img")?.getAttribute("src") || null,
          guideW: document.querySelector(".pdp-hero-guide img")?.naturalWidth || 0,
          guidePointer: document.querySelector(".pdp-guide-stage")
            ? getComputedStyle(document.querySelector(".pdp-guide-stage")).pointerEvents
            : null,
          overflow: +(document.documentElement.scrollWidth - document.documentElement.clientWidth).toFixed(1),
        }));
        const [family, colorName] = name.split(", ");
        assert.equal(report.name, family, `${id} name`);
        assert.equal(report.color, colorName, `${id} color`);
        assert.equal(report.price, price, `${id} price`);
        const expectedNote = id.startsWith("cascade-")
          ? "Cascade는 물이 흐르는 폭포를 구현할 수 있도록 설계된 DIY 여과 시스템 구조물입니다. 내부 여과 공간과 물의 순환 구조를 기반으로 실제 물이 흐르는 폭포를 연출할 수 있으며, 사용자가 구조물 외부에 돌과 배양토 등 다양한 자연 소재를 직접 부착하여 원하는 형태로 제작할 수 있습니다. 이끼와 습한 환경을 선호하는 식물을 함께 식재할 수 있어 팔루다리움 등 다양한 생태 환경에 활용할 수 있습니다. 여과 기능과 자유로운 조형 작업을 결합하여 사용자만의 폭포 환경을 구성할 수 있는 제품입니다."
          : id.startsWith("drain-tower")
            ? "Drain Tower & Drain은 내부에 고이는 물을 효율적으로 배출하고, 바닥의 수분을 관리할 수 있도록 설계된 배수 보조 구조물입니다. 식물에 공급된 물이나 분무로 인해 바닥에 축적되는 잔여 수분을 필요에 따라 제거할 수 있으며, 과도한 수분 축적으로 인한 뿌리 손상과 배양토의 과습을 예방하는 데 도움을 줍니다. 바닥 구조와 사육장 크기에 따라 선택하여 설치할 수 있으며, 식물의 생육 환경을 보다 안정적으로 관리할 수 있도록 돕는 제품입니다."
            : "Oneport는 하나의 식물 포트와 유리 커버로 구성된 단일 식물 전용 온실입니다. 유리 커버를 통해 내부 습도를 유지하여 높은 습도를 필요로 하는 열대식물과 정글식물이 성장하기에 적합한 환경을 제공합니다. 하나의 식물을 독립적으로 관리할 수 있도록 설계되었으며, 식물의 형태와 성장 과정을 가까이에서 관찰할 수 있는 소형 온실입니다.";
        assert.equal(report.note, expectedNote, `${id} note`);
        const drainDimensions = {
          "drain-tower-80": "W 55 × D 55 × H 80 mm",
          "drain-tower-40": "W 55 × D 55 × H 45 mm",
          "drain-tower-20": "W 55 × D 55 × H 25 mm",
        };
        const cascadeLines = {
          planting: [
            ["line", "캐스케이드는 돌과 흙 등 자연 소재로 직접 지형을 구성하고, 흐르는 물 주변에 식물을 식재할 수 있는 DIY 폭포형 여과 구조물입니다. 이끼류, 고사리류처럼 습도가 높은 환경을 좋아하는 식물이 잘 맞으며, 물이 흐르는 위치와 식물의 생육 특성을 고려해 식재해 주세요. 식물마다 필요한 수분량이 다르므로 지속적인 침수나 강한 물줄기에 주의하고, 식물에 맞는 위치와 환경을 조성하면 더욱 안정적으로 유지할 수 있습니다."],
          ],
          temperature: [
            ["line", "캐스케이드는 20~26°C에서 가장 안정적으로 유지되며, 급격한 온도 변화와 찬바람은 피해 주세요. 세척할 때는 반드시 전원을 먼저 차단하고, 날카롭거나 거친 도구는 사용하지 마세요. 오염 정도에 따라 주기적으로 세척해 주시고, 물의 흐름이 약해졌다면 여과 스펀지와 물길이 막히지 않았는지 확인해 주세요."],
          ],
        };
        const specLines = (pairs) => pairs.map(([role, text]) => ({ role, text }));
        const section = (key, label, extra) => ({
          key,
          label,
          value: "",
          empty: false,
          lines: [],
          collapsed: true,
          ...extra,
        });
        assert.deepEqual(
          report.specs,
          [
            section("description", "Description", {
              lines: specLines([
                ["line", expectedNote],
                ...(id.startsWith("cascade-")
                  ? [
                      ["subhead", "Planting Guide"],
                      ...cascadeLines.planting,
                    ]
                  : []),
              ]),
            }),
            section("details", "Details", {
              lines: specLines([
                ["subhead", "Product specifications"],
                ...(id.startsWith("cascade-") ? [["subhead", "Notes"], ...cascadeLines.temperature] : []),
              ]),
            }),
            section("delivery", "Delivery & Return"),
          ],
          `${id} specs`,
        );
        if (drainDimensions[id]) {
          const dimensionCell = await page.$eval('[data-pdp-spec-row="Dimensions"] td', (el) => ({
            text: el.textContent.trim(),
            sample: el.classList.contains("is-sample"),
          }));
          assert.equal(dimensionCell.text, drainDimensions[id], `${id} measured dimensions`);
          assert.equal(dimensionCell.sample, false, `${id} dimensions must not be marked sample`);
        }
        if (id.startsWith("cascade-")) {
          const expected = [
            { id: "cascade-silver", title: "HOLLOW" },
            { id: "cascade-black", title: "VOID" },
          ];
          assert.equal(report.swatches.length, 2, `${id} swatch count`);
          assert.deepEqual(
            report.swatches.map((swatch) => swatch.title),
            expected.map((item) => item.title),
            `${id} swatch order`,
          );
          for (let i = 0; i < expected.length; i++) {
            const swatch = report.swatches[i];
            const item = expected[i];
            assert.equal(swatch.src, `/swatches/${item.id}.png`, `${id} ${item.title} src`);
            if (item.id === id) {
              assert.equal(swatch.tag, "span", `${id} current tag`);
              assert.equal(swatch.href, null, `${id} current href`);
              assert.equal(swatch.current, true, `${id} current aria`);
              assert.equal(swatch.currentClass, true, `${id} current class`);
            } else {
              assert.equal(swatch.tag, "a", `${id} ${item.title} tag`);
              assert.equal(swatch.href, `/new/${item.id}`, `${id} ${item.title} href`);
              assert.equal(swatch.current, false, `${id} ${item.title} aria`);
              assert.equal(swatch.currentClass, false, `${id} ${item.title} class`);
            }
          }
        } else {
          assert.equal(report.swatches.length, 0, `${id} must not invent swatches`);
        }
        assert.equal(report.store, "https://smartstore.naver.com/taegye", `${id} store`);
        assert.equal(report.img, img, `${id} image`);
        assert.ok(report.title.startsWith(name), `${id} title ${report.title}`);
        if (id.startsWith("drain-tower")) {
          assert.equal(report.guide, "/products/drain-tower-guide.png", `${id} guide`);
          assert.equal(report.guideW, 950, `${id} guide natural width`);
          assert.equal(report.guidePointer, "none", `${id} guide clicks`);
        } else {
          assert.equal(report.guide, null, `${id} must not show Drain Tower guide`);
        }
        assert.ok(report.overflow <= 0, `${id} overflow ${report.overflow}`);
        console.log(`ok  /new/${id}: PDP ${name} ${price}`);
      });
    }

    await withPage(browser, MOBILE, "/new/cascade-silver", async (page) => {
      await page.waitForSelector('.pdp-swatch[href="/new/cascade-black"]');
      const before = await page.evaluate(() => ({
        name: document.querySelector(".pdp-name")?.textContent?.trim() || "",
        color: document.querySelector(".pdp-title-color")?.textContent?.trim() || "",
        price: document.querySelector(".pdp-price")?.textContent?.trim() || "",
      }));
      assert.deepEqual(before, {
        name: "Cascade 600",
        color: "HOLLOW(Translucent)",
        price: "KRW 236,000",
      });
      await page.click('.pdp-swatch[href="/new/cascade-black"]');
      await page.waitForFunction(
        () => document.querySelector(".pdp-title-color")?.textContent?.trim() === "VOID(Black)",
      );
      const after = await page.evaluate(() => ({
        name: document.querySelector(".pdp-name")?.textContent?.trim() || "",
        color: document.querySelector(".pdp-title-color")?.textContent?.trim() || "",
        price: document.querySelector(".pdp-price")?.textContent?.trim() || "",
        current: document.querySelector(".pdp-swatch.is-current")?.getAttribute("title") || "",
      }));
      assert.deepEqual(after, {
        name: "Cascade 600",
        color: "VOID(Black)",
        price: "KRW 197,000",
        current: "VOID",
      });
      console.log("ok  cascade swatch click: HOLLOW → VOID, price follows");
    });

    async function measureSwatches(page) {
      return page.evaluate(() => {
        const buy = document.querySelector(".pdp-buy");
        const swatches = buy?.querySelector(".pdp-swatches");
        const price = document.querySelector(".pdp-price");
        const store = document.querySelector("[data-pdp-store]");
        const s = swatches ? getComputedStyle(swatches) : null;
        const item = buy?.querySelector(".pdp-swatch");
        const itemS = item ? getComputedStyle(item) : null;
        const sr = swatches?.getBoundingClientRect();
        const pr = price?.getBoundingClientRect();
        const tr = store?.getBoundingClientRect();
        return {
          count: buy?.querySelectorAll(".pdp-swatch").length ?? 0,
          display: s?.display || null,
          gap: s?.gap || null,
          width: itemS?.width || null,
          height: itemS?.height || null,
          radius: itemS?.borderRadius || null,
          titles: [...(buy?.querySelectorAll(".pdp-swatch") ?? [])].map((el) => el.getAttribute("title")),
          belowPrice: Boolean(sr && pr && sr.top >= pr.bottom - 1),
          aboveStore: Boolean(sr && tr && sr.bottom <= tr.top + 1),
        };
      });
    }

    for (const viewport of [MOBILE, DESKTOP]) {
      const vp = viewport.width === DESKTOP.width ? "1440" : "412";
      let wallKit;
      await withPage(browser, viewport, "/new/silver", async (page) => {
        wallKit = await measureSwatches(page);
        assert.equal(wallKit.count, 5, `${vp} wall-kit swatch count`);
        assert.deepEqual(wallKit.titles, ["HOLLOW", "ODD", "VOID", "BUG", "MIST"]);
        assert.equal(wallKit.display, "flex");
        assert.equal(wallKit.width, "14px");
        assert.equal(wallKit.height, "14px");
        assert.equal(wallKit.radius, "50%");
        assert.ok(wallKit.belowPrice, `${vp} wall-kit swatches below price`);
        assert.ok(wallKit.aboveStore, `${vp} wall-kit swatches above Store`);
      });
      await withPage(browser, viewport, "/new/one-port-purple", async (page) => {
        const report = await measureSwatches(page);
        assert.equal(report.count, 3, `${vp} dot-port swatch count`);
        assert.deepEqual(report.titles, ["ODD", "VOID", "MIST"]);
        assert.equal(report.display, wallKit.display, `${vp} dot-port display`);
        assert.equal(report.gap, wallKit.gap, `${vp} dot-port gap`);
        assert.equal(report.width, wallKit.width, `${vp} dot-port width`);
        assert.equal(report.height, wallKit.height, `${vp} dot-port height`);
        assert.equal(report.radius, wallKit.radius, `${vp} dot-port radius`);
        assert.ok(report.belowPrice, `${vp} dot-port swatches below price`);
        assert.ok(report.aboveStore, `${vp} dot-port swatches above Store`);
      });
      await withPage(browser, viewport, "/new/cascade-silver", async (page) => {
        const report = await measureSwatches(page);
        assert.equal(report.count, 2, `${vp} cascade swatch count`);
        assert.deepEqual(report.titles, ["HOLLOW", "VOID"]);
        assert.equal(report.display, wallKit.display, `${vp} cascade display`);
        assert.equal(report.gap, wallKit.gap, `${vp} cascade gap`);
        assert.equal(report.width, wallKit.width, `${vp} cascade width`);
        assert.equal(report.height, wallKit.height, `${vp} cascade height`);
        assert.equal(report.radius, wallKit.radius, `${vp} cascade radius`);
        assert.ok(report.belowPrice, `${vp} cascade swatches below price`);
        assert.ok(report.aboveStore, `${vp} cascade swatches above Store`);
      });
      await withPage(browser, viewport, "/new/mini-port-purple", async (page) => {
        const count = await page.$$eval(".pdp-swatch", (nodes) => nodes.length);
        assert.equal(count, 0, `${vp} mini-port must not show swatches`);
      });
      await withPage(browser, viewport, "/new/drain-tower-80", async (page) => {
        const count = await page.$$eval(".pdp-swatch", (nodes) => nodes.length);
        assert.equal(count, 0, `${vp} drain-tower must not show swatches`);
      });
      console.log(`ok  ${vp} PDP swatches: wall-kit/dot-port unchanged, cascade matches, mini/drain none`);
    }

    for (const viewport of [MOBILE, DESKTOP]) {
      const vp = viewport.width === DESKTOP.width ? "1440" : "412";
      await withPage(browser, viewport, "/new/cascade-silver", async (page) => {
        const readToggles = () =>
          page.evaluate(() =>
            [...document.querySelectorAll(".pdp-spec-toggle")].map((button) => {
              const body = document.getElementById(button.getAttribute("aria-controls") || "");
              return {
                expanded: button.getAttribute("aria-expanded"),
                collapsed: body?.classList.contains("is-collapsed") ?? true,
                rows: body ? getComputedStyle(body).gridTemplateRows : "",
                duration: body ? getComputedStyle(body).transitionDuration : "",
                height: body ? body.getBoundingClientRect().height : -1,
                overflow: body ? getComputedStyle(body).overflowY : "",
                pad: body ? getComputedStyle(body).padding : "",
                innerPad: body?.firstElementChild ? getComputedStyle(body.firstElementChild).padding : "",
                divider: (() => {
                  const row = button.closest(".pdp-acc-row");
                  if (!row || !body) return null;
                  const label = button.getBoundingClientRect();
                  const rowBox = row.getBoundingClientRect();
                  const style = getComputedStyle(row);
                  return {
                    gap: Math.round((rowBox.bottom - label.bottom) * 100) / 100,
                    border: style.borderBottomWidth,
                    color: style.borderBottomColor,
                  };
                })(),
              };
            }),
          );
        const closed = await readToggles();
        assert.equal(closed.length, 3, `${vp} cascade toggle count`);
        for (const section of closed) {
          assert.equal(section.expanded, "false", `${vp} cascade starts closed`);
          assert.equal(section.collapsed, true, `${vp} cascade body hidden`);
          assert.equal(section.height, 0, `${vp} cascade closed body height`);
          assert.equal(section.overflow, "hidden", `${vp} cascade closed overflow`);
          assert.equal(section.pad, "0px", `${vp} cascade closed padding`);
          assert.equal(section.innerPad, "0px", `${vp} cascade closed inner padding`);
          assert.equal(section.divider.border, "1px", `${vp} cascade divider width`);
          assert.equal(section.divider.color, "rgb(229, 229, 229)", `${vp} cascade divider color`);
          assert.ok(section.divider.gap <= 1.5, `${vp} cascade divider gap ${section.divider.gap}`);
        }
        const icon = await sampleAccordionIcon(page);
        assert.equal(icon.markProperty, "transform", `${vp} icon transition property`);
        assert.equal(icon.markDuration, "0.3s", `${vp} icon transition duration`);
        assert.equal(icon.barProperty, "transform, opacity", `${vp} bar transition property`);
        assert.equal(icon.barDuration, "0.3s, 0.3s", `${vp} bar transition duration`);
        const openedTurn = matrixParts(icon.opened.mark);
        const closedTurn = matrixParts(icon.closed.mark);
        assert.ok(openedTurn && openedTurn[0] < -0.95, `${vp} icon ends at 180°, got ${icon.opened.mark}`);
        assert.ok(icon.opened.opacity < 0.05, `${vp} vertical bar fades out, opacity ${icon.opened.opacity}`);
        const openedBar = matrixParts(icon.opened.bar);
        assert.ok(
          openedBar && Math.abs(openedBar[0]) < 0.05 && Math.abs(openedBar[3]) < 0.05,
          `${vp} vertical bar scales to 0, got ${icon.opened.bar}`,
        );
        assert.ok(closedTurn && closedTurn[0] > 0.95, `${vp} icon returns to 0°, got ${icon.closed.mark}`);
        assert.ok(icon.closed.opacity > 0.95, `${vp} vertical bar returns, opacity ${icon.closed.opacity}`);
        const moving = (frames) =>
          frames.some((frame) => {
            const parts = matrixParts(frame.mark);
            return frame.t > 16 && frame.t < 320 && parts && Math.abs(parts[1]) > 0.08;
          });
        assert.ok(moving(icon.openFrames), `${vp} icon should turn while opening`);
        assert.ok(moving(icon.closeFrames), `${vp} icon should turn while closing`);
        assert.ok(icon.shift.button < 1, `${vp} heading moved ${icon.shift.button}px`);
        assert.ok(icon.shift.label < 1, `${vp} heading text moved ${icon.shift.label}px`);
        assert.ok(icon.shift.mark < 1, `${vp} icon box moved ${icon.shift.mark}px`);
        assert.ok(icon.shift.markW < 1 && icon.shift.markH < 1, `${vp} icon box resized`);
        assert.ok(icon.shift.name < 1, `${vp} product name moved ${icon.shift.name}px`);
        assert.ok(icon.scrolled < 1, `${vp} scrolled heading moved ${icon.scrolled}px`);
        await page.$eval(".pdp-spec-toggle", (button) => button.click());
        const opened = await readToggles();
        assert.equal(opened[0].expanded, "true", `${vp} cascade heading opens`);
        assert.equal(opened[0].collapsed, false, `${vp} cascade body shown`);
        assert.equal(opened[0].duration, "0.25s", `${vp} cascade body motion`);
        assert.equal(opened[1].expanded, "false", `${vp} other section stays closed`);
        assert.equal(opened[1].collapsed, true, `${vp} other body stays closed`);
        const marks = await page.$$eval(".pdp-spec-toggle-bar-v", (nodes) =>
          nodes.map((node) => node.classList.contains("is-open")),
        );
        assert.deepEqual(marks, [true, false, false], `${vp} cascade mark`);
        const bodyInk = await page.$eval(".pdp-spec-line", (node) => getComputedStyle(node).webkitTextFillColor);
        assert.notEqual(bodyInk, "rgb(153, 153, 153)", `${vp} cascade body stays black`);
        console.log(`ok  ${vp} cascade specs stay closed until the heading is clicked`);
      });
      for (const path of ["/new/cascade-silver", "/new/silver"]) {
        await withPage(browser, viewport, path, async (page) => {
          const colors = await page.evaluate(() => {
            const line = (el) => {
              const style = getComputedStyle(el);
              return {
                text: el.textContent,
                color: style.color,
                fill: style.webkitTextFillColor,
              };
            };
            return {
              dim: line(document.querySelector('[data-pdp-spec-row="Dimensions"] td')),
              labels: [...document.querySelectorAll(".pdp-spec-label-text")].map(line),
            };
          });
          assert.deepEqual(
            colors.labels.map((item) => item.text),
            ["Description", "Details", "Delivery & Return"],
            `${vp} ${path} English headings`,
          );
          assert.equal(colors.dim.color, "rgb(153, 153, 153)", `${vp} ${path} dimensions gray`);
          for (const item of colors.labels) {
            assert.equal(item.color, "rgb(17, 17, 17)", `${vp} ${path} ${item.text} color`);
            assert.equal(/[가-힣]/.test(item.text), false, `${vp} ${path} Korean heading ${item.text}`);
          }
          const marks = await page.$$eval(".pdp-spec-toggle-bar-v", (nodes) =>
            nodes.map((node) => {
              const style = getComputedStyle(node);
              const mark = node.parentElement.getBoundingClientRect();
              const row = node.closest(".pdp-spec-toggle").getBoundingClientRect();
              const first = node.closest(".pdp-spec-toggle").querySelector(".pdp-spec-label-text").getBoundingClientRect();
              const mid = mark.top + mark.height / 2;
              return {
                open: node.classList.contains("is-open"),
                duration: style.transitionDuration,
                bg: style.backgroundColor,
                atRight: Math.abs(mark.right - row.right) <= 2,
                onFirstLine: mid >= first.top - 2 && mid <= first.bottom + 2,
              };
            }),
          );
          assert.deepEqual(marks.map((mark) => mark.open), [false, false, false], `${vp} ${path} closed marks`);
          for (const mark of marks) {
            assert.equal(mark.bg, "rgb(17, 17, 17)", `${vp} ${path} mark color`);
            assert.equal(mark.duration, "0.3s, 0.3s", `${vp} ${path} mark motion`);
            assert.equal(mark.atRight, true, `${vp} ${path} mark at right`);
            assert.equal(mark.onFirstLine, true, `${vp} ${path} mark on first line`);
          }
          const sheet = await page.evaluate(() => {
            const row = (label) => {
              const el = document.querySelector(`[data-pdp-spec-row="${label}"] td`);
              if (!el) return null;
              const style = getComputedStyle(el);
              return { text: el.textContent.trim(), fill: style.webkitTextFillColor, color: style.color };
            };
            return {
              labels: [...document.querySelectorAll(".pdp-specsheet-table th")].map((node) => node.textContent.trim()),
              dimensions: row("Dimensions"),
              madeIn: row("Made in"),
              color: row("Color"),
              separateSheet: Boolean(document.querySelector(".pdp-atelier > .pdp-specsheet")),
              diagram: document.querySelectorAll("[data-pdp-diagram]").length,
              photos: document.querySelectorAll(".pdp-gallery-slide img").length,
              related: document.querySelector("#pdp-related-title")?.textContent?.trim() || "",
              arrows: document.querySelectorAll(".pdp-related-arrow").length,
              cards: document.querySelectorAll(".pdp-related-card").length,
              relatedNames: [...document.querySelectorAll(".pdp-related-name")].map((node) => node.textContent.trim()),
              currentInRelated: [...document.querySelectorAll(".pdp-related-name")].some((node) =>
                (node.textContent || "").includes(document.querySelector(".pdp-name")?.textContent?.trim() || "___"),
              ),
              leak: /visa|mastercard|paypal|apple pay|klarna|★|☆|€|£|\$/i.test(document.body.innerText),
            };
          });
          assert.deepEqual(sheet.labels, ["Dimensions", "Color", "Made in"], `${vp} ${path} spec rows`);
          assert.equal(sheet.separateSheet, false, `${vp} ${path} specifications should sit inside Details`);
          assert.equal(sheet.diagram, 0, `${vp} ${path} gallery has no dimension drawing`);
          assert.equal(sheet.photos > 0, true, `${vp} ${path} gallery keeps product photos`);
          assert.equal(sheet.related, "Recommended for you", `${vp} ${path} related title`);
          assert.equal(sheet.arrows, 2, `${vp} ${path} related arrows`);
          assert.deepEqual(
            sheet.relatedNames,
            path.endsWith("cascade-silver")
              ? ["Wall 212, HOLLOW(Translucent)"]
              : ["Cascade 600, HOLLOW(Translucent)"],
            `${vp} ${path} same-color related`,
          );
          assert.equal(sheet.cards, sheet.relatedNames.length, `${vp} ${path} related cards`);
          assert.equal(sheet.currentInRelated, false, `${vp} ${path} related includes current`);
          assert.equal(sheet.leak, false, `${vp} ${path} overseas chrome leaked`);
          assert.equal(sheet.madeIn.color, "rgb(153, 153, 153)", `${vp} ${path} sample made in`);
          assert.ok(sheet.madeIn.text.includes("(sample)"), `${vp} ${path} made in sample`);
          if (path.endsWith("cascade-silver")) {
            assert.equal(sheet.color.text, "HOLLOW(Translucent)", `${vp} ${path} color name`);
            assert.equal(sheet.color.color, "rgb(17, 17, 17)", `${vp} ${path} color ink`);
            assert.ok(sheet.dimensions.text.includes("(sample)"), `${vp} ${path} sample dimensions`);
          }
          const type = await page.evaluate(() => {
            const box = (el) => {
              if (!el) return null;
              const r = el.getBoundingClientRect();
              return { left: r.left, top: r.top, width: r.width, height: r.height };
            };
            const name = document.querySelector(".pdp-name");
            const color = document.querySelector(".pdp-title-color");
            const price = document.querySelector(".pdp-price");
            const ns = name ? getComputedStyle(name) : null;
            const cs = color ? getComputedStyle(color) : null;
            const ps = price ? getComputedStyle(price) : null;
            const heading = document.querySelector(".pdp-spec-label-text");
            const body = document.querySelector(".pdp-spec-line");
            const cell = document.querySelector(".pdp-specsheet-table td");
            const feature = document.querySelector(".pdp-features-line");
            return {
              nameSize: ns?.fontSize || "",
              colorSize: cs?.fontSize || "",
              priceSize: ps?.fontSize || "",
              nameWeight: ns?.fontWeight || "",
              colorWeight: cs?.fontWeight || "",
              priceWeight: ps?.fontWeight || "",
              name: box(name),
              color: box(color),
              price: box(price),
              heading: heading ? parseFloat(getComputedStyle(heading).fontSize) : 0,
              body: body ? parseFloat(getComputedStyle(body).fontSize) : 0,
              cell: cell ? parseFloat(getComputedStyle(cell).fontSize) : 0,
              features: [...document.querySelectorAll(".pdp-features-line")].map((node) => ({
                text: (node.textContent || "").replace(/\s+/g, " ").trim(),
                color: getComputedStyle(node).color,
              })),
              featureColor: feature ? getComputedStyle(feature).color : "",
            };
          });
          assert.equal(type.nameSize, type.priceSize, `${vp} ${path} name/price size`);
          assert.equal(type.nameWeight, type.priceWeight, `${vp} ${path} name/price weight`);
          assert.equal(type.nameSize, "18px", `${vp} ${path} title size ${type.nameSize}`);
          const colorPx = parseFloat(type.colorSize);
          assert.ok(colorPx >= 18 * 0.7 && colorPx <= 18 * 0.75, `${vp} ${path} color size ${type.colorSize}`);
          assert.equal(type.colorWeight, "400", `${vp} ${path} color weight`);
          assert.ok(
            type.color.top >= type.name.top + type.name.height - 2,
            `${vp} ${path} color under the name`,
          );
          assert.ok(type.price.left > type.name.left, `${vp} ${path} price sits right of the name`);
          assert.ok(Math.abs(type.price.top - type.name.top) <= 1, `${vp} ${path} price top-aligned`);
          assert.equal(type.heading, 14, `${vp} ${path} heading ${type.heading}`);
          assert.ok(type.body < type.heading && type.body >= 12, `${vp} ${path} body ${type.body}`);
          assert.ok(type.cell < type.heading && type.cell <= 13, `${vp} ${path} spec cell ${type.cell}`);
          assert.equal(type.features.length, 3, `${vp} ${path} feature count`);
          assert.equal(type.featureColor, "rgb(17, 17, 17)", `${vp} ${path} feature ink`);
          assert.equal(type.features.some((line) => line.text.includes("(sample)")), false, `${vp} ${path} sample feature`);
          if (path.endsWith("cascade-silver")) {
            assert.ok(type.features[0].text.includes("물이 흐르는 폭포"), `${vp} cascade feature 01`);
            assert.ok(type.features[1].text.includes("돌과 배양토"), `${vp} cascade feature 02`);
            assert.ok(type.features[2].text.includes("이끼류"), `${vp} cascade feature 03`);
          }
        });
      }
      await withPage(browser, viewport, "/new/green", async (page) => {
        assert.equal(await page.$(".pdp-related"), null, `${vp} BUG has no same-color products`);
      });
      await withPage(browser, viewport, "/new/cascade-silver", async (page) => {
        const single = await page.evaluate(() => {
          const stage = document.querySelector(".pdp-gallery .pdp-stage");
          const rect = stage.getBoundingClientRect();
          return {
            slides: document.querySelectorAll(".pdp-gallery-slide").length,
            diagram: document.querySelectorAll("[data-pdp-diagram]").length,
            index: Boolean(document.querySelector(".pdp-gallery-index")),
            rail: Boolean(document.querySelector(".pdp-scroll-rail")),
            bg: stage ? getComputedStyle(stage).backgroundColor : "",
            square: Math.abs(rect.width - rect.height) <= 1,
          };
        });
        assert.equal(single.slides, 1, `${vp} cascade gallery is one photo`);
        assert.equal(single.bg, "rgb(232, 232, 232)", `${vp} gallery plate`);
        assert.equal(single.square, true, `${vp} gallery square`);
        assert.equal(single.diagram, 0, `${vp} cascade has no drawing`);
        assert.equal(single.index, false, `${vp} cascade counter hidden`);
        assert.equal(single.rail, false, `${vp} cascade rail hidden`);
      });
      await withPage(browser, viewport, "/new/silver", async (page) => {
        const desktop = viewport.width === DESKTOP.width;
        const count = await page.$$eval(".pdp-gallery-slide", (nodes) => nodes.length);
        assert.equal(count, 2, `${vp} wall gallery keeps both photos`);
        assert.equal(await page.$$eval("[data-pdp-diagram]", (nodes) => nodes.length), 0, `${vp} wall gallery has no drawing`);
        if (desktop) {
          await page.waitForSelector(".pdp-scroll-rail.is-on", { timeout: 8000 });
          const rail = await page.evaluate(() => {
            const rail = document.querySelector(".pdp-scroll-rail");
            const thumb = rail?.querySelector(".pdp-scroll-rail-thumb");
            const nav = document.querySelector(".site-nav a");
            const index = document.querySelector(".pdp-gallery-index");
            const slides = [...document.querySelectorAll(".pdp-gallery-slide")].map((node) => node.getBoundingClientRect());
            const rr = rail.getBoundingClientRect();
            const nr = nav.getBoundingClientRect();
            const tr = thumb.getBoundingClientRect();
            return {
              index: index ? getComputedStyle(index).display : "missing",
              railLeft: rr.left,
              navLeft: nr.left,
              railH: rr.height,
              thumbH: tr.height,
              stacked: slides.length > 1 && slides[1].top >= slides[0].bottom - 1,
            };
          });
          assert.equal(rail.index, "none", `${vp} counter hidden`);
          assert.ok(Math.abs(rail.railLeft - rail.navLeft) <= 1, `${vp} rail left ${rail.railLeft} vs nav ${rail.navLeft}`);
          assert.ok(rail.railH > 40 && rail.thumbH < rail.railH, `${vp} rail ${rail.railH} thumb ${rail.thumbH}`);
          assert.equal(rail.stacked, true, `${vp} gallery stacks vertically`);
        } else {
          const mobileGallery = await page.evaluate(() => {
            const rail = document.querySelector(".pdp-scroll-rail");
            const index = document.querySelector(".pdp-gallery-index");
            const slides = [...document.querySelectorAll(".pdp-gallery-slide")].map((node) => node.getBoundingClientRect());
            return {
              rail: rail ? getComputedStyle(rail).display : "missing",
              index: (index?.textContent || "").trim(),
              sideBySide: slides.length > 1 && slides[1].left >= slides[0].right - 1,
            };
          });
          assert.equal(mobileGallery.rail, "none", `${vp} rail hidden`);
          assert.match(mobileGallery.index, /^\d+ \/ \d+$/, `${vp} counter ${mobileGallery.index}`);
          assert.equal(mobileGallery.sideBySide, true, `${vp} gallery stays horizontal`);
        }
      });
      await withPage(browser, viewport, "/new/cascade-silver", async (page) => {
        const desktop = viewport.width === DESKTOP.width;
        await page.evaluate(() => document.querySelector("[data-pdp-store]")?.scrollIntoView({ block: "center" }));
        await page.waitForFunction(
          (expect) => document.querySelector("[data-pdp-buybar]")?.getAttribute("data-pdp-buybar") === expect,
          {},
          desktop ? "off" : "on",
        );
        await page.$eval(".pdp-spec-toggle", (button) => button.click());
        await page.waitForFunction(() => {
          const body = document.querySelector(".pdp-spec-body");
          return Boolean(body && !body.classList.contains("is-collapsed") && body.getBoundingClientRect().height > 80);
        });
        await page.evaluate(() => {
          const store = document.querySelector("[data-pdp-store]");
          const bottom = store.getBoundingClientRect().bottom + window.scrollY;
          window.scrollTo(0, bottom + 24);
        });
        await page.waitForFunction(() => document.querySelector("[data-pdp-buybar]")?.getAttribute("data-pdp-buybar") === "on");
        const bar = await page.evaluate(() => {
          const node = document.querySelector("[data-pdp-buybar]");
          const store = document.querySelector("[data-pdp-store]");
          const link = document.querySelector("[data-pdp-buybar-store]");
          const swatches = document.querySelector(".pdp-buybar-swatches");
          const header = document.querySelector(".site-header");
          const promo = document.querySelector(".site-promo");
          return {
            name: document.querySelector(".pdp-buybar-name")?.textContent?.trim() || "",
            price: document.querySelector(".pdp-buybar-price")?.textContent?.trim() || "",
            priceDisplay: document.querySelector(".pdp-buybar-price")
              ? getComputedStyle(document.querySelector(".pdp-buybar-price")).display
              : "missing",
            label: link?.textContent?.trim() || "",
            href: link?.getAttribute("href") || "",
            main: store?.getAttribute("href") || "",
            swatchDisplay: swatches ? getComputedStyle(swatches).display : "missing",
            z: Number(getComputedStyle(node).zIndex) || 0,
            headerZ: header ? Number(getComputedStyle(header).zIndex) || 0 : 0,
            promoZ: promo ? Number(getComputedStyle(promo).zIndex) || 0 : 70,
            pad: getComputedStyle(document.querySelector(".site-column")).paddingBottom,
          };
        });
        assert.equal(bar.name, "Cascade 600, HOLLOW(Translucent)", `${vp} buy bar name`);
        assert.equal(bar.label, "Store", `${vp} buy bar label`);
        assert.equal(bar.price, "KRW 236,000", `${vp} buy bar price`);
        assert.equal(bar.priceDisplay, desktop ? "none" : "block", `${vp} buy bar price display`);
        assert.equal(bar.href, bar.main, `${vp} buy bar link`);
        assert.equal(bar.swatchDisplay, desktop ? "flex" : "none", `${vp} buy bar swatches ${bar.swatchDisplay}`);
        assert.ok(bar.z < bar.headerZ && bar.z < bar.promoZ, `${vp} buy bar z ${bar.z}`);
        assert.ok(parseFloat(bar.pad) >= 56, `${vp} buy bar padding ${bar.pad}`);
        if (desktop) {
          await page.waitForFunction(() => {
            const box = document.querySelector("[data-pdp-buybar]")?.getBoundingClientRect();
            return Boolean(box && box.top < window.innerHeight - 8 && box.bottom <= window.innerHeight + 1);
          });
          const barHover = await sampleStoreHover(page, "[data-pdp-buybar-store]");
          assertStoreHover(barHover, `${vp} buy bar`);
          await page.mouse.move(0, 0);
          await page.evaluate(() => document.querySelector("[data-pdp-store]")?.scrollIntoView({ block: "center" }));
          await page.waitForFunction(
            () => document.querySelector("[data-pdp-buybar]")?.getAttribute("data-pdp-buybar") === "off",
          );
          const mainHover = await sampleStoreHover(page, "[data-pdp-store]");
          assertStoreHover(mainHover, `${vp} Store`);
          await page.mouse.move(0, 0);
          await page.waitForFunction(() => {
            const arrow = document.querySelector("[data-pdp-store] .pdp-store-arrow");
            return Number.parseFloat(getComputedStyle(arrow).width) === 0;
          });
          const hoverMedia = await page.evaluate(() => {
            const found = [];
            const walk = (rules, media) => {
              for (const rule of rules) {
                if (rule.type === CSSRule.MEDIA_RULE) walk([...rule.cssRules], rule.conditionText || media);
                else if ((rule.selectorText || "").includes("a.pdp-store:hover .pdp-store-arrow")) found.push(media || "unscoped");
              }
            };
            for (const sheet of document.styleSheets) {
              let rules;
              try {
                rules = [...sheet.cssRules];
              } catch {
                continue;
              }
              walk(rules, "");
            }
            return found;
          });
          assert.ok(
            hoverMedia.some((media) => media.includes("pointer: fine") && media.includes("pointer: none")),
            `${vp} Store hover is limited to fine or pointer-less devices, got ${JSON.stringify(hoverMedia)}`,
          );
          assert.ok(!hoverMedia.includes("unscoped"), `${vp} Store hover must not apply on every pointer`);
          await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
          await page.hover("[data-pdp-store]");
          const reduced = await page.evaluate(() => {
            const arrow = document.querySelector("[data-pdp-store] .pdp-store-arrow");
            const mark = document.querySelector(".pdp-spec-toggle-mark");
            return {
              width: Number.parseFloat(getComputedStyle(arrow).width),
              duration: getComputedStyle(arrow).transitionDuration,
              markDuration: getComputedStyle(mark).transitionDuration,
            };
          });
          assert.ok(reduced.width >= 11, `${vp} reduced motion still shows the arrow`);
          assert.equal(reduced.duration, "0s", `${vp} reduced motion drops the arrow transition`);
          assert.equal(reduced.markDuration, "0s", `${vp} reduced motion drops the icon transition`);
        }
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForFunction(
          (expect) => document.querySelector("[data-pdp-buybar]")?.getAttribute("data-pdp-buybar") === expect,
          {},
          desktop ? "off" : "on",
        );
        const covered = await page.evaluate(() => {
          const bar = document.querySelector("[data-pdp-buybar]").getBoundingClientRect();
          const hits = (el) => {
            if (!el) return 0;
            const r = el.getBoundingClientRect();
            return Math.min(bar.bottom, r.bottom) - Math.max(bar.top, r.top);
          };
          return {
            logo: hits(document.querySelector(".site-footer-logo")),
            float: hits(document.querySelector(".site-float-logo")),
            copy: hits(document.querySelector(".site-footer-copy-line")),
            nav: hits(document.querySelector(".site-footer-nav")),
          };
        });
        assert.ok(covered.logo <= 0, `${vp} buy bar covers the footer logo by ${covered.logo}px`);
        assert.ok(covered.float <= 0, `${vp} buy bar covers the float logo by ${covered.float}px`);
        assert.ok(covered.copy <= 0, `${vp} buy bar covers the copyright by ${covered.copy}px`);
        assert.ok(covered.nav <= 0, `${vp} buy bar covers the footer links by ${covered.nav}px`);
      });
      console.log(`ok  ${vp} accordions, specifications, and recommended row`);
    }

    await withPage(browser, DESKTOP, "/new/drain-tower-80", async (page) => {
      await page.evaluate(() => document.querySelector(".pdp-hero-guide")?.scrollIntoView({ block: "center" }));
      await page.waitForFunction(() => {
        const guide = document.querySelector(".pdp-hero-guide img");
        return Boolean(guide && guide.complete && guide.naturalWidth > 0);
      });
      const report = await page.evaluate(() => {
        const guide = document.querySelector(".pdp-hero-guide img");
        const r = guide?.getBoundingClientRect();
        const hero = [...document.querySelectorAll(".pdp-reveal .pdp-stage")].find((node) => node.getBoundingClientRect().width > 0);
        return {
          src: guide?.getAttribute("src") || "",
          w: r ? +r.width.toFixed(1) : 0,
          naturalWidth: guide?.naturalWidth || 0,
          pointer: document.querySelector(".pdp-guide-stage")
            ? getComputedStyle(document.querySelector(".pdp-guide-stage")).pointerEvents
            : null,
          heroW: hero ? +hero.getBoundingClientRect().width.toFixed(1) : 0,
          overflow: +(document.documentElement.scrollWidth - document.documentElement.clientWidth).toFixed(1),
        };
      });
      assert.equal(report.src, "/products/drain-tower-guide.png");
      assert.equal(report.naturalWidth, 950);
      assert.equal(report.pointer, "none");
      assert.ok(report.w > 0, `desktop guide width ${report.w}`);
      assert.equal(report.w, report.heroW, `desktop guide width ${report.w} vs hero ${report.heroW}`);
      assert.ok(report.overflow <= 0, `desktop drain PDP overflow ${report.overflow}`);
      console.log("ok  desktop /new/drain-tower-80: assembly guide matches hero width");
    });

    const legacy = [
      ["/new/drain-tower-100", "/new/drain-tower-20", "Drain Tower 20, VOID(Black)", "KRW 3,000"],
      ["/new/drain-tower-120", "/new/drain-tower-40", "Drain Tower 40, VOID(Black)", "KRW 5,000"],
      ["/new/drain-tower-160", "/new/drain-tower-80", "Drain Tower 80, VOID(Black)", "KRW 9,000"],
      ["/new/drain-tower-230", "/new/drain-tower-80", "Drain Tower 80, VOID(Black)", "KRW 9,000"],
      ["/new/cascade-purple", "/new/cascade-silver", "Cascade 600, HOLLOW(Translucent)", "KRW 236,000"],
    ];
    for (const [from, to, name, price] of legacy) {
      await withPage(browser, MOBILE, from, async (page) => {
        const pathname = new URL(page.url()).pathname;
        const report = await page.evaluate(() => ({
          name: document.querySelector(".pdp-name")?.textContent?.trim() || "",
          color: document.querySelector(".pdp-title-color")?.textContent?.trim() || "",
          price: document.querySelector(".pdp-price")?.textContent?.trim() || "",
        }));
        const [family, colorName] = name.split(", ");
        assert.equal(pathname, to, `${from} redirect path`);
        assert.equal(report.name, family, `${from} redirect name`);
        assert.equal(report.color, colorName, `${from} redirect color`);
        assert.equal(report.price, price, `${from} redirect price`);
        console.log(`ok  ${from} → ${to}: ${name} ${price}`);
      });
    }

    await withPage(browser, MOBILE, "/new?moss=0", async (page) => {
      const sortNames = async () =>
        page.$$eval(".product-caption p.site-type:not(.product-price)", (nodes) =>
          nodes.map((node) => (node.textContent || "").trim()),
        );
      const clickSort = async (label) => {
        await page.click(".new-sort-trigger");
        await page.waitForSelector(".new-sort-menu");
        await page.evaluate((text) => {
          const button = [...document.querySelectorAll(".new-sort-option")].find(
            (node) => (node.textContent || "").trim() === text,
          );
          if (!(button instanceof HTMLElement)) throw new Error(`missing sort ${text}`);
          button.click();
        }, label);
      };
      const row = await page.evaluate(() => {
        const nav = document.querySelector(".new-subnav");
        const tabs = document.querySelector(".new-subnav-tabs");
        const sort = document.querySelector(".new-sort");
        if (!nav || !tabs || !sort) return null;
        const n = nav.getBoundingClientRect();
        const t = tabs.getBoundingClientRect();
        const s = sort.getBoundingClientRect();
        return {
          navH: +n.height.toFixed(1),
          tabsRight: +t.right.toFixed(1),
          sortLeft: +s.left.toFixed(1),
          sortRight: +s.right.toFixed(1),
          navRight: +n.right.toFixed(1),
        };
      });
      assert.ok(row && row.navH <= 24, `412 sort row height ${row?.navH}`);
      assert.ok(row && row.tabsRight <= row.sortLeft - 4, `412 tabs overlap sort ${JSON.stringify(row)}`);
      assert.ok(row && row.sortRight <= row.navRight + 1, `412 sort overflow ${JSON.stringify(row)}`);
      await clickSort("Name");
      const byName = await sortNames();
      const named = [...byName].sort((a, b) => a.localeCompare(b));
      assert.deepEqual(byName, named, `Name sort ${byName}`);
      assert.ok(byName.includes("One Port 141, ODD(Indigo Purple)") && byName.includes("One Port 141, VOID(Black)") && byName.includes("One Port 141, MIST(White)"));
      await clickSort("Price: High to Low");
      const high = await sortNames();
      assert.equal(high[0], "Cascade 600, HOLLOW(Translucent)");
      assert.equal(high[high.length - 1], "Drain Tower 20, VOID(Black)");
      await clickSort("Price: Low to High");
      const low = await sortNames();
      assert.equal(low[0], "Drain Tower 20, VOID(Black)");
      assert.equal(low[low.length - 1], "Cascade 600, HOLLOW(Translucent)");
      console.log("ok  mobile /new sort: Name, High to Low, Low to High");
    });

    async function assertSortMenuPinned(page, label, expected) {
      const triggerBox = () =>
        page.evaluate(() => {
          const el = document.querySelector(".new-sort-trigger");
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: +r.left.toFixed(1),
            right: +r.right.toFixed(1),
            top: +r.top.toFixed(1),
            bottom: +r.bottom.toFixed(1),
            width: +r.width.toFixed(1),
          };
        });
      const closed = await triggerBox();
      assert.ok(closed, `${label} Sort trigger missing`);
      if (expected) {
        if (expected.left != null) assert.equal(closed.left, expected.left, `${label} closed left ${closed.left}`);
        if (expected.right != null) assert.equal(closed.right, expected.right, `${label} closed right ${closed.right}`);
      }
      const type = await page.evaluate(() => {
        const current = document.querySelector('.new-subnav-item[aria-current="page"]');
        const idle = [...document.querySelectorAll(".new-subnav-item")].find(
          (node) => node.getAttribute("aria-current") !== "page",
        );
        const sort = document.querySelector(".new-sort-trigger");
        const cs = current ? getComputedStyle(current) : null;
        const is = idle ? getComputedStyle(idle) : null;
        const ss = sort ? getComputedStyle(sort) : null;
        return {
          tabFs: is?.fontSize || null,
          tabLs: is?.letterSpacing || null,
          tabLh: is?.lineHeight || null,
          idleFw: is?.fontWeight || null,
          currentFw: cs?.fontWeight || null,
          sortFs: ss?.fontSize || null,
          sortLs: ss?.letterSpacing || null,
          sortLh: ss?.lineHeight || null,
          sortFw: ss?.fontWeight || null,
        };
      });
      assert.equal(type.sortFs, type.tabFs, `${label} Sort font-size ${type.sortFs} vs tab ${type.tabFs}`);
      assert.equal(type.sortLs, type.tabLs, `${label} Sort letter-spacing ${type.sortLs} vs tab ${type.tabLs}`);
      assert.equal(type.sortLh, type.tabLh, `${label} Sort line-height ${type.sortLh} vs tab ${type.tabLh}`);
      assert.equal(type.sortFw, type.idleFw, `${label} idle Sort weight ${type.sortFw} vs tab ${type.idleFw}`);
      await page.click(".new-sort-trigger");
      await page.waitForSelector(".new-sort-menu");
      const open = await triggerBox();
      const openFw = await page.evaluate(() => getComputedStyle(document.querySelector(".new-sort-trigger")).fontWeight);
      assert.equal(openFw, type.currentFw, `${label} open Sort weight ${openFw} vs active tab ${type.currentFw}`);
      assert.ok(
        Math.abs(open.left - closed.left) <= 1 && Math.abs(open.right - closed.right) <= 1 && Math.abs(open.top - closed.top) <= 1,
        `${label} trigger moved ${JSON.stringify(closed)} → ${JSON.stringify(open)}`,
      );
      const menu = await page.evaluate(() => {
        const node = document.querySelector(".new-sort-menu");
        const trigger = document.querySelector(".new-sort-trigger");
        if (!node || !trigger) return null;
        const r = node.getBoundingClientRect();
        const t = trigger.getBoundingClientRect();
        const s = getComputedStyle(node);
        const option = document.querySelector(".new-sort-option");
        const os = option ? getComputedStyle(option) : null;
        return {
          position: s.position,
          z: s.zIndex,
          align: s.alignItems,
          gap: s.gap,
          padT: s.paddingTop,
          padR: s.paddingRight,
          padB: s.paddingBottom,
          padL: s.paddingLeft,
          borderW: s.borderTopWidth,
          borderS: s.borderTopStyle,
          borderC: s.borderTopColor,
          optionFs: os?.fontSize || null,
          optionLs: os?.letterSpacing || null,
          left: +r.left.toFixed(1),
          right: +r.right.toFixed(1),
          top: +r.top.toFixed(1),
          bottom: +r.bottom.toFixed(1),
          triggerRight: +t.right.toFixed(1),
          triggerBottom: +t.bottom.toFixed(1),
          vw: window.innerWidth,
          vh: window.innerHeight,
        };
      });
      assert.ok(menu, `${label} Sort menu missing`);
      assert.equal(menu.position, "absolute", `${label} menu position ${menu.position}`);
      assert.ok(Number(menu.z) >= 8, `${label} menu z-index ${menu.z}`);
      assert.equal(menu.align, "flex-end", `${label} menu align ${menu.align}`);
      assert.equal(menu.gap, "8px", `${label} menu gap ${menu.gap}`);
      assert.equal(menu.padT, "10px", `${label} menu padT ${menu.padT}`);
      assert.equal(menu.padR, "12px", `${label} menu padR ${menu.padR}`);
      assert.equal(menu.padB, "10px", `${label} menu padB ${menu.padB}`);
      assert.equal(menu.padL, "12px", `${label} menu padL ${menu.padL}`);
      assert.equal(menu.borderW, "1px", `${label} menu borderW ${menu.borderW}`);
      assert.equal(menu.borderS, "solid", `${label} menu borderS ${menu.borderS}`);
      assert.equal(menu.borderC, "rgb(17, 17, 17)", `${label} menu borderC ${menu.borderC}`);
      assert.equal(menu.optionFs, type.tabFs, `${label} option font-size ${menu.optionFs} vs tab ${type.tabFs}`);
      assert.equal(menu.optionLs, type.tabLs, `${label} option letter-spacing`);
      assert.ok(Math.abs(menu.right - menu.triggerRight) <= 1, `${label} menu not right-aligned ${JSON.stringify(menu)}`);
      assert.ok(menu.top >= menu.triggerBottom - 1, `${label} menu not below Sort ${JSON.stringify(menu)}`);
      assert.ok(menu.left >= -1, `${label} menu clipped left ${JSON.stringify(menu)}`);
      assert.ok(menu.right <= menu.vw + 1, `${label} menu clipped right ${JSON.stringify(menu)}`);
      assert.ok(menu.bottom <= menu.vh + 1, `${label} menu clipped bottom ${JSON.stringify(menu)}`);
      const hit = await page.evaluate(() => {
        const node = document.querySelector(".new-sort-menu");
        const option = document.querySelector(".new-sort-option");
        if (!node || !option) return null;
        const r = option.getBoundingClientRect();
        const el = document.elementFromPoint(r.left + Math.min(12, r.width / 2), r.top + r.height / 2);
        return el ? { tag: el.tagName, cls: String(el.className).slice(0, 80), text: (el.textContent || "").trim() } : null;
      });
      assert.ok(
        hit && (hit.cls.includes("new-sort-option") || hit.cls.includes("new-sort-menu") || hit.text === "Name"),
        `${label} menu covered by ${JSON.stringify(hit)}`,
      );
      await page.click(".new-sort-trigger");
      await page.waitForSelector(".new-sort-menu", { hidden: true });
      const closedAgain = await triggerBox();
      assert.ok(
        Math.abs(closedAgain.left - closed.left) <= 1 && Math.abs(closedAgain.right - closed.right) <= 1,
        `${label} trigger after close ${JSON.stringify(closedAgain)} vs ${JSON.stringify(closed)}`,
      );
    }

    await withPage(browser, MOBILE_320, "/new?moss=0", (page) => assertSortMenuPinned(page, "320"));
    await withPage(browser, MOBILE, "/new?moss=0", (page) =>
      assertSortMenuPinned(page, "412", { right: 396 }),
    );
    await withPage(browser, DESKTOP, "/new?moss=0", (page) =>
      assertSortMenuPinned(page, "1440", { right: 1406 }),
    );
    console.log("ok  Sort trigger stays pinned when the menu opens (320/412/1440)");

    await withPage(browser, MOBILE_320, "/new?cat=mini-port&moss=0", async (page) => {
      const row = await page.evaluate(() => {
        const nav = document.querySelector(".new-subnav");
        const tabs = document.querySelector(".new-subnav-tabs");
        const sort = document.querySelector(".new-sort");
        if (!nav || !tabs || !sort) return null;
        const n = nav.getBoundingClientRect();
        const t = tabs.getBoundingClientRect();
        const s = sort.getBoundingClientRect();
        const overlapping = [...tabs.querySelectorAll(".new-subnav-item")]
          .filter((node) => {
            const r = node.getBoundingClientRect();
            const left = Math.max(r.left, t.left);
            const right = Math.min(r.right, t.right);
            if (right - left < 0.5) return false;
            return right > s.left + 0.5 && left < s.right - 0.5;
          })
          .map((node) => (node.textContent || "").trim());
        return {
          navH: +n.height.toFixed(1),
          tabsRight: +t.right.toFixed(1),
          sortLeft: +s.left.toFixed(1),
          sortRight: +s.right.toFixed(1),
          navRight: +n.right.toFixed(1),
          visibleGap: +(s.left - t.right).toFixed(1),
          overlapping,
          pageOverflow: +(document.documentElement.scrollWidth - document.documentElement.clientWidth).toFixed(1),
        };
      });
      assert.ok(row && row.navH <= 24, `320 sort row height ${row?.navH}`);
      assert.deepEqual(row.overlapping, [], `320 visible tab overlaps Sort ${JSON.stringify(row)}`);
      assert.ok(row && row.visibleGap >= 4, `320 visible tab/Sort gap ${JSON.stringify(row)}`);
      assert.ok(row && row.sortRight <= row.navRight + 1, `320 sort overflow ${JSON.stringify(row)}`);
      assert.ok(row && row.pageOverflow <= 0, `320 page overflow ${row?.pageOverflow}`);
      await page.click(".new-sort-trigger");
      await page.waitForSelector(".new-sort-menu");
      assert.ok(await page.$(".new-sort-menu"), "320 Sort dropdown missing");
      await page.click(".new-sort-trigger");
      console.log("ok  mobile 320 /new: tabs scroll, Sort stays clear");
    });

    await withPage(browser, MOBILE_360, "/new?moss=0", async (page) => {
      const row = await page.evaluate(() => {
        const nav = document.querySelector(".new-subnav");
        const tabs = document.querySelector(".new-subnav-tabs");
        const sort = document.querySelector(".new-sort");
        if (!nav || !tabs || !sort) return null;
        const n = nav.getBoundingClientRect();
        const t = tabs.getBoundingClientRect();
        const s = sort.getBoundingClientRect();
        return {
          navH: +n.height.toFixed(1),
          tabsRight: +t.right.toFixed(1),
          sortLeft: +s.left.toFixed(1),
        };
      });
      assert.ok(row && row.navH <= 24, `360 sort row height ${row?.navH}`);
      assert.ok(row && row.tabsRight <= row.sortLeft - 2, `360 tabs overlap sort ${JSON.stringify(row)}`);
      console.log("ok  mobile 360 /new: sort stays on one row");
    });

    for (const [viewport, label] of [
      [MOBILE_320, "320"],
      [MOBILE_360, "360"],
      [MOBILE, "412"],
      [DESKTOP, "1440"],
    ]) {
      await withPage(browser, viewport, "/new?moss=0", async (page) => {
        const row = await page.evaluate(() => {
          const nav = document.querySelector(".new-subnav");
          const tabs = document.querySelector(".new-subnav-tabs");
          const sort = document.querySelector(".new-sort");
          if (!nav || !tabs || !sort) return null;
          const n = nav.getBoundingClientRect();
          const t = tabs.getBoundingClientRect();
          const s = sort.getBoundingClientRect();
          const items = [...tabs.querySelectorAll(".new-subnav-item")].map((node) => {
            const r = node.getBoundingClientRect();
            return { label: (node.textContent || "").trim(), w: +r.width.toFixed(1) };
          });
          const overlapping = items.filter((item, i) => {
            const node = tabs.querySelectorAll(".new-subnav-item")[i];
            const r = node.getBoundingClientRect();
            const left = Math.max(r.left, t.left);
            const right = Math.min(r.right, t.right);
            if (right - left < 0.5) return false;
            return right > s.left + 0.5 && left < s.right - 0.5;
          }).map((item) => item.label);
          return {
            navH: +n.height.toFixed(1),
            tabsW: +t.width.toFixed(1),
            tabsScroll: +tabs.scrollWidth.toFixed(1),
            sortW: +s.width.toFixed(1),
            gap: +(s.left - t.right).toFixed(1),
            overflowX: getComputedStyle(tabs).overflowX,
            labels: items,
            overlapping,
          };
        });
        assert.ok(row, `${label} tab strip missing`);
        assert.ok(row.navH <= 24, `${label} tab row wrap ${row.navH}`);
        assert.deepEqual(row.overlapping, [], `${label} tab overlaps Sort ${JSON.stringify(row)}`);
        if (Number(label) >= 360) {
          assert.ok(row.gap >= 2, `${label} tabs must fit beside Sort ${JSON.stringify(row)}`);
          assert.equal(row.overflowX === "auto" || row.overflowX === "scroll", false, `${label} must not scroll tabs`);
        } else {
          assert.ok(row.gap >= 4, `${label} visible tab/Sort gap ${JSON.stringify(row)}`);
          assert.ok(row.tabsScroll > row.tabsW + 1, `${label} tabs must scroll ${JSON.stringify(row)}`);
        }
        console.log(`ok  tab strip ${label}: ${JSON.stringify(row)}`);
      });
    }

    for (const path of ["/new", "/new?cat=one-port", "/new/one-port-purple", "/new/one-port-black", "/new/one-port-white"]) {
      await withPage(browser, MOBILE, path, async (page) => {
        const leak = await page.evaluate(() => {
          const text = `${document.title}\n${document.body.innerText}`;
          const alts = [...document.querySelectorAll("img[alt]")].map((img) => img.getAttribute("alt") || "");
          return { text, alts };
        });
        assert.equal(/Dot Port|Dot-port|Mini Port|Mini-port|Wall-kit/i.test(leak.text), false, `${path} leftover name: ${leak.text}`);
        assert.ok(
          leak.alts.every((alt) => !/dot port|mini port/i.test(alt)),
          `${path} leftover alt: ${leak.alts}`,
        );
        console.log(`ok  ${path}: no leftover Mini Port / Dot Port`);
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
        for (const portal of document.querySelectorAll("nextjs-portal")) {
          portal.style.pointerEvents = "none";
        }
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
        report.storeBox && report.storeBox.w > 160 && report.storeBox.h >= 40,
        `${label}: Store should be a full-width button, got ${JSON.stringify(report.storeBox)}`,
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
      const logo = await page.$eval(".site-float-logo", (node) => getComputedStyle(node).display);
      const headerLogo = await page.$eval(".site-pdp-logo", (node) => getComputedStyle(node).display);
      assert.equal(logo, "flex", "mobile PDP keeps the bottom-center logo");
      assert.equal(headerLogo, "none", "mobile PDP logo is not in the header");
      console.log("ok  mobile PDP: no canvas band over the product; mobile raster in use");
    });

    const ABOUT_EN = [
      [
        "Structures where nature grows.",
        "TAEGYE is a design brand creating structures where plants and moss can take root and grow.",
        "We consider where roots settle, how water flows, and where moisture stays, designing the foundations of a small living world.",
        "Forms found in rock, geological layers, and eroded landscapes inform our structures for planting and growth.",
        "Through 3D design and digital fabrication, we create vertical walls and dimensional spaces where plants, moss, soil, and stone come together.",
      ],
      [
        "TAEGYE’s products continue to change as nature settles in.",
        "Plants grow and moss spreads, creating different landscapes within the same structure.",
        "We create the structures where that change begins.",
      ],
    ];
    const ABOUT_KR = [
      [
        "자연이 자라는 구조.",
        "태계는 식물과 이끼가 뿌리내리고 자랄 수 있는 구조를 만드는 디자인 브랜드입니다.",
        "뿌리가 머무는 자리, 물이 흐르는 길, 습기가 유지되는 공간을 생각하며 작은 세계의 기반을 설계합니다.",
        "암석과 지층, 침식된 지형에서 발견한 형태를 식재와 성장을 위한 구조로 발전시킵니다.",
        "3D 디자인과 디지털 제작을 통해 수직의 벽과 입체적인 공간을 만들고, 그 안에 식물과 이끼, 흙과 돌이 자리 잡습니다.",
      ],
      [
        "태계의 제품은 자연이 자리 잡으면서 계속 변화합니다.",
        "식물이 자라고 이끼가 번지며, 같은 구조 안에서도 서로 다른 풍경이 만들어집니다.",
        "우리는 그 변화가 시작될 구조를 만듭니다.",
      ],
    ];

    async function assertAbout(page, label) {
      const report = await page.evaluate(() => {
        const paras = [...document.querySelectorAll(".about-copy")].map((p) => ({
          lang: p.getAttribute("lang"),
          lines: [...p.querySelectorAll(".about-line")].map((s) => s.childNodes[0]?.textContent || ""),
          first: (() => {
            const line = p.querySelector(".about-line");
            if (!line) return null;
            const s = getComputedStyle(line);
            return { fontSize: s.fontSize, fontWeight: s.fontWeight };
          })(),
        }));
        return {
          h1: document.querySelector(".text-page-title")?.textContent?.trim() || "",
          paras,
          pageOverflow: +(document.documentElement.scrollWidth - document.documentElement.clientWidth).toFixed(1),
        };
      });
      assert.equal(report.h1, "About", `${label} h1`);
      assert.equal(report.paras.length, 4, `${label} paragraph count`);
      assert.deepEqual(
        report.paras.map((p) => [p.lang, p.lines]),
        [
          ["en", ABOUT_EN[0]],
          ["en", ABOUT_EN[1]],
          ["ko", ABOUT_KR[0]],
          ["ko", ABOUT_KR[1]],
        ],
        `${label} copy`,
      );
      const bodySize = label.startsWith("desktop") ? "11px" : "10px";
      report.paras.forEach((p, i) => {
        assert.equal(p.first?.fontSize, bodySize, `${label} p${i} first-line size`);
        assert.equal(p.first?.fontWeight, "400", `${label} p${i} first-line weight`);
      });
      assert.ok(report.pageOverflow <= 0, `${label} overflow ${report.pageOverflow}`);
      console.log(`ok  ${label}: About copy, no overflow`);
    }

    await withPage(browser, MOBILE, "/about", (page) => assertAbout(page, "mobile 412 /about"));
    await withPage(browser, DESKTOP, "/about", (page) => assertAbout(page, "desktop 1440 /about"));

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

    await withPage(browser, DESKTOP, "/?scales=1.25,1,0.4&layout=0", async (page) => {
      await assertDesktopScatter(page, "desktop 1440×900");
      const hidden = await page.evaluate(() => {
        const el = document.querySelector(".home-new-in");
        return el ? getComputedStyle(el).display : "missing";
      });
      assert.equal(hidden, "none", `1440 New In must stay hidden, got ${hidden}`);
      console.log("ok  desktop 1440: New In stays hidden");
    });
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
        const card = document.querySelector(".site-promo-card");
        const cr = card ? card.getBoundingClientRect() : null;
        const product = document.querySelector(".site-promo-product");
        const photo = document.querySelector(".site-promo-photo");
        const kickerEl = document.querySelector(".site-promo-kicker");
        const stripEl = document.querySelector(".site-promo-strip");
        const leak = `${document.body.innerText}\n${document.title}`;
        return {
          strip: Boolean(document.querySelector(".site-promo-strip")),
          stripBtns: document.querySelectorAll(".site-promo-strip-btn").length,
          dimTag: document.querySelector(".site-promo-dim")?.tagName || null,
          xW: xr ? xr.width : 0,
          xH: xr ? xr.height : 0,
          cardW: cr ? +cr.width.toFixed(1) : 0,
          cardPlate: sampleCanvas(".site-promo-card > .canvas-white-fill", 0.5, 0.5),
          name: darkest(".site-promo-name canvas"),
          kicker: darkest(".site-promo-kicker canvas"),
          xInk: darkest(".site-promo-x-mark"),
          stripInk: darkest(".site-promo-strip-btn canvas"),
          stripPlate: sampleCanvas(".site-promo-strip .canvas-white-fill", 0.5, 0.5),
          hideLabel: document.querySelector(".site-promo-strip-btn .sr-only")?.textContent || "",
          closeLabel:
            document.querySelector(".site-promo-strip-close .sr-only")?.textContent || "",
          productName: document.querySelector(".site-promo-name .sr-only")?.textContent || "",
          productKicker: document.querySelector(".site-promo-kicker .sr-only")?.textContent || "",
          productHref: product?.getAttribute("href") || "",
          photoSrc: photo?.getAttribute("src") || "",
          photoW: photo ? +photo.getBoundingClientRect().width.toFixed(1) : 0,
          photoH: photo ? +photo.getBoundingClientRect().height.toFixed(1) : 0,
          gapXtoPhoto:
            xr && photo
              ? +(photo.getBoundingClientRect().top - xr.bottom).toFixed(1)
              : 0,
          gapKickerToStrip:
            kickerEl && stripEl
              ? +(stripEl.getBoundingClientRect().top - kickerEl.getBoundingClientRect().bottom).toFixed(1)
              : 0,
          hasLogo: Boolean(document.querySelector(".site-promo-logo")),
          ruleInk: sampleCanvas(".site-promo-strip-rule .canvas-white-fill", 0.5, 0.5),
          dividerInk: (() => {
            const canvas = document.querySelector(".site-promo-strip-divider .canvas-white-fill");
            if (!(canvas instanceof HTMLCanvasElement) || canvas.width < 1 || canvas.height < 1) return null;
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;
            const d = ctx.getImageData(0, Math.max(0, Math.floor(canvas.height / 2)), 1, 1).data;
            return [d[0], d[1], d[2], d[3]];
          })(),
          couponLeak: /GRAND OPENING|5% OFF|쿠폰 받기|스마트스토어 첫 구매/.test(leak),
          open: Boolean(document.querySelector(".site-promo-card")),
          vw: window.innerWidth,
        };
      });
      assert.equal(report.strip, true, `${label}: hide-today / close strip missing`);
      assert.equal(report.stripBtns, 2, `${label}: strip buttons`);
      assert.equal(report.hideLabel, "오늘 하루 보지 않기", `${label}: hide-today label`);
      assert.equal(report.closeLabel, "닫기", `${label}: close label`);
      assert.equal(report.productName, "Wall 212, HOLLOW(Translucent)", `${label}: product name`);
      assert.equal(report.productKicker, "Now Available", `${label}: product kicker`);
      assert.equal(report.productHref, "/new/silver", `${label}: product href`);
      assert.equal(report.photoSrc, "/products/wall212-hollow-planted.png", `${label}: product photo`);
      assert.equal(report.hasLogo, false, `${label}: logo should be gone`);
      assert.equal(report.couponLeak, false, `${label}: coupon copy still visible`);
      const gutter = report.vw <= 400 ? 24 : 32;
      const expectedPhoto = +((report.cardW - gutter) * 0.59).toFixed(1);
      assert.ok(
        Math.abs(report.photoW - expectedPhoto) <= 2 && Math.abs(report.photoH - report.photoW) <= 2,
        `${label}: photo ${report.photoW}×${report.photoH} vs ${expectedPhoto}`,
      );
      assert.ok(
        report.gapXtoPhoto >= 24 && report.gapXtoPhoto <= 36,
        `${label}: X→photo gap ${report.gapXtoPhoto}`,
      );
      assert.ok(
        report.gapKickerToStrip >= 24 && report.gapKickerToStrip <= 36,
        `${label}: kicker→strip gap ${report.gapKickerToStrip}`,
      );
      const gray = (ink, name) => {
        assert.ok(ink, `${label}: ${name} line empty`);
        assert.ok(
          ink[0] >= 210 && ink[0] <= 245 && ink[1] >= 210 && ink[1] <= 245 && ink[2] >= 210 && ink[2] <= 245,
          `${label}: ${name} must stay light gray, got ${ink}`,
        );
      };
      gray(report.ruleInk, "top rule");
      gray(report.dividerInk, "divider");
      assert.equal(report.dimTag, "DIV", `${label}: dim must not be a button`);
      assert.ok(report.xW >= 44 && report.xH >= 44, `${label}: X hit ${report.xW}×${report.xH}`);
      const expectedW = report.vw >= 768 ? 360 : +(report.vw * 0.82).toFixed(1);
      assert.ok(
        Math.abs(report.cardW - expectedW) <= 2,
        `${label}: card width ${report.cardW} vs ${expectedW}`,
      );
      assert.ok(report.cardPlate, `${label}: card white plate empty`);
      assert.ok(report.name, `${label}: name canvas empty`);
      assert.ok(report.kicker, `${label}: kicker canvas empty`);
      assert.ok(report.stripInk, `${label}: strip ink canvas empty`);
      assert.ok(report.stripPlate, `${label}: strip white plate empty`);
      const nameContrast = contrastRatio(report.name.slice(0, 3), report.cardPlate.slice(0, 3));
      const stripContrast = contrastRatio(report.stripInk.slice(0, 3), report.stripPlate.slice(0, 3));
      assert.ok(
        nameContrast >= 4.5,
        `${label}: name contrast ${nameContrast.toFixed(2)} name=${report.name} plate=${report.cardPlate}`,
      );
      assert.ok(
        stripContrast >= 4.5,
        `${label}: strip contrast ${stripContrast.toFixed(2)} ink=${report.stripInk} plate=${report.stripPlate}`,
      );
      assert.ok(
        report.cardPlate[0] >= 250 && report.cardPlate[1] >= 250 && report.cardPlate[2] >= 250,
        `${label}: card plate must stay white, got ${report.cardPlate}`,
      );
      assert.ok(
        report.name[0] <= 30 && report.name[1] <= 30 && report.name[2] <= 30,
        `${label}: name must stay near-black, got ${report.name}`,
      );
      assert.ok(
        report.xInk &&
          report.xInk[0] >= 140 &&
          report.xInk[0] <= 180 &&
          report.xInk[1] >= 140 &&
          report.xInk[1] <= 180 &&
          report.xInk[2] >= 140 &&
          report.xInk[2] <= 180,
        `${label}: X must stay mid gray (#999–#AAA), got ${report.xInk}`,
      );
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
      return { nameContrast, stripContrast };
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
      ["desktop 1440 light", DESKTOP, false],
      ["desktop 1440 forced-dark", DESKTOP, true],
    ]) {
      await withPromo(browser, vp, dark, async (page) => {
        const ratios = await assertPromo(page, name);
        console.log(
          `ok  promo ${name}: white card; name ${ratios.nameContrast.toFixed(2)}:1 strip ${ratios.stripContrast.toFixed(2)}:1`,
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

    await withPromo(browser, MOBILE, false, async (page) => {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0", timeout: 20000 }),
        page.click(".site-promo-product"),
      ]);
      const dest = await page.evaluate(() => ({
        path: location.pathname,
        closed: window.sessionStorage.getItem("taegye-promo-closed"),
        open: Boolean(document.querySelector(".site-promo-card")),
      }));
      assert.equal(dest.path, "/new/silver", `product link path ${dest.path}`);
      assert.equal(dest.closed, "1", "product link should mark the session");
      assert.equal(dest.open, false, "product link should close the promo");
      console.log("ok  promo product link goes to Wall 212 HOLLOW");
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
