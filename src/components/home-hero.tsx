import { HERO_VIDEO_POSTER, HERO_VIDEO_SRC, LOGO_MARK_WHITE_SRC } from "@/lib/site";

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
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG mark, no optimization needed */}
        <img
          src={LOGO_MARK_WHITE_SRC}
          alt=""
          aria-hidden
          width={30}
          height={30}
          className="home-hero-mark"
        />
      </div>
    </section>
  );
}
