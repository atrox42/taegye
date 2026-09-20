import { forceWhiteStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";
import { HERO_CLIP, HERO_CLIPS } from "@/lib/site";

export function HomeHero() {
  return (
    <section className="home-hero" aria-label="TAEGYE" style={forceWhiteStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS paint; raster stays white */}
      <img
        src={WHITE_BITMAP_SRC}
        alt=""
        aria-hidden
        className="home-hero-bitmap"
      />
      {HERO_CLIPS.map((clip) => (
        <div key={clip.id} className={`home-hero-clip home-hero-clip-${clip.id}`}>
          <video
            className="home-hero-media"
            width={HERO_CLIP.width}
            height={HERO_CLIP.height}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            preload="auto"
            poster={clip.poster}
          >
            <source src={clip.src} type="video/mp4" />
          </video>
        </div>
      ))}
    </section>
  );
}
