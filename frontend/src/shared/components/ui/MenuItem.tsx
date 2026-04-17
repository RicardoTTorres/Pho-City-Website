// src/shared/components/ui/MenuItem.tsx
import React from "react";
import { parseBilingualName } from "@/utils/menuHelper";

export interface MenuItemProps {
  name: string;
  price: number;
  description: string;
  image?: string | null | undefined;
  popular?: boolean;
  onClick?: () => void;
}

export function MenuItem({ name, price, description, image, popular, onClick }: MenuItemProps) {
  const { english, vietnamese } = parseBilingualName(name);
  const safePrice = Number.isFinite(price) ? price : 0;

  return (
    <article
      onClick={onClick}
      className={[
        "rounded-xl p-3 sm:p-5",
        "bg-gradient-to-b from-amber-50/60 to-white",
        "border border-amber-200/80",
        "transition-all duration-200",
        "hover:border-amber-300 hover:shadow-md",
        onClick ? "cursor-pointer hover:shadow-lg active:scale-[0.985]" : "",
        "font-sans",
      ].join(" ")}
    >
      {/* Image */}
      {image && (
        <div className="relative mb-2.5">
          <img
            src={image}
            alt={english}
            className="w-full h-32 sm:h-40 object-cover rounded-lg"
          />
          {popular && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              Popular
            </span>
          )}
        </div>
      )}

      {/* Title row: name + price as one visual unit */}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h3 className="text-sm sm:text-base font-bold text-red-900 leading-snug break-words line-clamp-2 flex-1 min-w-0">
          {english}
        </h3>
        <span className="shrink-0 text-sm sm:text-base font-bold text-amber-600 whitespace-nowrap">
          ${safePrice.toFixed(2)}
        </span>
      </div>

      {/* Vietnamese subtitle */}
      {vietnamese ? (
        <p className="text-xs font-medium text-red-700/60 leading-snug line-clamp-1 mb-1.5">
          {vietnamese}
        </p>
      ) : <div className="mb-1.5" />}

      {/* Popular badge — text-only fallback when no image */}
      {!image && popular && (
        <span className="inline-block mb-1.5 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
          Popular
        </span>
      )}

      {/* Description: capped at 2 lines on mobile */}
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 sm:line-clamp-3">
          {description}
        </p>
      )}

      {/* View options hint */}
      {onClick && (
        <p className="mt-2.5 text-[11px] font-semibold text-amber-500/80 tracking-wide">
          View options →
        </p>
      )}
    </article>
  );
}

export default MenuItem;
