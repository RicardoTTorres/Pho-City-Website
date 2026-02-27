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

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((v) => !v);
    }
  }

  return (
    <div className="mb-10 max-w-3xl mx-auto px-1">
      {/* Single trigger — decorative rule on both sides */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:rounded-sm"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-700/80 whitespace-nowrap group-hover:text-amber-800 transition-colors">
          Customize Your {categoryName}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`w-3.5 h-3.5 text-amber-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      </button>

      {/* Column grid panel — gap-px on a tinted parent creates table-style cell lines */}
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-label={`Customize Your ${categoryName}`}
          className="mt-4 rounded-xl overflow-hidden border border-amber-200/70 shadow-sm"
        >
          <div
            className="grid gap-px bg-amber-200/50"
            style={{
              gridTemplateColumns: `repeat(${Math.min(sections.length, 3)}, minmax(0, 1fr))`,
            }}
          >
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-amber-50/60 to-white px-4 py-4"
              >
                {/* Column heading */}
                <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-amber-600/90 mb-2.5 pb-2 border-b border-amber-100">
                  {section.title}
                </p>

                {/* Items */}
                <ul className="space-y-1.5">
                  {section.items.map((item, ii) => (
                    <li key={ii} className="flex items-start justify-between gap-2">
                      <span className="flex items-baseline gap-1.5 min-w-0">
                        <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0 mt-[5px]" />
                        <span className="text-xs text-slate-700 leading-snug">
                          {item.name}
                        </span>
                      </span>
                      {item.price ? (
                        <span className="text-[10px] font-semibold text-amber-600 whitespace-nowrap flex-shrink-0">
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
