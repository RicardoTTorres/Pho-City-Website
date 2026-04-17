import { useEffect, useRef, useState } from "react";
import type { AboutPageContent } from "@/shared/content/content.types";

type AboutBeginningSectionProps = {
  title: AboutPageContent["beginningTitle"];
  body: AboutPageContent["beginningBody"];
  image?: AboutPageContent["beginningImage"];
  caption?: string | undefined;
};

export default function AboutBeginningSection({
  title,
  body,
  image,
  caption,
}: AboutBeginningSectionProps) {
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
      className="py-16 bg-brand-gold/10"
      aria-labelledby="about-beginning-heading"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {hasImage ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image LEFT */}
            <div
              className={`transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            >
              <figure>
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                  <img
                    src={image!}
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
            {/* Text RIGHT */}
            <div
              className={`transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              <h2
                id="about-beginning-heading"
                className="text-2xl md:text-3xl font-semibold text-brand-red"
              >
                {title}
              </h2>
              <div className="mt-3 mb-6 h-1 w-12 rounded-full bg-gradient-to-r from-brand-gold to-brand-red" />
              <p className="whitespace-pre-line text-brand-charcoal/70 leading-relaxed text-base md:text-lg">
                {body}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`max-w-3xl mx-auto text-center transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h2
              id="about-beginning-heading"
              className="text-2xl md:text-3xl font-semibold text-brand-red"
            >
              {title}
            </h2>
            <div className="mt-3 mb-6 h-1 w-12 rounded-full bg-gradient-to-r from-brand-gold to-brand-red mx-auto" />
            <p className="whitespace-pre-line text-brand-charcoal/70 leading-relaxed text-base md:text-lg">
              {body}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
