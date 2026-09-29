import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_KR, Roboto_Condensed } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import { SiteShell } from "@/components/site-shell";
import {
  BRAND_MAIN,
  BRAND_SUB,
  FORCE_PURPLE_IMAGE,
  FORCE_PURPLE_LIGHT_IMAGE,
} from "@/lib/force-white";
import { HOME_PROMO, SITE_DESCRIPTION, SITE_NAME, SITE_NAME_KR } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-splash",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} (${SITE_NAME_KR})`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#FFFFFF",
  viewportFit: "cover",
};

const rootPaint = {
  colorScheme: "only light",
  backgroundColor: "transparent",
} as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-intro="pending"
      suppressHydrationWarning
      className={`light ${geistSans.variable} ${notoSansKr.variable} ${robotoCondensed.variable} h-full antialiased`}
      style={rootPaint}
    >
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preload" href="/logo-taegye.png" as="image" />
        <link rel="preload" href="/ink-111.jpg" as="image" />
        <link rel="preload" href="/dim-black.png" as="image" />
        <link rel="preload" href="/purple-574667.png" as="image" />
        <link rel="preload" href="/purple-6F5C82.png" as="image" />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--brand-main:${BRAND_MAIN};--brand-sub:${BRAND_SUB};--brand-main-image:${FORCE_PURPLE_IMAGE};--brand-sub-image:${FORCE_PURPLE_LIGHT_IMAGE};--font-pretendard:"Pretendard Variable",Pretendard,sans-serif}.site-promo,.site-promo-eyebrow,.site-promo-title,.site-promo-line,.site-promo-cta-label,.site-promo-strip-btn{font-family:var(--font-pretendard)!important}html{overflow-x:clip!important;overflow-y:auto!important;scrollbar-width:thin;scrollbar-color:#000 transparent}html::-webkit-scrollbar{width:8px;height:8px}html::-webkit-scrollbar-button,html::-webkit-scrollbar-button:single-button,html::-webkit-scrollbar-button:double-button,html::-webkit-scrollbar-button:start:decrement,html::-webkit-scrollbar-button:end:increment,html::-webkit-scrollbar-button:vertical:start,html::-webkit-scrollbar-button:vertical:end{display:none!important;width:0!important;height:0!important;background:none!important;border:0!important}html::-webkit-scrollbar-track,html::-webkit-scrollbar-corner{background:transparent}html::-webkit-scrollbar-thumb{background-color:#000;background-image:url("/ink-111.jpg");background-repeat:repeat;background-size:8px 8px;border:0;border-radius:0;forced-color-adjust:none;color-scheme:only light}@media (hover:hover) and (pointer:fine),(min-width:768px){html{overflow-y:scroll!important;scrollbar-gutter:stable}}html[data-promo=off] .site-promo{display:none!important;visibility:hidden!important;pointer-events:none!important}.site-promo,.site-promo-dim{background-color:transparent!important;background-image:none!important;transition:none!important}.site-promo-dim-bitmap{transition:none!important;opacity:1}@media (min-width:768px){.home-new-in,.site-float-logo,.site-float-dock{display:none!important}}details,summary,select{-webkit-appearance:none!important;appearance:none!important;background-image:none!important}details,summary{list-style:none!important}summary::-webkit-details-marker,summary::marker,summary::before,summary::after{display:none!important;content:none!important}:root,html,body{color-scheme:only light;background-color:transparent!important;background-image:none!important;color:#111111!important}.site-shell,.site-column,.site-footer,.site-header,.site-nav,.site-menubar,.site-menu,.site-splash,.site-white-layer,.home-hero,.home-new-in,.site-float-dock,main,.site-main,.site-page,.site-footer-inner,.new-page,.new-grid-item,.new-subnav,.product-card,.product-stage,.pdp,.pdp-atelier,.pdp-hero,.pdp-visual,.pdp-stage,.pdp-gallery,.pdp-gallery-slide,.site-promo-card{color-scheme:only light;background-color:transparent!important;background-image:none!important;color:#111111!important}.canvas-white-fixed{position:fixed;inset:0;z-index:0;pointer-events:none;width:100%;height:100%}.new-grid{background-color:#111111!important;background-image:none!important}@media (min-width:768px){.new-grid-wrap .new-grid{background-color:transparent!important;background-image:none!important}}.new-grid{background-color:#111111!important;background-image:none!important}@media (min-width:768px){.new-grid-wrap .new-grid{background-color:transparent!important;background-image:none!important}}.product-empty,.product-moss,.site-float-logo,.site-float-logo-mark,.site-type,.site-type *,.site-footer-link,.site-menubar-toggle,.product-price,.pdp-store,.product-caption,.product-caption *,.product-card>div:not(.white-surface-fill){background-color:transparent!important}.site-menubar-toggle{background:none!important;background-image:none!important}.product-empty,.product-moss,.site-float-logo,.site-float-logo-mark{background-image:none!important}.site-splash{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;opacity:1;background-color:transparent!important;background-image:none!important}.site-splash-bitmap{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1}html[data-intro=done] .site-splash{display:none}.site-nav a{color:#999999!important;-webkit-text-fill-color:#999999!important}.site-nav a[aria-current=page],.site-nav-link.is-active,.site-menu-row,.site-promo-ink{color:#111111!important;-webkit-text-fill-color:transparent!important;background-image:url("/ink-111.jpg")!important;background-size:8px 8px;-webkit-background-clip:text!important;background-clip:text!important}.site-splash-copy{color:#111111!important;-webkit-text-fill-color:#111111!important}.site-promo-visual{background-color:var(--brand-main)!important;background-image:var(--brand-main-image)!important;background-size:100% 100%!important;color:#ffffff!important}.home-new-in-cta-face{background-color:var(--brand-sub)!important;background-image:var(--brand-sub-image)!important;background-size:100% 100%!important;color:#ffffff!important}.home-new-in-cta{padding:0!important;border:0!important;background-image:none!important}.home-new-in-cta-label,.site-promo-white{color:#ffffff!important;-webkit-text-fill-color:transparent!important;background-image:url("/bg-white.jpg")!important;background-size:8px 8px;-webkit-background-clip:text!important;background-clip:text!important}.site-promo-cta{padding:0!important;border:0!important;background-image:none!important}.site-promo-cta-face{background-color:var(--brand-sub)!important;background-image:var(--brand-sub-image)!important;background-size:100% 100%!important;color:#ffffff!important;border:0!important}@media (min-width:768px){.site-splash{display:none!important}}@media (prefers-color-scheme:dark){:root,html,body{background-color:transparent!important;background-image:none!important;color:#111111!important;color-scheme:only light}.site-shell,.site-footer,.site-header,.site-nav,.site-menubar,.site-menu,.site-splash,.home-hero,main,.site-main,.site-page,.site-column,.home-new-in,.new-page,.new-grid-item,.new-subnav,.product-card,.product-stage,.pdp,.pdp-atelier,.pdp-hero,.pdp-visual,.pdp-stage{background-color:transparent!important;background-image:none!important}.product-empty,.product-moss,.site-float-logo,.site-float-logo-mark,.site-type,.site-type *,.site-footer-link,.site-menubar-toggle,.product-caption,.product-caption *,.product-card>div:not(.white-surface-fill){background-color:transparent!important}.site-menubar-toggle{background:none!important;background-image:none!important}.product-empty,.product-moss,.site-float-logo,.site-float-logo-mark{background-image:none!important}.site-nav a{color:#999999!important;-webkit-text-fill-color:#999999!important}.site-nav a[aria-current=page],.site-nav-link.is-active,.site-menu-row,.site-promo-ink{color:#111111!important;-webkit-text-fill-color:transparent!important;background-image:url("/ink-111.jpg")!important;-webkit-background-clip:text!important;background-clip:text!important}.site-splash-copy{color:#111111!important;-webkit-text-fill-color:#111111!important}.site-promo-visual{background-color:var(--brand-main)!important;background-image:var(--brand-main-image)!important;color:#ffffff!important}.home-new-in-cta-face{background-color:var(--brand-sub)!important;background-image:var(--brand-sub-image)!important;color:#ffffff!important}.site-promo-cta{padding:0!important;background-image:none!important}.site-promo-cta-face{background-color:var(--brand-sub)!important;background-image:var(--brand-sub-image)!important;color:#ffffff!important}.home-new-in-cta-label,.site-promo-white{color:#ffffff!important;-webkit-text-fill-color:transparent!important;background-image:url("/bg-white.jpg")!important;-webkit-background-clip:text!important;background-clip:text!important}}`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `@media (max-width:767.98px){.home-hero{height:100svh!important;min-height:100svh!important;max-height:100svh!important;padding-top:0!important;padding-bottom:0!important;justify-content:center;align-items:center}}@media (min-width:768px){:root{--hero-clip-w:230px;--hero-clip-h:130px}.home-hero{position:relative!important;display:block!important;width:100%!important;height:100lvh!important;min-height:100lvh!important;max-height:100lvh!important;overflow:hidden}.home-hero-clip{position:absolute!important;opacity:1;width:calc(var(--hero-clip-w)*var(--hero-scale,1))!important;height:calc(var(--hero-clip-h)*var(--hero-scale,1));max-width:none;right:auto;bottom:auto}.home-hero-clip-a{top:19%;left:12%}.home-hero-clip-b{top:28%;left:71%}.home-hero-clip-c{top:56%;left:39%}}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var q=location.search;var desktop=window.matchMedia("(min-width:768px)").matches;var hold=/intro=hold/.test(q);var skip=sessionStorage.getItem("taegye-intro")==="1"||/intro=skip|promo=hold/.test(q);var home=location.pathname==="/";if(desktop||!home||(skip&&!hold))document.documentElement.dataset.intro="done";else document.documentElement.dataset.intro="pending";var promoHold=/promo=hold/.test(q);var promoSkip=/promo=skip/.test(q);var until=+localStorage.getItem("taegye-promo-hide-until")||0;var closed=sessionStorage.getItem("taegye-promo-closed")==="1";var hidePromo=!${HOME_PROMO.enabled}||location.pathname!=="/"||promoSkip||(!promoHold&&(until>Date.now()||closed));document.documentElement.dataset.promo=hidePromo?"off":"on"}catch(e){document.documentElement.dataset.intro="pending";document.documentElement.dataset.promo="on"}`,
          }}
        />
      </head>
      <body className="min-h-full font-sans" style={{ ...rootPaint, color: "#111111" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=document.getElementById("taegye-page-white");if(!(c&&c.getContext)){c=document.createElement("canvas");c.id="taegye-page-white";c.className="canvas-white-fixed";c.setAttribute("aria-hidden","true")}function paint(){var d=Math.max(1,window.devicePixelRatio||1),vv=window.visualViewport,gutter=Math.max(0,(document.documentElement&&document.documentElement.offsetWidth||0)-window.innerWidth),w=Math.max(1,Math.round(vv&&vv.width||window.innerWidth),window.innerWidth)+gutter+24,h=Math.max(1,Math.round(vv&&vv.height||window.innerHeight),window.innerHeight)+24;c.width=Math.max(1,Math.round(w*d));c.height=Math.max(1,Math.round(h*d));c.style.cssText="position:fixed;top:0;left:0;width:100vw;height:100dvh;min-width:100%;min-height:100%;z-index:0;pointer-events:none;background:transparent;opacity:1;filter:none;mix-blend-mode:normal";var x=c.getContext("2d",{alpha:false});if(!x)return;x.globalAlpha=1;x.fillStyle="#FFFFFF";x.fillRect(0,0,c.width,c.height)}paint();window.addEventListener("resize",paint,{passive:true});if(window.visualViewport)window.visualViewport.addEventListener("resize",paint);function mount(){if(!document.body)return;if(c.parentNode!==document.body)document.body.insertBefore(c,document.body.firstChild)}if(document.body)mount();else document.addEventListener("DOMContentLoaded",mount)}catch(e){}})()`,
          }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
