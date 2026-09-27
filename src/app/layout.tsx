import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_KR, Roboto_Condensed } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
import { FORCE_WHITE_IMAGE } from "@/lib/force-white";
import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_KR } from "@/lib/site";

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
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { color: "#ffffff" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

const rootPaint = {
  colorScheme: "light dark",
  backgroundColor: "#ffffff",
  backgroundImage: FORCE_WHITE_IMAGE,
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
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <link rel="preload" href="/bg-white.jpg" as="image" />
        <link rel="preload" href="/ink-111.jpg" as="image" />
        <style
          dangerouslySetInnerHTML={{
            __html: `@media (min-width:768px){.home-new-in,.site-float-logo{display:none!important}}details,summary,select{-webkit-appearance:none!important;appearance:none!important;background-image:none!important}details,summary{list-style:none!important}summary::-webkit-details-marker,summary::marker,summary::before,summary::after{display:none!important;content:none!important}:root,html,body,main,.site-shell,.site-main,.site-footer,.site-page,.site-header,.site-nav,.site-menubar,.site-menu,.site-splash,.site-promo,.site-white-layer,.home-hero,.home-new-in,.home-new-in-visual,.new-page,.new-grid,.new-grid-item,.product-card,.pdp,.pdp-copy,.site-footer-inner{color-scheme:light dark;background-color:#ffffff!important;background-image:${FORCE_WHITE_IMAGE}!important;background-size:100% 100%!important;color:#111111!important}.product-empty,.product-moss,.site-float-logo,.site-float-logo-mark{background-color:transparent!important;background-image:none!important}.site-splash{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;opacity:1;background-color:#ffffff!important;background-image:${FORCE_WHITE_IMAGE}!important;background-size:100% 100%!important}.site-splash-bitmap{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1}html[data-intro=done] .site-splash{display:none}.site-nav a{color:#999999!important;-webkit-text-fill-color:#999999!important}.site-nav a[aria-current=page],.site-nav-link.is-active,.site-menu-row,.site-promo-ink{color:#111111!important;-webkit-text-fill-color:transparent!important;background-image:url("/ink-111.jpg")!important;background-size:8px 8px;-webkit-background-clip:text!important;background-clip:text!important}.site-splash-copy{color:#111111!important;-webkit-text-fill-color:#111111!important}.site-promo-visual{background-color:#574667!important;background-image:url("/purple-574667.jpg")!important;background-size:100% 100%!important;color:#ffffff!important}.home-new-in-cta-face{background-color:#6F5C82!important;background-image:url("/purple-6F5C82.jpg")!important;background-size:100% 100%!important;color:#ffffff!important}.home-new-in-cta{padding:0!important;border:0!important;background-image:none!important}.home-new-in-cta-label,.site-promo-white{color:#ffffff!important;-webkit-text-fill-color:transparent!important;background-image:url("/bg-white.jpg")!important;background-size:8px 8px;-webkit-background-clip:text!important;background-clip:text!important}.site-promo-cta{padding:0!important;border:0!important;background-image:none!important}.site-promo-cta-face{background-color:#463854!important;background-image:url("/purple-463854.jpg")!important;background-size:100% 100%!important;color:#ffffff!important;border:0!important}@media (min-width:768px){.site-splash{display:none!important}}@media (prefers-color-scheme:dark){:root,html,body,main,.site-shell,.site-main,.site-footer,.site-page,.site-header,.site-nav,.site-menubar,.site-menu,.site-splash,.site-promo,.home-hero,.home-new-in,.new-page,.new-grid,.product-card,.pdp,.pdp-copy{background-color:#ffffff!important;background-image:${FORCE_WHITE_IMAGE}!important;color:#111111!important}.product-empty,.product-moss,.site-float-logo,.site-float-logo-mark{background-color:transparent!important;background-image:none!important}.site-nav a{color:#999999!important;-webkit-text-fill-color:#999999!important}.site-nav a[aria-current=page],.site-nav-link.is-active,.site-menu-row,.site-promo-ink{color:#111111!important;-webkit-text-fill-color:transparent!important;background-image:url("/ink-111.jpg")!important;-webkit-background-clip:text!important;background-clip:text!important}.site-splash-copy{color:#111111!important;-webkit-text-fill-color:#111111!important}.site-promo-visual{background-color:#574667!important;background-image:url("/purple-574667.jpg")!important;color:#ffffff!important}.home-new-in-cta-face{background-color:#6F5C82!important;background-image:url("/purple-6F5C82.jpg")!important;color:#ffffff!important}.site-promo-cta{padding:0!important;background-image:none!important}.site-promo-cta-face{background-color:#463854!important;background-image:url("/purple-463854.jpg")!important;color:#ffffff!important}.home-new-in-cta-label,.site-promo-white{color:#ffffff!important;-webkit-text-fill-color:transparent!important;background-image:url("/bg-white.jpg")!important;-webkit-background-clip:text!important;background-clip:text!important}}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var q=location.search;var desktop=window.matchMedia("(min-width:768px)").matches;var hold=/intro=hold/.test(q);var skip=sessionStorage.getItem("taegye-intro")==="1"||/intro=skip|promo=hold/.test(q);if(desktop||(skip&&!hold))document.documentElement.dataset.intro="done";else document.documentElement.dataset.intro="pending"}catch(e){document.documentElement.dataset.intro="pending"}`,
          }}
        />
      </head>
      <body className="min-h-full font-sans" style={{ ...rootPaint, color: "#111111" }}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
