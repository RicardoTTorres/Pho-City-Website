// src/shared/components/ui/MenuCustomizationAccordion.tsx
// One top-level toggle reveals all sections laid out in a responsive column grid.
// Keyboard: Space/Enter on the trigger, no nested focus complexity.
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CategoryCustomization } from "@/shared/api/menu";

interface MenuCustomizationAccordionProps {
  customization: CategoryCustomization;
  categoryName: string;
}

export function MenuCustomizationAccordion({
  customization,
  categoryName,
}: MenuCustomizationAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!customization.enabled || !customization.sections.length) return null;

  const { sections } = customization;
  const panelId = `cust-panel-${categoryName.replace(/\s+/g, "-")}`;
  const colCount = Math.min(sections.length, 3);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((v) => !v);
    }
  }

  return (
    <div className="mb-10 max-w-3xl mx-auto px-1">
      {/* Trigger */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className="
          mx-auto flex items-center gap-2 px-4 py-1.5 rounded-full
          border border-amber-200 bg-amber-50/60
          text-amber-700/80 hover:text-amber-900 hover:bg-amber-100/80 hover:border-amber-300
          transition-all duration-200 cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
          group
        "
      >
        <span className="text-xs font-semibold tracking-[0.15em] uppercase whitespace-nowrap">
          Customize Your {categoryName}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`w-3 h-3 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-label={`Customize Your ${categoryName}`}
          className="mt-4 rounded-2xl overflow-hidden border border-amber-100 shadow-sm bg-white"
        >
          <div
            className={`grid divide-amber-100 ${colCount > 1 ? "divide-x" : ""} sm:grid-cols-${colCount}`}
            style={{
              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
            }}
          >
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="
                  px-5 py-5
                  bg-gradient-to-b from-amber-50/40 to-white
                  hover:from-amber-50/70 transition-colors duration-150
                  first:rounded-tl-2xl last:rounded-tr-2xl
                  max-sm:border-b max-sm:border-amber-100 max-sm:last:border-b-0
                "
              >
                {/* Column heading */}
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-amber-500 mb-3 pb-2.5 border-b border-amber-100">
                  {section.title}
                </p>

                {/* Items */}
                <ul className="space-y-2">
                  {section.items.map((item, ii) => (
                    <li key={ii} className="flex items-baseline justify-between gap-2 group/item">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="w-1 h-1 rounded-full bg-amber-300 group-hover/item:bg-amber-500 flex-shrink-0 mt-[5px] transition-colors duration-150" />
                        <span className="text-[13px] font-semibold text-red-900/85 leading-snug truncate">
                          {item.name}
                        </span>
                      </div>
                      {item.price ? (
                        <span className="text-[12px] font-semibold text-amber-600 whitespace-nowrap flex-shrink-0">
                          {item.price}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
