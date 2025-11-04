import { MenuCategory } from "@/components/ui/MenuCategory";

interface MenuSidebarProps {
  categories: { name: string; items: { name: string }[] }[];
  activeCategory: string | null;
  onCategoryClick: (categoryName: string) => void;
}

export function MenuSidebar({ categories, activeCategory, onCategoryClick }: MenuSidebarProps) {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <MenuCategory
          key={category.name}
          label={category.name}
          isActive={activeCategory === category.name}
          onClick={() => onCategoryClick(category.name)}
        />
      ))}
    </div>
  );
}
