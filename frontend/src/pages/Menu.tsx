import React from "react";
import { menuConfig } from "@/config/menu.config";

export default function Menu(): JSX.Element {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16 text-gray-800">
      <h1 className="text-4xl font-extrabold text-center text-red-700 mb-12">
        Menu
      </h1>

      {menuConfig.categories.map((category) => (
        <section key={category.name} className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-red-700 border-b-2 border-red-500 pb-2 mb-6">
            {category.name}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <div
                key={item.code}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-red-600 font-semibold">{item.code}</span>
                  <span className="text-lg font-semibold">{item.price}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
