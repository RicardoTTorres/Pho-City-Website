// src/features/public/sections/MenuPreview.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFeaturedItems, type FeaturedItem } from "@/shared/api/menu";
import { Card } from "@/shared/components/ui/card";
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
    <section id="menu" className="py-20 bg-brand-gold/5 ">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="mx-auto bg-brand-gold/5 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/*Header row*/}
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900"></h2>
          <a
            href="/menu"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition"
          >
            Browse full menu
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

        {/*Grid of dishes*/}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <li key={`skeleton-${i}`}>
                <div className="rounded-xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                  <div className="w-full aspect-[4/3] bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </li>
            ))}
          {featured.map((dish) => {
            const { english, vietnamese } = parseBilingualName(dish.name);

            return (
              <li key={dish.id}>
                <Card className="h-full flex flex-col overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out border border-gray-100 font-sans">
                  {/*Image*/}
                  <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden flex items-center justify-center">
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="eager"
                        decoding="async"
                        width={400}
                        height={300}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        aria-hidden="true"
                        className="h-8 w-8 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="M21 17l-5-5L5 23" />
                      </svg>
                    )}
                  </div>

                  {/*Text*/}
                  <div className="pt-4 pb-5 px-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-l font-bold text-red-900 leading-snug break-words line-clamp-3">
                        {english}
                      </h3>
                      {vietnamese ? (
                        <>
                          <p className="mt-1 text-sm font-medium text-red-700/70 leading-snug break-words line-clamp-1">
                            {vietnamese}
                          </p>
                          <div className="mt-1.5 h-0.5 w-10 bg-gradient-to-r from-amber-500 to-red-700 rounded-full" />
                        </>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      {dish.description}
                    </p>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
