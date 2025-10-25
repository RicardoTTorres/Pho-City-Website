import React, { useState } from "react";
import { defaultContent } from "@/content/content";
import { Button } from "@/components/ui/button";
import StarIcon from "@/assets/Star.svg";
import ImageIcon from "@/assets/ImageIcon.svg";

type LocalHero = typeof defaultContent.hero & {
  secondaryCtaText: string; 
};

export function HeroSectionEditor() {
  const [heroContent, setHeroContent] = useState<LocalHero>({
    ...defaultContent.hero,
    secondaryCtaText: "Call Now",
  });

  const handleChange = <K extends keyof LocalHero>(
    field: K,
    value: LocalHero[K]
  ) => {
    setHeroContent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="flex flex-col md:flex-row gap-6 w-full px-6 py-6">
      {/*left panel input*/}
      <div className="flex-1 bg-gradient-to-b from-white to-[#FFF7F7] border border-[#FEE2E1] rounded-2xl shadow-md p-6">
        {/* Header */}
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal mb-4">
          <div className="bg-brand-red rounded-lg p-1.5 flex items-center justify-center">
            <img
              src={StarIcon}
              alt="Star"
              className="w-3.5 h-3.5 brightness-0 invert"
            />
          </div>
          Hero Section Content
        </h2>

        {/*Form Fields*/}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Main Title
            </label>
            <input
              type="text"
              value={heroContent.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Subtitle
            </label>
            <textarea
              value={heroContent.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          {/*Call to Action Buttons Text*/}
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Primary Button Text
            </label>
            <input
              type="text"
              value={heroContent.ctaText}
              onChange={(e) => handleChange("ctaText", e.target.value)}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Secondary Button Text
            </label>
            <input
              type="text"
              value={heroContent.secondaryCtaText}
              onChange={(e) => handleChange("secondaryCtaText", e.target.value)}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
        </div>
      </div>
      {/*right panel, live preview*/}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-md p-4 border border-[#FEE2E1]">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal mb-3">
          <div className="bg-brand-cream rounded-lg p-1.5 flex items-center justify-center">
            <img
              src={ImageIcon}
              alt="Preview"
              className="w-4 h-4 text-brand-charcoal"
            />
          </div>
          Live Preview
        </h3>

        {/*Background preview*/}
        <div
          className="relative flex items-center justify-center min-h-[380px] rounded-2xl overflow-hidden shadow-inner"
          style={{
            backgroundImage: "url('/hero_pho_bowl.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-red/25 via-brand-red/15 to-brand-gold/25" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 mx-auto max-w-3xl px-4 pt-12 pb-16">
            <div className="rounded-3xl bg-gradient-to-br from-brand-red/5 to-brand-gold/5 backdrop-blur-xl ring-1 ring-white/30 p-8 shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
                {heroContent.title}
              </h1>
              <p className="mt-3 text-white/90 md:text-xl">
                {heroContent.subtitle}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center relative z-20">
                <Button
                  size="lg"
                  className="bg-brand-red hover:bg-brand-red-hover text-white shadow-lg shadow-black/20"
                >
                  {heroContent.ctaText}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="shadow-lg ring-1 ring-brand-red/20"
                >
                  {heroContent.secondaryCtaText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
