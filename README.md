# TAEGYE

Brand website for **TAEGYE (태계)** — a hip modular moss terrarium studio.

Stack: Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui.

## Local

```bash
npm install
npm run dev
```

```bash
npm run build
npm start
```

## Site notes

- Home is a two-panel hero (silver acrylic stand / black stand) with the footer immediately below — no mid-page teaser.
- Nav `store` opens Naver Smart Store in a new tab (`STORE_URL` in `src/lib/site.ts`).
- `/store` redirects to the same URL.
- Instagram is `https://www.instagram.com/taegye_/`.
- Footer copyright `© 2026 LAB TAEGYE +` expands business info (placeholders in `LEGAL`).
- `/new` is a 4-column catalog of five Modular Stand colors; hover reveals the moss-filled pair (no invented prices).
- `/about` is bilingual (English, then Korean).
- Product photography on `/archive` is left as blank slots on purpose.

## Deploy on Vercel

This repo is ready for a Git-connected production deploy.

1. Open [Vercel New Project](https://vercel.com/new).
2. Import `atrox42/taegye`.
3. Framework Preset: **Next.js** (auto-detected).
4. Root Directory: `.`
5. Build Command: `npm run build` · Output: default Next.js.
6. Deploy **Production** from `main`.

No extra environment variables are required for the static brand site.
After the first deploy, Vercel will rebuild on every push to `main`.
