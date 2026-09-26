import { FloatLogo } from "@/components/float-logo";
import { HomePromo } from "@/components/home-promo";
import { IntroSplash } from "@/components/intro-splash";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhiteBitmapLayer } from "@/components/white-bitmap-layer";
import { forceWhiteStyle } from "@/lib/force-white";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell relative z-0 flex min-h-svh flex-col" style={forceWhiteStyle}>
      <WhiteBitmapLayer />
      <div className="relative z-[1] flex min-h-svh flex-1 flex-col">
        <SiteHeader />
        <main className="site-main flex-1" style={forceWhiteStyle}>
          {children}
          <FloatLogo />
        </main>
        <SiteFooter />
      </div>
      <IntroSplash />
      <HomePromo />
    </div>
  );
}
