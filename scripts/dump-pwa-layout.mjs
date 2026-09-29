#!/usr/bin/env node
/** Dump layout boxes + screenshots for home, /new, PDP at PC and mobile. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "/tmp/pwa-layout";
const LABEL = process.env.LABEL || "shot";
const SKIP = "intro=skip&promo=skip&scales=1.25,1,0.4&layout=0";

const VIEWS = [
  { name: "pc", width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: "m412", width: 412, height: 915, deviceScaleFactor: 2.75 },
];
const PATHS = [
  { name: "home", path: "/" },
  { name: "new", path: "/new" },
  { name: "pdp", path: "/new/white" },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

function roundBox(r) {
  return {
    x: Math.round(r.x * 10) / 10,
    y: Math.round(r.y * 10) / 10,
    w: Math.round(r.width * 10) / 10,
    h: Math.round(r.height * 10) / 10,
  };
}

const report = { base: BASE, label: LABEL, shots: {} };

try {
  for (const view of VIEWS) {
    report.shots[view.name] = {};
    for (const route of PATHS) {
      const page = await browser.newPage();
      await page.setViewport(view);
      await page.goto(`${BASE}${route.path}?${SKIP}`, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
        timeout: 15000,
      });
      await new Promise((r) => setTimeout(r, 400));
      await page.evaluate(() => {
        document.querySelectorAll("video").forEach((video) => {
          video.pause();
          try {
            video.currentTime = 0;
          } catch {
            /* ignore */
          }
        });
        document.querySelectorAll("nextjs-portal, [data-next-badge-root]").forEach((el) => el.remove());
      });
      await new Promise((r) => setTimeout(r, 200));
      const data = await page.evaluate(() => {
        const box = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return {
            x: Math.round(r.x * 10) / 10,
            y: Math.round(r.y * 10) / 10,
            w: Math.round(r.width * 10) / 10,
            h: Math.round(r.height * 10) / 10,
            position: s.position,
            display: s.display,
            bottom: s.bottom,
            padB: s.paddingBottom,
          };
        };
        const clips = [...document.querySelectorAll(".home-hero-clip")].map((node) => {
          const r = node.getBoundingClientRect();
          return {
            x: Math.round(r.x * 10) / 10,
            y: Math.round(r.y * 10) / 10,
            w: Math.round(r.width * 10) / 10,
            h: Math.round(r.height * 10) / 10,
          };
        });
        const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute("content") || "";
        const theme = [...document.querySelectorAll('meta[name="theme-color"]')].map((n) =>
          n.getAttribute("content"),
        );
        const manifest = document.querySelector('link[rel="manifest"]')?.getAttribute("href") || null;
        return {
          viewport,
          theme,
          manifest,
          hero: box(".home-hero"),
          clips,
          logo: box(".site-float-logo"),
          footer: box(".site-footer"),
          inner: box(".site-footer-inner"),
          grid: box(".new-grid"),
          stage:
            box(".pdp-mobile-gallery .pdp-stage") ||
            box(".pdp-stage") ||
            box(".pdp-hero"),
        };
      });
      const file = path.join(OUT, `${LABEL}-${view.name}-${route.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      report.shots[view.name][route.name] = { ...data, screenshot: file };
      console.log(`wrote ${file}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const json = path.join(OUT, `${LABEL}.json`);
fs.writeFileSync(json, JSON.stringify(report, null, 2));
console.log(`wrote ${json}`);
