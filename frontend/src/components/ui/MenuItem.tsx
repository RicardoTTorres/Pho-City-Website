import React from "react";

export interface MenuItemProps {
  name: string;
  price: number;
  description: string;
}

export function MenuItem({ name, price, description }: MenuItemProps) {
  return (
    <div className="bg-gradient-to-br from-brand-cream to-brand-gold/10 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-brand-gold/40 hover:border-brand-gold group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-brand-red flex-1 group-hover:text-brand-red/90 transition-colors font-semibold text-lg">
          {name}
        </h3>
        <span className="text-brand-gold ml-4 font-medium">
          ${price.toFixed(2)}
        </span>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{description}</p>

      <div className="mt-4 pt-4 border-t border-brand-gold/30">
        <div className="h-0.5 w-12 bg-gradient-to-r from-brand-gold to-brand-red rounded-full"></div>
      </div>
    </div>
  );
}

export default MenuItem;
