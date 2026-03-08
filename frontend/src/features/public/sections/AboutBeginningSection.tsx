import type { AboutPageContent } from "@/shared/content/content.types";

type AboutBeginningSectionProps = {
  title: AboutPageContent["beginningTitle"];
  body: AboutPageContent["beginningBody"];
  image?: AboutPageContent["beginningImage"];
};

export default function AboutBeginningSection({
  title,
  body,
  image,
}: AboutBeginningSectionProps) {
  const hasImage = Boolean(image);

  return (
    <section
      className="py-16 bg-brand-gold/15"
      aria-labelledby="about-beginning-heading"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {hasImage ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image LEFT */}
            <div>
              <img
                src={image!}
                alt={title}
                className="w-full rounded-xl shadow-md object-cover"
              />
            </div>
            {/* Text RIGHT */}
            <div>
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
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
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
        )}
      </div>
    </section>
  );
}
