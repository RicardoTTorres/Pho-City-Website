import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
//import { menuConfig } from "@/config/menu.config";
import { useContent } from "@/context/ContentContext";
const ALL_CATEGORIES = "All";

export default function Menu() {
  const { content } = useContent();
  const menuData = content.menu; 

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Prevents page from crashing if menu isn't fetched yet
  if (!menuData || !menuData.categories) {
    return <div className="text-center py-20 text-gray-600">Loading menu...</div>;
  }

  // Filter logic
  const filteredCategories =
    selectedCategory === ALL_CATEGORIES
      ? menuData.categories
      : menuData.categories.filter(
          (cat) => cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );

  // Show/hide Back to Top button based on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-b from-brand-cream to-brand-gold/10 text-gray-800">
      {/* ---- Dropdown Filter ---- */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 mb-12">
        <span className="text-sm text-gray-600 font-medium">Filter by:</span>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none border border-brand-red/40 rounded-xl px-6 py-3 pr-10 bg-white/90 text-brand-red font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 transition-all"
          >
            <option value={ALL_CATEGORIES}>All Categories</option>
            {menuData.categories.map((cat) => (
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
      {filteredCategories.map((category, catIndex) => (
        <motion.section
          key={category.name}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: catIndex * 0.1 }}
          className="mb-16 sm:mb-20 py-10 sm:py-12 px-4 sm:px-8 rounded-3xl bg-white/80 border border-brand-red/20 shadow-sm hover:shadow-lg hover:border-brand-red/40 transition-all duration-300"
        >
          {/* ---- Category Header ---- */}
          <div className="relative text-center mb-10 sm:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-red tracking-wide mb-3">
              {category.name}
            </h2>

            <div className="flex justify-center">
              <span className="w-20 h-1 bg-brand-gold rounded-full"></span>
            </div>
          </div>

          {/* ---- Menu Items with Stagger ---- */}
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item, itemIndex) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: itemIndex * 0.03 }}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:shadow-brand-red/30 hover:scale-105 hover:border-brand-red/40 transition-all duration-300"
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
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}

      {/* ---- Floating Back to Top Button ---- */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 bg-brand-red text-white p-4 rounded-full shadow-lg hover:bg-brand-redHover hover:shadow-xl hover:scale-110 transition-all duration-300"
            aria-label="Back to top"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
