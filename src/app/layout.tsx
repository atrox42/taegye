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
    icon: "/logo-mark.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: [
    { color: "#ffffff" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

const rootPaint = {
  colorScheme: "only light",
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
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="theme-color" content="#ffffff" />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root,html,body,#__next,main,.site-shell,.site-main,.site-footer,.site-page,.site-header,.site-nav,.site-white-layer,.home-hero,.new-page,.new-grid,.new-grid-item{color-scheme:only light!important;background-color:#ffffff!important;background-image:${FORCE_WHITE_IMAGE}!important;background-size:100% 100%!important;forced-color-adjust:none}`,
          }}
        />
      </head>
      <body className="min-h-full font-sans" style={{ ...rootPaint, color: "#111111" }}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
