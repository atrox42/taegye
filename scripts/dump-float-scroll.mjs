#!/usr/bin/env node
/** Screenshot home at top / middle / bottom for 1440×900 and 412×915. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "/tmp/float-scroll";
const LABEL = process.env.LABEL || "shot";
const SKIP = "intro=skip&promo=skip&scales=1.25,1,0.4&layout=0";

const VIEWS = [
  { name: "pc", width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: "mobile", width: 412, height: 915, deviceScaleFactor: 2.75 },
];
const PLACES = ["top", "mid", "bottom"];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

const report = { base: BASE, label: LABEL, shots: {} };

try {
  for (const view of VIEWS) {
    const page = await browser.newPage();
    await page.setViewport(view);
    await page.goto(`${BASE}/?${SKIP}`, { waitUntil: "networkidle0", timeout: 45000 });
    await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 400));
    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const ys = { top: 0, mid: Math.max(0, Math.round(max / 2)), bottom: Math.max(0, max) };
    report.shots[view.name] = {};
    for (const place of PLACES) {
      await page.evaluate((y) => window.scrollTo(0, y), ys[place]);
      await new Promise((r) => setTimeout(r, 250));
      const data = await page.evaluate(() => {
        const logo = document.querySelector(".site-float-logo");
        const footer = document.querySelector(".site-footer");
        const measure = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
            position: s.position,
            display: s.display,
            opacity: Number(s.opacity),
            hidden: el.classList.contains("is-hidden"),
          };
        };
        const lr = measure(logo);
        const fr = measure(footer);
        return {
          scrollY: Math.round(window.scrollY),
          logo: lr,
          footer: fr,
          straddle: Boolean(
            lr &&
              fr &&
              lr.display !== "none" &&
              lr.opacity > 0.5 &&
              lr.y + lr.h > fr.y &&
              lr.y < fr.y + fr.h,
          ),
        };
      });
      const file = path.join(OUT, `${LABEL}-${view.name}-${place}.png`);
      await page.screenshot({ path: file, fullPage: false });
      report.shots[view.name][place] = { ...data, screenshot: file };
      console.log(`wrote ${file}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

const json = path.join(OUT, `${LABEL}.json`);
fs.writeFileSync(json, JSON.stringify(report, null, 2));
console.log(`wrote ${json}`);
console.log(JSON.stringify(report, null, 2));
