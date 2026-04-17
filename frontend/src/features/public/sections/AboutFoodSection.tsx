import { useEffect, useRef, useState } from "react";
import type { AboutPageContent } from "@/shared/content/content.types";

type Highlight = { label: string };

type AboutFoodSectionProps = {
  title: AboutPageContent["foodTitle"];
  body: AboutPageContent["foodBody"];
  image?: AboutPageContent["foodImage"];
  caption?: string | undefined;
  highlights?: Highlight[] | undefined;
};

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { label: "Slow-simmered broth" },
  { label: "Fresh herbs daily" },
  { label: "Family recipes" },
];

export default function AboutFoodSection({
  title,
  body,
  image,
  caption,
  highlights = DEFAULT_HIGHLIGHTS,
}: AboutFoodSectionProps) {
  const hasImage = Boolean(image);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setInView(true); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 bg-brand-cream"
      aria-labelledby="about-food-heading"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text LEFT */}
          <div
            className={`transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"} ${!hasImage ? "lg:col-span-2" : ""}`}
          >
            <h2
              id="about-food-heading"
              className="text-2xl md:text-3xl font-semibold text-brand-red"
            >
              {title}
            </h2>
            <div className="mt-3 mb-5 h-1 w-12 rounded-full bg-gradient-to-r from-brand-gold to-brand-red" />

            {/* Highlight points */}
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {highlights.map((h) => (
                  <span
                    key={h.label}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-charcoal/80 bg-brand-gold/15 rounded-full px-3 py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                    {h.label}
                  </span>
                ))}
              </div>
            )}

            <p className="whitespace-pre-line text-brand-charcoal/70 leading-relaxed text-base md:text-lg">
              {body}
            </p>
          </div>

          {/* Image RIGHT */}
          {hasImage && image && (
            <div
              className={`order-first lg:order-last transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              <figure>
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {caption && (
                  <figcaption className="mt-2 text-xs text-center text-brand-charcoal/40 italic">
                    {caption}
                  </figcaption>
                )}
              </figure>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
