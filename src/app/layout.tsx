import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_KR } from "next/font/google";

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
      className={`light ${geistSans.variable} ${notoSansKr.variable} h-full antialiased`}
      style={rootPaint}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <meta name="theme-color" content="#ffffff" />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root,html,body,main,.site-shell,.site-main,.site-footer,.site-page,.site-header,.site-nav,.site-white-layer,.home-hero,.new-page,.new-grid,.new-grid-item,.pdp,.pdp-visual,.pdp-stage,.pdp-copy,.site-footer-inner{color-scheme:light dark;background-color:#ffffff!important;background-image:${FORCE_WHITE_IMAGE}!important;background-size:100% 100%!important;color:#111111!important}.site-nav a{color:#999999!important;-webkit-text-fill-color:#999999!important}.site-nav a[aria-current=page],.site-nav-link.is-active{color:#111111!important;-webkit-text-fill-color:transparent!important;background-image:url("/ink-111.jpg")!important;background-size:8px 8px;-webkit-background-clip:text!important;background-clip:text!important}@media (prefers-color-scheme:dark){:root,html,body,main,.site-shell,.site-main,.site-footer,.site-page,.site-header,.site-nav,.home-hero,.new-page,.new-grid,.pdp,.pdp-copy{background-color:#ffffff!important;background-image:${FORCE_WHITE_IMAGE}!important;color:#111111!important}.site-nav a{color:#999999!important;-webkit-text-fill-color:#999999!important}.site-nav a[aria-current=page],.site-nav-link.is-active{color:#111111!important;-webkit-text-fill-color:transparent!important;background-image:url("/ink-111.jpg")!important;-webkit-background-clip:text!important;background-clip:text!important}}`,
          }}
        />
      </head>
      <body className="min-h-full font-sans" style={{ ...rootPaint, color: "#111111" }}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
