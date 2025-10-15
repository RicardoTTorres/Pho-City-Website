import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import type { ReactElement } from "react";

export function Hero(): ReactElement {
  const { content } = useContent();
  const hero = content.hero;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      className="
        bg-gradient-to-r from-red-600 to-red-700 text-white
        pt-16 md:pt-20            
        scroll-mt-16 md:scroll-mt-20
        min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]
        flex items-center
        pb-12 md:pb-20
      "
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {hero.title}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-red-100 max-w-prose">
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100"
                onClick={() => scrollToSection("menu")}
                aria-label="Skip to menu section"
              >
                {hero.ctaText}
              </Button>
              <Button size="lg" asChild className="bg-white text-red-600">
                <a href="tel:+19167542143" aria-label="Call to place an order">Call Now</a>
              </Button>
            </div>
          </div>

          {/* image holder */}
          <div className="relative">
            <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 p-4 md:p-6 backdrop-blur">
              {/* image holder */}
              <div className="aspect-square rounded-xl bg-white overflow-hidden">
                {/* <img src="/hero-bowl.png" alt="Signature pho bowl" className="w-full h-full object-cover" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
