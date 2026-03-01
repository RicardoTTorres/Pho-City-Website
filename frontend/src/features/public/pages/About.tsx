// src/features/public/pages/About.tsx
import { useContent } from "@/app/providers/ContentContext";
import AboutBeginningSection from "@/features/public/sections/AboutBeginningSection";
import AboutFoodSection from "@/features/public/sections/AboutFoodSection";
import AboutCommitmentSection from "@/features/public/sections/AboutCommitmentSection";

export default function About() {
  const { content } = useContent();
  const about = content.about;

  return (
    <div className="w-full min-h-screen bg-brand-cream/30">
      <section className="bg-brand-cream border-b border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className={!about.heroImage ? "md:col-span-2 max-w-2xl" : ""}>
              <h1 className="text-4xl md:text-5xl font-bold text-brand-red leading-tight mb-4">
                {about.heroTitle}
              </h1>
              <div className="w-16 h-[3px] bg-brand-gold mb-6 rounded-full" />
              <p className="whitespace-pre-line text-brand-charcoal/80 text-lg leading-relaxed">
                {about.heroIntro}
              </p>
            </div>

            {about.heroImage && (
              <div className="order-first md:order-last">
                <img
                  src={about.heroImage}
                  alt="About Pho City"
                  className="w-full rounded-2xl shadow-md object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <AboutBeginningSection
        title={about.beginningTitle}
        body={about.beginningBody}
      />

      <AboutFoodSection
        title={about.foodTitle}
        body={about.foodBody}
        image={about.foodImage}
      />

      <AboutCommitmentSection
        title={about.commitmentTitle}
        body={about.commitmentBody}
      />
    </div>
  );
}
