import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { menuConfig } from "@/config/menu.config";

export default function MenuPreview(): JSX.Element {
  const phoCategory = menuConfig.categories.find((cat) =>
    cat.name.includes("Pho Noodle Soup")
  );
  const featured = phoCategory ? phoCategory.items.slice(0, 4) : [];

  return (
    <section id="menu" className="py-20 bg-[#fef8f4]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/*Header row*/}
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Signature Dishes
          </h2>
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
          {featured.map((dish) => (
            <li key={dish.code}>
              <Card className="h-full flex flex-col overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                {/*Image*/}
                <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="object-cover w-full h-full"
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
                <CardHeader className="pt-4 pb-5 px-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 text-left leading-tight">
                      {dish.name}
                    </CardTitle>
                   
                  </div>
                  <CardDescription className="text-gray-600 text-left text-sm">
                    {dish.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
