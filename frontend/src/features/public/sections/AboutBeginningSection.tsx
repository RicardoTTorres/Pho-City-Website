import type { AboutPageContent } from "@/shared/content/content.types";

type AboutBeginningSectionProps = {
  title: AboutPageContent["beginningTitle"];
  body: AboutPageContent["beginningBody"];
};

export default function AboutBeginningSection({
  title,
  body,
}: AboutBeginningSectionProps) {
  return (
    <section
      className="py-16 bg-white"
      aria-labelledby="about-beginning-heading"
    >
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <h2
          id="about-beginning-heading"
          className="text-2xl md:text-3xl font-semibold text-brand-red"
        >
          {title}
        </h2>
        <p className="mt-6 whitespace-pre-line text-brand-charcoal/70 leading-relaxed text-base md:text-lg">
          {body}
        </p>
      </div>
    </section>
  );
}
