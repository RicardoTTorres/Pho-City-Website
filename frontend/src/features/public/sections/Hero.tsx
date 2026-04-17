// src/features/public/sections/Hero.tsx
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getHero } from "@/shared/api/hero";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Ph%C3%B4+City+Vietnamese+Cuisine+6175+Stockton+Blvd+%23200+Sacramento+CA+95824&travelmode=driving";

type HeroState = {
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string | null;
};

const FALLBACK_HERO: HeroState = {
  title: "Authentic Vietnamese Cuisine",
  subtitle:
    "Experience Authentic Vietnamese flavors in the heat of Sacramento. From traditional pho to modern Vietnamese fusion, every dish is crafted with passion and tradition.",
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
      {/* Gradient overlay — stronger at bottom-left where text sits */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-black/10" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 sm:px-10 pt-24 pb-28">
        <div className="max-w-2xl">
          <h1
            id="hero-heading"
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-md"
          >
            {hero.title}
          </h1>

          <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-brand-gold to-brand-red" />

          <p className="mt-5 text-white/85 text-lg md:text-xl leading-relaxed max-w-xl drop-shadow">
            {hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              asChild
              className="bg-brand-red hover:bg-brand-red/90 text-white shadow-lg shadow-black/30"
            >
              <Link to="/menu" aria-label="Go to full menu">
                {hero.ctaText}
              </Link>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              asChild
              className="shadow-lg ring-1 ring-white/20 inline-flex items-center gap-2"
            >
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get directions to Pho City"
              >
                <MapPin className="h-4 w-4" />
                Directions
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
