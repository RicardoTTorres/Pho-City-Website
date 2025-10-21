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
  className="relative text-white flex items-center justify-center text-center pt-20 pb-24 min-h-[70vh] border-b border-[#FFF7ED]
"

      aria-labelledby="hero-heading"
      style={{
        backgroundImage: "url('/pho-bowl.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
   
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center">
          
          <h1 id="hero-heading" className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-xl">
            {hero.title}
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-200 max-w-prose">


            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
              onClick={() => scrollToSection("menu")}
              aria-label="Skip to menu section"
            >
              {hero.ctaText}
            </Button>
            <Button size="lg" asChild className="bg-white text-red-600 hover:bg-gray-100 shadow-lg">
              <a href="tel:+19167542143" aria-label="Call to place an order">Call Now</a>
            </Button>
            </div>
          </div>
        </div>
      
    </section>
  );
}
