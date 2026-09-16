import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/image-slot";
import { HOME_ABOUT_TEASER, STORE_URL } from "@/lib/site";

export default function HomePage() {
  return (
    <div>
      <section className="relative h-dvh w-full">
        <ImageSlot className="absolute inset-0" label="Hero image placeholder" />
      </section>

      <section className="relative">
        <h2 className="pointer-events-none absolute left-5 top-4 z-10 text-[11px] font-normal lowercase tracking-[0.14em] text-foreground sm:left-6">
          new
        </h2>
        <div className="grid grid-cols-2 gap-0">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="aspect-[4/5] min-h-[42vh] border-r border-b border-white last:border-r-0 even:border-r-0 sm:min-h-[50vh]"
            >
              <ImageSlot label={`New image slot ${i + 1}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 sm:py-28">
        <p className="max-w-sm whitespace-pre-line text-[13px] leading-7 tracking-[0.02em] text-foreground">
          {HOME_ABOUT_TEASER.en}
        </p>
        <p className="mt-6 max-w-sm whitespace-pre-line text-[13px] leading-7 tracking-[0.02em] text-foreground/70">
          {HOME_ABOUT_TEASER.kr}
        </p>
        <Link
          href="/about"
          className="mt-8 inline-block text-[11px] lowercase tracking-[0.14em] text-foreground transition-opacity hover:opacity-50"
        >
          about
        </Link>
      </section>

      <section className="px-5 pb-20 sm:px-6 sm:pb-28">
        <p className="text-[11px] lowercase tracking-[0.14em] text-foreground/50">store</p>
        <Button
          nativeButton={false}
          render={
            <a href={STORE_URL} target="_blank" rel="noopener noreferrer" />
          }
          variant="link"
          className="mt-4 h-auto rounded-none px-0 text-[13px] font-normal lowercase tracking-[0.08em] text-foreground"
        >
          naver smart store
        </Button>
      </section>
    </div>
  );
}
