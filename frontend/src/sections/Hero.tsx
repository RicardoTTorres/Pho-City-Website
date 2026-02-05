import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { getHero } from "@/api/hero";

type HeroState = {
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string | null;
};

const FALLBACK_HERO: HeroState = {
  title: "Authentic Vietnamese Cuisine",
  subtitle: "Experience authentic Vietnamese flavors in the heart of Sacramento.",
  ctaText: "View Our Menu",
  imageUrl: "/hero_pho_bowl.jpg",
};

export function Hero(): ReactElement {
  const [hero, setHero] = useState<HeroState>(FALLBACK_HERO);

  useEffect(() => {
    getHero()
      .then((h) => {
        setHero({
          title: h.title || FALLBACK_HERO.title,
          subtitle: h.subtitle || FALLBACK_HERO.subtitle,
          ctaText: h.ctaText || FALLBACK_HERO.ctaText,
          imageUrl: h.imageUrl ?? FALLBACK_HERO.imageUrl,
        });
      })
      .catch((err) => {
        console.error("Hero API failed, using fallback:", err);
      });
  }, []);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex items-center justify-center min-h-[70vh] text-white"
      style={{
        backgroundImage: `url('${hero.imageUrl || "/hero_pho_bowl.jpg"}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red/25 via-brand-red/15 to-brand-gold/25" />

      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-24 pb-28">
        <div className="rounded-3xl bg-gradient-to-br from-brand-red/5 to-brand-gold/5 backdrop-blur-xl ring-1 ring-white/30 p-8 shadow-2xl">



          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            {hero.title}
          </h1>
          <p className="mt-3 text-white/90 md:text-xl">{hero.subtitle}</p>
    
        
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center relative z-20">
   
            <Button
              size="lg"
              asChild
              className="bg-brand-red hover:bg-brand-red-hover text-white shadow-lg shadow-black/20"
            >
              <Link to="/menu" aria-label="Go to full menu">
                {hero.ctaText}
              </Link>
            </Button>

    
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="shadow-lg ring-1 ring-brand-red/20"
            >
              <a href="tel:+19167542143">Call Now</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
