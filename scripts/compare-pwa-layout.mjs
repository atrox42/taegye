#!/usr/bin/env node
/** Compare two dump-pwa-layout JSON files; layout boxes must match. */
import fs from "node:fs";

const aPath = process.argv[2];
const bPath = process.argv[3];
if (!aPath || !bPath) {
  console.error("usage: node scripts/compare-pwa-layout.mjs <before.json> <after.json>");
  process.exit(1);
}

const ignore = new Set(["screenshot", "viewport", "theme", "manifest"]);

function walk(a, b, path, diffs) {
  if (a == null && b == null) return;
  if (typeof a !== typeof b) {
    diffs.push(`${path}: type ${typeof a} vs ${typeof b}`);
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      diffs.push(`${path}: array length ${a.length} vs ${Array.isArray(b) ? b.length : b}`);
      return;
    }
    a.forEach((item, i) => walk(item, b[i], `${path}[${i}]`, diffs));
    return;
  }
  if (a && typeof a === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b || {})]);
    for (const key of keys) {
      if (ignore.has(key)) continue;
      walk(a[key], b?.[key], path ? `${path}.${key}` : key, diffs);
    }
    return;
  }
  if (a !== b) diffs.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
}

const a = JSON.parse(fs.readFileSync(aPath, "utf8"));
const b = JSON.parse(fs.readFileSync(bPath, "utf8"));
const diffs = [];
walk(a.shots, b.shots, "shots", diffs);
if (diffs.length) {
  console.error(`layout mismatch (${diffs.length}):`);
  diffs.forEach((line) => console.error(`  ${line}`));
  process.exit(1);
}
console.log("ok  pwa layout boxes are identical (viewport/manifest/theme ignored)");
