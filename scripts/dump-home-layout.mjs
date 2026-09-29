#!/usr/bin/env node
/** Dump home bounding boxes + screenshots at 1440×900 and 412×915. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "/tmp/home-layout";
const LABEL = process.env.LABEL || "shot";
const SKIP = "intro=skip&promo=skip&scales=1.25,1,0.4&layout=0";

const VIEWS = [
  { name: "pc", width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: "fhd", width: 1920, height: 1080, deviceScaleFactor: 1 },
  { name: "mobile", width: 412, height: 915, deviceScaleFactor: 2.75 },
  { name: "mobile360", width: 360, height: 780, deviceScaleFactor: 2 },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

const report = { base: BASE, label: LABEL, views: {} };

try {
  for (const view of VIEWS) {
    const page = await browser.newPage();
    await page.setViewport(view);
    await page.goto(`${BASE}/?${SKIP}`, { waitUntil: "networkidle0", timeout: 45000 });
    await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => window.scrollTo(0, 0));
    const data = await page.evaluate(() => {
      const measure = (node) => {
        const r = node.getBoundingClientRect();
        const s = getComputedStyle(node);
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          position: s.position,
          display: s.display,
          overflow: s.overflow,
        };
      };
      const pick = (sel) => {
        const el = document.querySelector(sel);
        return el ? measure(el) : null;
      };
      const clips = [...document.querySelectorAll(".home-hero-clip")].map(measure);
      const stackTop = clips.length ? Math.min(...clips.map((c) => c.y)) : null;
      const stackBottom = clips.length ? Math.max(...clips.map((c) => c.y + c.h)) : null;
      const stackMid = stackTop != null ? (stackTop + stackBottom) / 2 : null;
      const viewMid = window.innerHeight / 2;
      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        hero: pick(".home-hero"),
        clips,
        stack: stackMid == null ? null : {
          top: Math.round(stackTop),
          bottom: Math.round(stackBottom),
          mid: Math.round(stackMid * 10) / 10,
          viewMid,
          offsetY: Math.round((stackMid - viewMid) * 10) / 10,
        },
        splash: pick(".site-splash"),
        logo: pick(".site-float-logo"),
        dock: pick(".site-float-dock"),
        newIn: pick(".home-new-in"),
        footer: pick(".site-footer"),
      };
    });
    const file = path.join(OUT, `${LABEL}-${view.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    report.views[view.name] = { ...data, screenshot: file };
    await page.close();
    console.log(`wrote ${file}`);
  }
} finally {
  await browser.close();
}

const json = path.join(OUT, `${LABEL}.json`);
fs.writeFileSync(json, JSON.stringify(report, null, 2));
console.log(`wrote ${json}`);
console.log(JSON.stringify(report, null, 2));
