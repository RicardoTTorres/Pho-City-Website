import React from "react";

interface MenuCategoryProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function MenuCategory({ label, isActive = false, onClick }: MenuCategoryProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-lg mb-2 transition-all duration-200
        flex items-center justify-between group
        ${isActive
          ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-l-4 border-red-600 shadow-sm' 
          : 'text-slate-700 hover:bg--100/50 border-l-4 border-transparent'
        }
      `}
    >
        
      <div className="flex-1">
        <div className={`${isActive ? '' : 'group-hover:text-red-600'} transition-colors`}>
          {label}
        </div>
      </div>
    </button>
  );
}

export default MenuCategory;