import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export type Dish = {
  id: string;
  category: string;    //"Pho", "Appetizers", "Rice Dishes"
  name: string;
  blurb: string;
  price?: string;      
  href: string;
};

type Props = {
  items: Dish[];                 
  maxPerCategory?: number;      
};

export default function MenuPreview({ items, maxPerCategory }: Props): JSX.Element {
  const groups = React.useMemo(() => {
    const m = new Map<string, Dish[]>();
    for (const d of items) {
      if (!m.has(d.category)) m.set(d.category, []);
      m.get(d.category)!.push(d);
    }
    if (maxPerCategory) {
      for (const [k, v] of m) m.set(k, v.slice(0, maxPerCategory));
    }
    return Array.from(m.entries());
  }, [items, maxPerCategory]);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {groups.map(([category, dishes]) => (
          <div key={category} className="space-y-4">
            <h2
              className="text-center font-serif tracking-wide text-xl md:text-2xl font-bold"
            >
              {category}
            </h2>

            {/* smaller gaps */}
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dishes.map((d) => (
                <li key={d.id}>
                  <a
                    href={d.href}
                    className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    aria-label={`View details`}
                  >
                    <Card className="overflow-hidden rounded-lg bg-white/90">
                      {/* IMAGE AREA — slimmer height */}
                      <div className="relative aspect-[16/9] bg-neutral-100 flex items-center justify-center">
                        <span className="absolute top-2 left-2 text-[11px] font-semibold text-white bg-red-600 px-2 py-0.5 rounded-full">
                          {category}
                        </span>
                        <svg
                          aria-hidden="true"
                          className="h-9 w-9 text-neutral-400"
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

                      <div className="border-t" />

                      <CardHeader className="pt-2 pb-4 px-6">
                        <div className="flex justify-between items-start mb-1">
                          <CardTitle className="text-xl text-gray-900">
                            {d.name}
                          </CardTitle>
                          {d.price && (
                            <span className="shrink-0 text-red-700 font-semibold text-sm">
                              {d.price}
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-gray-600 text-left">
                          {d.blurb}
                        </CardDescription>
                      </CardHeader>

                    </Card>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}