// src/features/public/sections/MenuPreview.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFeaturedItems, type FeaturedItem } from "@/shared/api/menu";
import { parseBilingualName } from "@/utils/menuHelper";

function preloadImages(items: FeaturedItem[]) {
  items.forEach((item) => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
}

export default function MenuPreview() {
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedItems()
      .then((items) => {
        preloadImages(items);
        setFeatured(items);
      })
      .catch((err) => console.error("Failed to load featured items:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && featured.length === 0) return null;

  return (
    <section id="menu" className="py-16 sm:py-20 lg:py-24 bg-brand-gold/5">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900">
            Featured Dishes
          </h2>
          <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-brand-gold to-brand-red" />
        </div>

        {/* Grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {/* Skeletons */}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <li key={`skeleton-${i}`}>
                <div className="animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                  <div className="aspect-[4/3] w-full bg-neutral-200" />
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="h-5 bg-neutral-200 rounded w-3/4" />
                    <div className="h-4 bg-neutral-100 rounded w-1/2" />
                    <div className="h-3 bg-neutral-100 rounded w-full mt-4" />
                    <div className="h-3 bg-neutral-100 rounded w-5/6" />
                  </div>
                </div>
              </li>
            ))}

          {/* Cards */}
          {featured.map((dish) => {
            const { english, vietnamese } = parseBilingualName(dish.name);

            return (
              <li key={dish.id} className="flex">
                <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 shrink-0">
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={english}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          aria-hidden="true"
                          className="h-10 w-10 text-neutral-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="M21 17l-5-5L5 23" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="line-clamp-2 text-xl sm:text-2xl font-bold leading-tight text-slate-950">
                      {english}
                    </h3>
                    {vietnamese ? (
                      <p className="mt-1.5 text-sm sm:text-base font-medium italic text-rose-600 line-clamp-1">
                        {vietnamese}
                      </p>
                    ) : null}
                    {dish.description ? (
                      <p className="mt-4 line-clamp-3 text-sm sm:text-base leading-7 text-slate-600">
                        {dish.description}
                      </p>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {/* Section CTA — centered below grid */}
        {!loading && (
          <div className="mt-10 sm:mt-12 flex justify-center">
            <a
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
            >
              View Full Menu
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        )}
      </motion.div>
    </section>
  );
}
