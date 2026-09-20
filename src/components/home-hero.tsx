import { HERO_CLIPS, LOGO_SRC, SITE_NAME } from "@/lib/site";

export function HomeHero() {
  return (
    <section className="home-hero" aria-label="TAEGYE">
      {HERO_CLIPS.map((clip) => (
        <div key={clip.id} className={`home-hero-clip home-hero-clip-${clip.id}`}>
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
            poster={clip.poster}
          >
            <source src={clip.src} type="video/mp4" />
          </video>
          {clip.mark ? (
            // eslint-disable-next-line @next/next/no-img-element -- same footer lockup PNG, CSS-whitened
            <img
              src={LOGO_SRC}
              alt={SITE_NAME}
              width={30}
              className="home-hero-mark"
            />
          ) : null}
        </div>
      ))}
    </section>
  );
}
