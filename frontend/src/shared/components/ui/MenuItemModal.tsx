// src/shared/components/ui/MenuItemModal.tsx
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { parseBilingualName } from "@/utils/menuHelper";
import { Portal } from "@/shared/components/ui/Portal";
import type { CategoryCustomization } from "@/shared/api/menu";

export interface MenuItemModalProps {
  name: string;
  price: number;
  description: string;
  image: string | null;
  popular: boolean;
  categoryName: string;
  customization: CategoryCustomization | null;
  onClose: () => void;
}

export function MenuItemModal({
  name,
  price,
  description,
  image,
  popular,
  categoryName,
  customization,
  onClose,
}: MenuItemModalProps) {
  const { english, vietnamese } = parseBilingualName(name);
  const safePrice = Number.isFinite(price) ? price : 0;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape to close + body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // focus close button
    setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const hasCust =
    customization?.enabled && (customization.sections?.length ?? 0) > 0;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label={english}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close"
          className="absolute inset-0 bg-black/50 cursor-default"
          onClick={onClose}
        />

        {/* Panel — bottom sheet on mobile, centered on md+ */}
        <div
          ref={panelRef}
          className="relative w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] animate-slide-up md:animate-none"
        >
          {/* Drag handle (mobile) */}
          <div className="md:hidden flex justify-center pt-3 pb-0 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {/* Hero image */}
            {image && (
              <div className="relative">
                <img
                  src={image}
                  alt={english}
                  className="w-full h-52 sm:h-64 object-cover"
                />
                {popular && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                    Popular
                  </span>
                )}
              </div>
            )}

            {/* Content area — extra top padding when no image to clear the close button */}
            <div className={`px-5 pb-6 ${image ? "pt-4" : "pt-10"}`}>
              {/* Name + Price */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-red-900 leading-snug">
                    {english}
                  </h2>
                  {vietnamese && (
                    <p className="text-sm text-red-700/50 italic mt-0.5">
                      {vietnamese}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-lg font-bold text-amber-600 mt-0.5">
                  ${safePrice.toFixed(2)}
                </span>
              </div>

              {/* Popular badge (no image case) */}
              {!image && popular && (
                <span className="inline-block mt-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                  Popular
                </span>
              )}

              {/* Description */}
              {description && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Customizations */}
              {hasCust && (
                <div className="mt-5 pt-4 border-t border-amber-100">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-4">
                    Customize Your Order
                  </p>

                  <div className="space-y-5">
                    {customization!.sections.map((section, si) => (
                      <div key={si}>
                        {/* Section header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-red/60 flex-shrink-0" />
                          <p className="text-[11px] font-bold uppercase tracking-wide text-red-800/70">
                            {section.title}
                          </p>
                        </div>

                        {/* Options */}
                        <ul className="space-y-1.5 pl-3.5">
                          {section.items.map((opt, oi) => (
                            <li
                              key={oi}
                              className="flex items-baseline justify-between gap-3"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-1 h-1 rounded-full bg-amber-300 flex-shrink-0 mt-px" />
                                <span className="text-sm text-slate-700 leading-snug">
                                  {opt.name}
                                </span>
                              </div>
                              {opt.price && (
                                <span className="shrink-0 text-sm font-semibold text-amber-600 whitespace-nowrap">
                                  {opt.price}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom note */}
              <p className="mt-6 text-center text-xs text-slate-400">
                Let your server know about any modifications when ordering.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
