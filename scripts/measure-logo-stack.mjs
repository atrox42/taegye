#!/usr/bin/env node
/** Measure mobile home float-logo vs CTA / copyright at top, mid, bottom. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "/tmp/logo-stack";
const LABEL = process.env.LABEL || "stack";
const SKIP = "intro=skip&promo=skip&scales=1.25,1,0.4&layout=0";

const VIEWS = [
  { name: "m412", width: 412, height: 915, deviceScaleFactor: 2.75 },
  { name: "m360", width: 360, height: 780, deviceScaleFactor: 2 },
];
const PLACES = ["top", "mid", "bottom"];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

const report = { base: BASE, label: LABEL, views: {} };

function overlap(a, b) {
  return Boolean(a && b && a.bottom > b.top && a.top < b.bottom);
}

try {
  for (const view of VIEWS) {
    const page = await browser.newPage();
    await page.setViewport(view);
    await page.goto(`${BASE}/?${SKIP}`, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 400));
    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const ys = { top: 0, mid: Math.max(0, Math.round(max / 2)), bottom: Math.max(0, max) };
    report.views[view.name] = { maxScroll: max, places: {} };

    for (const place of PLACES) {
      await page.evaluate((y) => window.scrollTo(0, y), ys[place]);
      await new Promise((r) => setTimeout(r, 280));
      const data = await page.evaluate(() => {
        const box = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return {
            y: Math.round(r.y * 10) / 10,
            bottom: Math.round(r.bottom * 10) / 10,
            h: Math.round(r.height * 10) / 10,
            bottomCss: s.bottom,
            position: s.position,
            opacity: Number(s.opacity),
            hidden: el.classList.contains("is-hidden"),
          };
        };
        const cta = box(".home-new-in-cta");
        const copy = box(".site-footer-copy-line");
        const logo = box(".site-float-logo");
        const nav = box(".site-footer-nav");
        const h = window.innerHeight;
        return {
          scrollY: Math.round(window.scrollY),
          viewH: h,
          cta,
          copy,
          logo,
          nav,
          gapCtaToLogo: cta && logo ? Math.round((logo.y - cta.bottom) * 10) / 10 : null,
          gapLogoToCopy: logo && copy ? Math.round((copy.y - logo.bottom) * 10) / 10 : null,
          logoFromBottom: logo ? Math.round((h - logo.bottom) * 10) / 10 : null,
        };
      });
      data.overlapsCta = overlap(data.logo, data.cta);
      data.overlapsCopy = overlap(data.logo, data.copy);
      const file = path.join(OUT, `${LABEL}-${view.name}-${place}.png`);
      await page.screenshot({ path: file, fullPage: false });
      report.views[view.name].places[place] = { ...data, screenshot: file, scrollTo: ys[place] };
      console.log(
        `${view.name} ${place}: logo y=${data.logo?.y}-${data.logo?.bottom} cta→logo=${data.gapCtaToLogo} logo→copy=${data.gapLogoToCopy} overlapCta=${data.overlapsCta} overlapCopy=${data.overlapsCopy}`,
      );
    }

    await page.goto(`${BASE}/new?${SKIP}`, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
      timeout: 15000,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 200));
    report.views[view.name].catalog = await page.evaluate(() => {
      const logo = document.querySelector(".site-float-logo");
      const r = logo?.getBoundingClientRect();
      return {
        logoFromBottom: r ? Math.round(window.innerHeight - r.bottom) : null,
        bottomCss: logo ? getComputedStyle(logo).bottom : null,
      };
    });
    await page.close();
  }
} finally {
  await browser.close();
}

const json = path.join(OUT, `${LABEL}.json`);
fs.writeFileSync(json, JSON.stringify(report, null, 2));
console.log(`wrote ${json}`);
