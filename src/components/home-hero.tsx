import { HERO_VIDEO_POSTER, HERO_VIDEO_SRC, LOGO_SRC, SITE_NAME } from "@/lib/site";

export function HomeHero() {
  return (
    <section className="home-hero" aria-label="TAEGYE">
      <div className="home-hero-stage">
        <video
          className="home-hero-media"
          width={192}
          height={108}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          disablePictureInPicture
          preload="auto"
          poster={HERO_VIDEO_POSTER}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        {/* eslint-disable-next-line @next/next/no-img-element -- same footer lockup PNG, CSS-whitened */}
        <img
          src={LOGO_SRC}
          alt={SITE_NAME}
          width={30}
          className="home-hero-mark"
        />
      </div>
    </section>
  );
}
