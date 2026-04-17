// src/features/public/sections/AboutPreviewSection.tsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { useContent } from "@/app/providers/ContentContext";

export default function AboutPreviewSection() {
  const { content } = useContent();
  const about = content.about;

  const heading = about.previewHeading || "Our Story";
  const body =
    about.previewBody ||
    "For more than 10 years, Phở City has been a welcoming place for families and friends to gather over authentic Vietnamese cuisine. Rooted in tradition and built on family recipes, we are proud to serve Sacramento.";
  const buttonLabel = about.previewButtonLabel || "Learn More";

  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setInView(true); },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about-preview"
      aria-labelledby="about-preview-heading"
      className="py-16 sm:py-20 bg-brand-cream overflow-hidden"
    >
      <div
        ref={sectionRef}
        className={`mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 transition-all duration-700 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: inView ? "60ms" : "0ms" }}
      >
        {/* Section header — full width, anchors both columns below */}
        <div className="mb-8 sm:mb-10">
          <h2
            id="about-preview-heading"
            className="text-4xl sm:text-5xl font-bold text-brand-charcoal leading-tight"
          >
            {heading}
          </h2>
          <div className="mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-brand-gold to-brand-red" />
        </div>

        {/* Body + CTA — quote left, button right, visually tied under the heading */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
          {/* Quote block */}
          <div
            className={`relative flex-1 min-w-0 transition-all duration-700 delay-100 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute -top-6 -left-2 text-[7rem] leading-none font-serif text-brand-gold/20 select-none pointer-events-none"
            >
              "
            </span>
            <blockquote className="relative pl-6 border-l-4 border-brand-gold">
              <p className="text-lg sm:text-xl text-brand-charcoal/70 italic leading-relaxed font-serif">
                {body}
              </p>
            </blockquote>
          </div>

          {/* CTA — anchored to bottom of the quote block */}
          <div
            className={`shrink-0 transition-all duration-700 delay-200 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              size="lg"
              asChild
              className="bg-brand-red hover:bg-brand-red/90 text-white shadow-lg shadow-black/20"
            >
              <Link to="/about" aria-label="Learn more about our story">
                {buttonLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
