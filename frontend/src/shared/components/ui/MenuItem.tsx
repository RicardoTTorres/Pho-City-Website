// import React from "react";

// export interface MenuItemProps {
//   name: string;
//   price: number;
//   description: string;
// }

// export function MenuItem({ name, price, description }: MenuItemProps) {
//   return (
//     <div className="bg-gradient-to-br from-brand-cream to-brand-gold/10 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-brand-gold/40 hover:border-brand-gold group">
//       <div className="flex items-start justify-between mb-3">
//         <h3 className="text-brand-red flex-1 group-hover:text-brand-red/90 transition-colors font-semibold text-lg">
//           {name}
//         </h3>
//         <span className="text-brand-gold ml-4 font-medium">
//           ${price.toFixed(2)}
//         </span>
//       </div>

//       <p className="text-gray-700 text-sm leading-relaxed">{description}</p>

//       <div className="mt-4 pt-4 border-t border-brand-gold/30">
//         <div className="h-0.5 w-12 bg-gradient-to-r from-brand-gold to-brand-red rounded-full"></div>
//       </div>
//     </div>
//   );
// }

// export default MenuItem;
import React from "react";
import { parseBilingualName } from "@/utils/menuHelper";

export interface MenuItemProps {
  name: string;
  price: number;
  description: string;
}

export function MenuItem({ name, price, description }: MenuItemProps) {
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
      <header className="flex items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          {/* English first: allow wrapping (no truncate) */}
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
