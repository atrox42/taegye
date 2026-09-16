import Link from "next/link";

import { FOOTER, legalLine, SITE_NAME } from "@/lib/site";

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "text-[11px] font-normal tracking-[0.06em] text-foreground/80 transition-opacity hover:opacity-50";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-transparent bg-background">
      <div className="grid grid-cols-3 items-start gap-x-6 gap-y-7 px-5 py-7 sm:grid-cols-4 sm:px-6 sm:py-8">
        <Link href="/" className="col-span-3 inline-flex items-center sm:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt={SITE_NAME} className="h-[18px] w-auto" />
        </Link>

        <div className="flex flex-col gap-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            Brand
          </p>
          {FOOTER.brand.map((item) => (
            <FooterLink key={item.href} {...item} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            Store
          </p>
          {FOOTER.store.map((item) => (
            <FooterLink key={item.href} {...item} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            Follow
          </p>
          {FOOTER.follow.map((item) => (
            <FooterLink key={item.href} {...item} />
          ))}
        </div>
      </div>

      <p className="px-5 pb-5 text-[10px] leading-relaxed tracking-[0.02em] text-foreground/45 sm:px-6">
        {legalLine()}
      </p>
    </footer>
  );
}
