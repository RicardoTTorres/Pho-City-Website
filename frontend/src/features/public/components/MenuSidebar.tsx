// src/features/public/components/MenuSidebar.tsx
import { MenuCategory as MenuCategoryPill } from "@/shared/components/ui/MenuCategory";
import type { MenuCategory as MenuCategoryData } from "@/shared/content/content.types";

interface MenuSidebarProps {
  categories: MenuCategoryData[];
  activeCategory: string | null;
  onCategoryClick: (categoryName: string) => void;
}

export function MenuSidebar({
  categories,
  activeCategory,
  onCategoryClick,
}: MenuSidebarProps) {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <MenuCategoryPill
          key={category.name}
          label={category.name}
          isActive={activeCategory === category.name}
          onClick={() => onCategoryClick(category.name)}
        />
      ))}
    </div>
  );
}
