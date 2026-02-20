// src/shared/components/ui/MenuItem.tsx
import React from "react";
import { parseBilingualName } from "@/utils/menuHelper";

export interface MenuItemProps {
  name: string;
  price: number;
  description: string;
  image?: string | null | undefined;
}

export function MenuItem({ name, price, description, image }: MenuItemProps) {
  const { english, vietnamese } = parseBilingualName(name);
  const safePrice = Number.isFinite(price) ? price : 0;

  return (
    <article
      className={[
        "rounded-2xl p-6",
        "bg-gradient-to-b from-amber-50 to-white",
        "border border-amber-200",
        "transition-all duration-200",
        "hover:border-amber-300 hover:shadow-lg",
        "font-sans",
      ].join(" ")}
    >
      {image && (
        <img
          src={image}
          alt={name}
          className="w-full h-40 object-cover rounded-xl mb-3"
        />
      )}
      <header className="flex items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          {/* English first: allow wrapping */}
          <h3 className="text-l font-bold text-red-900 leading-snug break-words line-clamp-3">
            {english}
          </h3>

          {/* Vietnamese below if present */}
          {vietnamese ? (
            <p className="mt-1 text-sm font-medium text-red-700/70 leading-snug break-words line-clamp-1">
              {vietnamese}
            </p>
          ) : null}
        </div>

        {/* Price top-right: slightly smaller */}
        <div className="shrink-0 text-right">
          <span className="text-s font-bold text-amber-600">
            ${safePrice.toFixed(2)}
          </span>
        </div>
      </header>

      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

      <div className="mt-4 pt-4 border-t border-amber-200/70">
        <div className="h-0.5 w-12 bg-gradient-to-r from-amber-500 to-red-700 rounded-full" />
      </div>
    </article>
  );
}

export default MenuItem;
