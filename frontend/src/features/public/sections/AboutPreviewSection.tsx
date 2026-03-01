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
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about-preview"
      aria-labelledby="about-preview-heading"
      className="py-20 bg-brand-cream"
    >
      <div
        ref={sectionRef}
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: inView ? "80ms" : "0ms" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="about-preview-heading"
            className="text-3xl md:text-4xl font-semibold text-brand-charcoal"
          >
            {heading}
          </h2>

          <div className="mx-auto mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r from-amber-500 to-brand-red" />

          <p className="mt-6 text-base md:text-lg text-brand-charcoal/65 leading-relaxed">
            {body}
          </p>

          <div className="mt-8">
            <Button
              size="lg"
              asChild
              className="bg-brand-red hover:bg-brand-red-hover text-white shadow-lg shadow-black/20"
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
