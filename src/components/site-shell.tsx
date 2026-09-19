import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { forceWhiteStyle } from "@/lib/force-white";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div id="__next" className="site-shell flex min-h-svh flex-col" style={forceWhiteStyle}>
      <SiteHeader />
      <main className="site-main flex-1" style={forceWhiteStyle}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
