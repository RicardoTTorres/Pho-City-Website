import type { AboutPageContent } from "@/shared/content/content.types";

type AboutFoodSectionProps = {
  title: AboutPageContent["foodTitle"];
  body: AboutPageContent["foodBody"];
  image?: AboutPageContent["foodImage"];
};

export default function AboutFoodSection({
  title,
  body,
  image,
}: AboutFoodSectionProps) {
  const hasImage = Boolean(image);
  return (
    <section
      className="py-20 bg-brand-cream"
      aria-labelledby="about-food-heading"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={hasImage ? "" : "lg:col-span-2"}>
            <h2
              id="about-food-heading"
              className="text-2xl md:text-3xl font-semibold text-brand-red"
            >
              {title}
            </h2>
            <p className="mt-6 whitespace-pre-line text-brand-charcoal/70 leading-relaxed text-base md:text-lg">
              {body}
            </p>
          </div>

          {hasImage && image && (
            <div className="order-first lg:order-last">
              <img
                src={image}
                alt={title}
                className="w-full rounded-xl shadow-md object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
