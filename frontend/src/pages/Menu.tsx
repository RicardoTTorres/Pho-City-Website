import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { MenuSidebar } from "@/components/MenuSidebar";
import { MenuItem as MenuItemCard } from "@/components/ui/MenuItem";

export default function Menu() {
  const { content } = useContent();
  const allCategories = content.menu?.categories ?? [];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  console.log("Menu Data:", content.menu);

  // Set initial active category
  useEffect(() => {
    if (allCategories.length > 0 && !activeCategory) {
      const first = allCategories[0];
      if (first && first.name) {
        setActiveCategory(first.name);
      }
    }
  }, [allCategories, activeCategory]);

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    const sectionId = categoryName.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-brand-gold/10 to-brand-cream scroll-smooth">
      <div className="flex gap-8 max-w-7xl mx-auto px-4 py-8">
        {/* Sidebar */}
        <aside className="w-64 sticky top-24 h-fit bg-gradient-to-b from-brand-cream to-brand-gold/10 border-r border-brand-gold/30 rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-brand-red font-bold mb-1">Categories</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-brand-gold to-brand-red rounded-full"></div>
          </div>

          <nav className="px-3 pb-4">
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
              id={category.name.toLowerCase().replace(/\s+/g, '-')}
              className="mb-16 scroll-mt-24"
            >
              <div className="text-center mb-8">
                <h1 className="text-brand-red text-3xl font-bold mb-2">
                  {category.name}
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-brand-gold to-brand-red rounded-full mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item) => {
                  const priceNumber = Number.parseFloat(
                    (item.price || "0").toString().replace(/[^0-9.]/g, "")
                  );
                  return (
                    <MenuItemCard
                      key={item.id || item.name}
                      name={item.name}
                      price={Number.isFinite(priceNumber) ? priceNumber : 0}
                      description={item.description || ""}
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