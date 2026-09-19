import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_KR } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
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
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`light ${geistSans.variable} ${notoSansKr.variable} h-full bg-white antialiased`}
      style={{ colorScheme: "only light", backgroundColor: "#ffffff" }}
    >
      <body className="min-h-full bg-white font-sans text-neutral-900">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
