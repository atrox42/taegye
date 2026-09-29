import { FloatLogo } from "@/components/float-logo";
import { GridDissolveProvider } from "@/components/grid-dissolve";
import { HomePromo } from "@/components/home-promo";
import { IntroSplashController } from "@/components/intro-splash";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhiteBitmapLayer } from "@/components/white-bitmap-layer";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <GridDissolveProvider>
    <div className="site-shell relative z-0 flex min-h-lvh flex-col" style={forceWhiteStyle}>
      <WhiteBitmapLayer />
      <div className="site-column relative z-[1] flex min-h-lvh flex-1 flex-col" style={forceWhiteStyle}>
        <WhiteSurfaceFill />
        <SiteHeader />
        <main className="site-main relative flex-1" style={forceWhiteStyle}>
          <WhiteSurfaceFill />
          {children}
        </main>
        <FloatLogo />
        <SiteFooter />
      </div>
      <div className="site-splash" role="presentation" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- first-paint white raster */}
        <img src={WHITE_BITMAP_SRC} alt="" className="site-splash-bitmap" />
        <p className="site-splash-copy" style={forceInkStyle}>
          <span>ALL</span>
          <span>TAEGYE-RIUM</span>
        </p>
      </div>
      <IntroSplashController />
      <HomePromo />
    </div>
    </GridDissolveProvider>
  );
}
