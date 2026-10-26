import { FloatLogo } from "@/components/float-logo";
import { GridDissolveProvider } from "@/components/grid-dissolve";
import { HomePromo } from "@/components/home-promo";
import { IntroSplashController } from "@/components/intro-splash";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CanvasWhitePlate } from "@/components/canvas-white-plate";
import { ScrollManager } from "@/components/scroll-manager";
import { SplashCopy } from "@/components/splash-copy";
import { WhiteBitmapLayer } from "@/components/white-bitmap-layer";
import { forceWhiteStyle } from "@/lib/force-white";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <GridDissolveProvider>
    <ScrollManager />
    <div className="site-shell relative z-[1] flex min-h-lvh flex-col" style={forceWhiteStyle}>
      <WhiteBitmapLayer />
      <CanvasWhitePlate />
      <div className="site-column relative z-[1] flex min-h-lvh flex-1 flex-col">
        <CanvasWhitePlate />
        <SiteHeader />
        <main className="site-main relative flex-1">
          <CanvasWhitePlate />
          {children}
        </main>
        <SiteFooter />
      </div>
      <FloatLogo />
      <div className="site-splash" role="presentation" aria-hidden>
        <CanvasWhitePlate />
        <SplashCopy />
      </div>
      <IntroSplashController />
      <HomePromo />
    </div>
    </GridDissolveProvider>
  );
}
