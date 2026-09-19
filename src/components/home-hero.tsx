import { HERO_VIDEO_POSTER, HERO_VIDEO_SRC } from "@/lib/site";

export function HomeHero() {
  return (
    <section className="home-hero" aria-label="TAEGYE">
      <video
        className="home-hero-media"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={HERO_VIDEO_POSTER}
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>
    </section>
  );
}
