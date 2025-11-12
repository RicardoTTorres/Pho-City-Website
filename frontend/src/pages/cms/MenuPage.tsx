
import { useMemo } from "react";
import { useContent } from "@/context/ContentContext";
import { MenuSectionEditor } from "@/sections/AdminDashboard/MenuSectionEditor";
import {
  createItem,
  updateItem,
  deleteItem,
  createCategory,
  updateCategory,
  deleteCategory,
  type NewItemPayload,
  type NewCategoryPayload,
} from "@/api/menu";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  categoryId: string;
  image?: string | undefined;
  visible: boolean;
}

export interface Category {
  id: string;
  name: string;
  items?: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

export default function MenuPage() {
  // Shared content source from context
  const { content, refreshMenu } = useContent();
  const menuData = content.menu;

  // Transform menu data for editor UI
  const derivedCategories: Category[] = useMemo(() => {
    const cats = menuData?.categories ?? [];
    return cats.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      items: (cat.items ?? []).map((i) => ({
        id: String(i.id),
        name: i.name,
        description: i.description,
        price: String(i.price),
        category: cat.name,
        categoryId: String(cat.id),
        image: i.image,
        visible: Boolean((i as any).visible ?? true),
      })),
    }));
  }, [menuData]);

  const formattedMenuData: MenuData = useMemo(
    () => ({ categories: derivedCategories }),
    [derivedCategories]
  );

  // CRUD callbacks
  const handleCreateItem = async (data: NewItemPayload) => {
    await createItem(data);
    await refreshMenu();
  };

  const handleUpdateItem = async (id: string, data: NewItemPayload) => {
    await updateItem(id, data);
    await refreshMenu();
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    await deleteItem(id);
    await refreshMenu();
  };

  const handleCreateCategory = async (data: NewCategoryPayload) => {
    await createCategory(data);
    await refreshMenu();
  };

  const handleUpdateCategory = async (id: string, data: NewCategoryPayload) => {
    await updateCategory(id, data);
    await refreshMenu();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    await deleteCategory(id);
    await refreshMenu();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
        <p className="text-sm text-gray-500">
          Add, edit, or remove menu items and categories.
        </p>
      </header>

      <MenuSectionEditor
        menuData={formattedMenuData}
        categories={derivedCategories}
        loading={!menuData}
        onCreateItem={handleCreateItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
