#!/usr/bin/env node
/** Measure mobile home bottom: CTA→footer, footer→page bottom, float logo. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "/tmp/footer-gap";
const LABEL = process.env.LABEL || "gap";
const SKIP = "intro=skip&promo=skip&scales=1.25,1,0.4&layout=0";

const VIEWS = [
  { name: "m412", width: 412, height: 915, deviceScaleFactor: 2.75 },
  { name: "m360", width: 360, height: 780, deviceScaleFactor: 2 },
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
    await page.goto(`${BASE}/?${SKIP}`, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await new Promise((r) => setTimeout(r, 300));
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
          padT: s.paddingTop,
          padB: s.paddingBottom,
          bottomCss: s.bottom,
        };
      };
      const cta = box(".home-new-in-cta");
      const footer = box(".site-footer");
      const inner = box(".site-footer-inner");
      const nav = box(".site-footer-nav");
      const copy = box(".site-footer-copy-line");
      const logo = box(".site-float-logo");
      const pageH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      return {
        viewport: { w: window.innerWidth, h: pageH, scrollH: docH, scrollY: Math.round(window.scrollY) },
        cta,
        footer,
        inner,
        nav,
        copy,
        logo,
        gapCtaToFooter: cta && footer ? Math.round((footer.y - cta.bottom) * 10) / 10 : null,
        gapCtaToLogo: cta && logo ? Math.round((logo.y - cta.bottom) * 10) / 10 : null,
        gapLogoToCopy: logo && copy ? Math.round((copy.y - logo.bottom) * 10) / 10 : null,
        gapFooterContentToPage: nav ? Math.round((pageH - nav.bottom) * 10) / 10 : null,
        gapFooterBoxToPage: footer ? Math.round((pageH - footer.bottom) * 10) / 10 : null,
        logoFromViewportBottom: logo ? Math.round((pageH - logo.bottom) * 10) / 10 : null,
        logoTop: logo?.y ?? null,
        footerInternalGap: copy && nav ? Math.round((nav.y - copy.bottom) * 10) / 10 : null,
      };
    });
    const file = path.join(OUT, `${LABEL}-${view.name}-bottom.png`);
    await page.screenshot({ path: file, fullPage: false });
    report.views[view.name] = { ...data, screenshot: file };

    await page.goto(`${BASE}/new?${SKIP}`, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
      timeout: 15000,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 200));
    const catalog = await page.evaluate(() => {
      const logo = document.querySelector(".site-float-logo")?.getBoundingClientRect();
      const footer = document.querySelector(".site-footer")?.getBoundingClientRect();
      const grid = document.querySelector(".new-grid")?.getBoundingClientRect();
      return {
        logoBottom: logo ? Math.round(logo.bottom) : null,
        logoFromBottom: logo ? Math.round(window.innerHeight - logo.bottom) : null,
        footerH: footer ? Math.round(footer.height) : null,
        gridW: grid ? Math.round(grid.width) : null,
      };
    });
    report.views[view.name].catalogTop = catalog;
    await page.close();
    console.log(
      `${view.name}: cta→footer=${data.gapCtaToFooter} cta→logo=${data.gapCtaToLogo} logo→copy=${data.gapLogoToCopy} logoFromBottom=${data.logoFromViewportBottom} internal=${data.footerInternalGap}`,
    );
  }
} finally {
  await browser.close();
}

const json = path.join(OUT, `${LABEL}.json`);
fs.writeFileSync(json, JSON.stringify(report, null, 2));
console.log(`wrote ${json}`);
