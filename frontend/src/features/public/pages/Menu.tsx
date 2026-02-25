// src/features/public/pages/Menu.tsx

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useContent } from "@/app/providers/ContentContext";
import { MenuSidebar } from "@/features/public/components/MenuSidebar";
import { MenuItem as MenuItemCard } from "@/shared/components/ui/MenuItem";

export default function Menu() {
  const { content } = useContent();

  const allCategories = useMemo(
    () => content.menuPublic?.categories ?? [],
    [content.menuPublic],
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Set initial active category
  useEffect(() => {
    if (allCategories.length > 0 && !activeCategory) {
      const first = allCategories[0];
      if (first?.name) setActiveCategory(first.name);
    }
  }, [allCategories, activeCategory]);

  const handleCategoryClick = useCallback((categoryName: string) => {
    setActiveCategory(categoryName);

    const sectionId = categoryName.toLowerCase().replace(/\s+/g, "-");
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Close mobile menu on Escape + lock body scroll while open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    // focus close button for keyboard users
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  // After selecting a category on mobile, close the overlay
  const handleMobileCategoryClick = useCallback(
    (categoryName: string) => {
      handleCategoryClick(categoryName);
      setMobileMenuOpen(false);
    },
    [handleCategoryClick],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-brand-gold/10 to-brand-cream scroll-smooth">
      {/* Mobile / Tablet hamburger button (fixed top-left) */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open category menu"
        aria-haspopup="dialog"
        aria-expanded={mobileMenuOpen}
        className="lg:hidden fixed left-4 top-20 sm:top-24 z-50 inline-flex items-center justify-center rounded-md border border-brand-gold/30 bg-gradient-to-b from-brand-cream to-brand-gold/10 px-3 py-2 shadow-sm text-brand-red
           focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
      >
        {/* Simple hamburger icon */}
        <span className="sr-only">Open menu</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay menu (does not push content) */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Category menu"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close category menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          {/* Slide-out panel */}
          <div className="absolute left-0 top-0 h-full w-[85vw] max-w-sm bg-brand-cream border-r border-brand-gold/30 shadow-xl flex flex-col">
            <div className="p-6 flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-brand-red font-bold mb-1">Categories</h2>
                <div className="h-1 w-16 bg-gradient-to-r from-brand-gold to-brand-red rounded-full" />
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close category menu"
                className="inline-flex items-center justify-center rounded-md border border-brand-gold/30 bg-brand-cream/70 px-3 py-2 text-brand-red shadow-sm
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="px-3 pb-6 overflow-y-auto flex-1">
              <MenuSidebar
                categories={allCategories}
                activeCategory={activeCategory}
                onCategoryClick={handleMobileCategoryClick}
              />
            </nav>
          </div>
        </div>
      )}

      <div className="flex gap-4 lg:gap-8 max-w-7xl mx-auto px-4 py-8">
        {/* Desktop sidebar only */}
        <aside className="hidden lg:flex flex-col w-64 sticky top-24 max-h-[calc(100vh-7rem)] bg-gradient-to-b from-brand-cream to-brand-gold/10 border-r border-brand-gold/30 rounded-lg shadow-sm">
          <div className="p-6 shrink-0">
            <h2 className="text-brand-red font-bold mb-1">Categories</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-brand-gold to-brand-red rounded-full"></div>
          </div>

          <nav className="px-3 pb-4 overflow-y-auto flex-1">
            <MenuSidebar
              categories={allCategories}
              activeCategory={activeCategory}
              onCategoryClick={handleCategoryClick}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {allCategories.map((category) => (
            <section
              key={category.id || category.name}
              id={category.name.toLowerCase().replace(/\s+/g, "-")}
              className="mb-16 scroll-mt-24"
            >
              <div className="text-center mb-8">
                <h1 className="text-brand-red text-3xl font-bold mb-2">
                  {category.name}
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-brand-gold to-brand-red rounded-full mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(category.items ?? [])
                  .filter((item) => item.visible !== false)
                  .map((item) => {
                    const priceNumber = Number.parseFloat(
                      (item.price || "0").toString().replace(/[^0-9.]/g, ""),
                    );

                    return (
                      <MenuItemCard
                        key={item.id || item.name}
                        name={item.name}
                        price={Number.isFinite(priceNumber) ? priceNumber : 0}
                        description={item.description || ""}
                        image={item.image}
                      />
                    );
                  })}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
