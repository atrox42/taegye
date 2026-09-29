#!/usr/bin/env node
/**
 * Measure /new catalog grid line thickness at several DPRs.
 *
 *   BASE_URL=http://127.0.0.1:3000 node scripts/measure-grid-lines.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "/tmp/grid-lines";
const LABEL = process.env.LABEL || "grid";
const DPRS = [1, 1.25, 1.5, 2];
const VIEW = { width: 1440, height: 900 };
const PAGE = "/new?intro=skip&promo=skip&cat=all&tile=4&moss=1";

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

const report = { base: BASE, label: LABEL, page: PAGE, samples: [] };

try {
  for (const dpr of DPRS) {
    const page = await browser.newPage();
    await page.setViewport({ ...VIEW, deviceScaleFactor: dpr });
    await page.goto(`${BASE}${PAGE}`, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.intro === "done", {
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 500));
    const layout = await page.evaluate(() => {
      const grid = document.querySelector(".new-grid");
      const items = [...document.querySelectorAll(".new-grid-item")];
      if (!grid || items.length < 5) return null;
      const g = grid.getBoundingClientRect();
      const a = items[0].getBoundingClientRect();
      const b = items[1].getBoundingClientRect();
      const below = items[4].getBoundingClientRect();
      return {
        grid: { x: g.x, y: g.y, w: g.width, h: g.height },
        cell: { x: a.x, y: a.y, w: a.width, h: a.height, r: a.right, b: a.bottom },
        next: { x: b.x, y: b.y },
        below: { y: below.y },
        canvas: document.querySelector(".new-grid-lines")?.dataset.gridLines ?? null,
      };
    });
    if (!layout) {
      await page.close();
      throw new Error(`no grid at dpr=${dpr}`);
    }

    const vClip = {
      x: Math.max(0, layout.cell.r - 12),
      y: Math.max(0, layout.cell.y + layout.cell.h * 0.35 - 8),
      width: 24,
      height: 16,
    };
    const hClip = {
      x: Math.max(0, layout.cell.x + layout.cell.w * 0.35 - 8),
      y: Math.max(0, layout.cell.b - 12),
      width: 16,
      height: 24,
    };
    const xClip = {
      x: Math.max(0, layout.cell.r - 16),
      y: Math.max(0, layout.cell.b - 16),
      width: 32,
      height: 32,
    };

    const vPng = await page.screenshot({ clip: vClip, encoding: "base64" });
    const hPng = await page.screenshot({ clip: hClip, encoding: "base64" });
    const xPng = await page.screenshot({ clip: xClip, encoding: "base64" });

    const measured = await page.evaluate(
      async (vB64, hB64, xB64) => {
        const load = async (b64) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          return { img, data: ctx.getImageData(0, 0, c.width, c.height), w: c.width, h: c.height };
        };
        const read = (data, w, x, y) => {
          const i = (y * w + x) * 4;
          return [data[i], data[i + 1], data[i + 2], data[i + 3]];
        };
        const ink = (p) => p[3] >= 200 && p[0] < 80 && p[1] < 80 && p[2] < 80;
        const visible = (p) => p[3] >= 200 && p[0] < 170 && p[1] < 170 && p[2] < 170;
        const longest = (count, pick) => {
          let best = 0;
          let i = 0;
          while (i < count) {
            if (!ink(pick(i))) {
              i += 1;
              continue;
            }
            let j = i + 1;
            while (j < count && ink(pick(j))) j += 1;
            best = Math.max(best, j - i);
            i = j;
          }
          return best;
        };

        const v = await load(vB64);
        const h = await load(hB64);
        const x = await load(xB64);
        const vMid = Math.floor(v.h / 2);
        const hMid = Math.floor(h.w / 2);
        const verticalPx = longest(v.w, (i) => read(v.data.data, v.w, i, vMid));
        const horizontalPx = longest(h.h, (i) => read(h.data.data, h.w, hMid, i));

        const zoom = document.createElement("canvas");
        const scale = 8;
        zoom.width = x.w * scale;
        zoom.height = x.h * scale;
        const zctx = zoom.getContext("2d");
        zctx.imageSmoothingEnabled = false;
        zctx.drawImage(x.img, 0, 0, zoom.width, zoom.height);
        return {
          verticalPx,
          horizontalPx,
          vSize: { w: v.w, h: v.h },
          hSize: { w: h.w, h: h.h },
          zoomDataUrl: zoom.toDataURL("image/png"),
        };
      },
      vPng,
      hPng,
      xPng,
    );

    const full = path.join(OUT, `${LABEL}-dpr-${String(dpr).replace(".", "_")}-full.png`);
    const zoomFile = path.join(OUT, `${LABEL}-dpr-${String(dpr).replace(".", "_")}-zoom.png`);
    await page.screenshot({ path: full, fullPage: false });
    fs.writeFileSync(zoomFile, Buffer.from(measured.zoomDataUrl.split(",")[1], "base64"));

    const sample = {
      dpr,
      layout,
      verticalDevicePx: measured.verticalPx,
      horizontalDevicePx: measured.horizontalPx,
      equal: measured.verticalPx === measured.horizontalPx,
      screenshot: full,
      zoom: zoomFile,
    };
    report.samples.push(sample);
    console.log(
      `dpr ${dpr}: V=${measured.verticalPx}px H=${measured.horizontalPx}px equal=${sample.equal} canvas=${layout.canvas}`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}

const json = path.join(OUT, `${LABEL}.json`);
fs.writeFileSync(json, JSON.stringify(report, null, 2));
console.log(`wrote ${json}`);
