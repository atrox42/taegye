import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="site-shell flex min-h-svh flex-col"
      style={{ backgroundColor: "#ffffff", color: "#111111" }}
    >
      <SiteHeader />
      <main className="site-main flex-1" style={{ backgroundColor: "#ffffff" }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
