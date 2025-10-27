import React, { useState } from "react";
import { menuConfig } from "@/config/menu.config";

export default function Menu(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter logic
  const filteredCategories =
    selectedCategory === "All"
      ? menuConfig.categories
      : menuConfig.categories.filter(
          (cat) => cat.name === selectedCategory
        );

  return (
    <main className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-b from-brand-cream to-brand-gold/10 text-gray-800">

   

      {/* ---- Dropdown Filter ---- */}
      <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-gray-500 font-medium">Filter by:</span>
          <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none border border-brand-gold/60 rounded-xl px-6 py-3 pr-10 bg-white/90 text-brand-red font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition"
          >
            <option value="All">All Categories</option>
            {menuConfig.categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Down arrow icon */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-red pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* ---- Filtered Category Sections ---- */}
      {filteredCategories.map((category) => (
        <section
          key={category.name}
          className="mb-20 py-12 px-6 rounded-3xl bg-white/80 border border-brand-gold/30 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          {/* ---- Category Header ---- */}
          <div className="relative text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-red tracking-wide mb-3">
              {category.name}
            </h2>

            <div className="flex justify-center">
              <span className="w-20 h-1 bg-brand-gold rounded-full"></span>
            </div>


          
          </div>

          {/* ---- Menu Items ---- */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {item.name}
                  </h3>
                  <span className="text-lg font-semibold text-brand-gold">
                    {item.price}
                  </span>
                </div>
         
                {item.description && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                )}
                <div className="mt-4 w-10 h-[2px] bg-brand-red/40"></div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
