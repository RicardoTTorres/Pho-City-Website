// src/features/cms/pages/MenuPage.tsx
import { useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useContent } from "@/app/providers/ContentContext";
import { MenuSectionEditor } from "@/features/cms/sections/MenuSectionEditor";
import {
  createItem,
  updateItem,
  deleteItem,
  createCategory,
  updateCategory,
  deleteCategory,
  type NewItemPayload,
  type NewCategoryPayload,
} from "@/shared/api/menu";
import type {
  MenuData as RawMenuData,
  MenuCategory as RawCategory,
  MenuItem as RawMenuItem,
} from "@/shared/content/content.types";
import { reorderCategories, reorderItems } from "@/shared/api/menu";

//this is the search value coming from CMSLayout
type CMSOutletContext = { search: string };

export interface MenuItem extends RawMenuItem {
  category: string;
  categoryId: string;
  price: string;
  visible: boolean;
  featured: boolean;
  featuredPosition: number | null;
}

export interface Category extends Omit<RawCategory, "items"> {
  items?: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

export default function MenuPage() {
  // Shared content source from context
  const { content, refreshMenuAdmin } = useContent();
  const rawMenuData: RawMenuData | null = content.menuAdmin;
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  //Get global search value from CMSLayout using Outlet context
  const { search } = useOutletContext<CMSOutletContext>();
  //query used for case filtering
  const q = search.trim().toLowerCase();

  useEffect(() => {
    let active = true;

    async function loadMenu() {
      setMenuLoading(true);
      setMenuError(null);
      try {
        await refreshMenuAdmin();
      } catch {
        if (active) {
          setMenuError("Failed to load admin menu.");
        }
      } finally {
        if (active) {
          setMenuLoading(false);
        }
      }
    }

    loadMenu();
    return () => {
      active = false;
    };
  }, [refreshMenuAdmin]);

  // Transform menu data for editor UI
  const derivedCategories: Category[] = useMemo(() => {
    const cats: RawCategory[] = rawMenuData?.categories ?? [];
    return cats.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      items: (cat.items ?? []).map((item) => {
        const formatted: MenuItem = {
          id: String(item.id),
          name: item.name,
          description: item.description,
          price: String(item.price ?? ""),
          category: cat.name,
          categoryId: String(cat.id),
          visible: Boolean(item.visible ?? true),
          featured: Boolean(item.featured ?? false),
          featuredPosition: item.featuredPosition ?? null,
        };
        if (item.image) {
          formatted.image = item.image;
        }
        return formatted;
      }),
    }));
  }, [rawMenuData]);

  //search filter query on derived categories/items
  const filteredCategories: Category[] = useMemo(() => {
  if (!q) return derivedCategories;

  return derivedCategories
    .map((cat) => {
      const items = (cat.items ?? []).filter((item) => {
        const haystack = `${item.name} ${item.description ?? ""}`.toLowerCase();
        return haystack.includes(q);
      });
      return { ...cat, items };
    })
    .filter((cat) => (cat.items?.length ?? 0) > 0);
}, [derivedCategories, q]);

  const formattedMenuData: MenuData = useMemo(
    () => ({ categories: derivedCategories }),
    [derivedCategories],
  );

  // CRUD callbacks
  const handleCreateItem = async (data: NewItemPayload) => {
    await createItem(data);
    await refreshMenuAdmin();
  };

  const handleUpdateItem = async (id: string, data: NewItemPayload) => {
    await updateItem(id, data);
    await refreshMenuAdmin();
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    await deleteItem(id);
    await refreshMenuAdmin();
  };

  const handleCreateCategory = async (data: NewCategoryPayload) => {
    await createCategory(data);
    await refreshMenuAdmin();
  };

  const handleUpdateCategory = async (id: string, data: NewCategoryPayload) => {
    await updateCategory(id, data);
    await refreshMenuAdmin();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    await deleteCategory(id);
    await refreshMenuAdmin();
  };

  const handleReorderCategories = async (categoryIds: string[]) => {
    await reorderCategories(categoryIds);
    await refreshMenuAdmin();
  };
  const handleReorderItems = async (categoryId: string, itemIds: string[]) => {
    await reorderItems(categoryId, itemIds);
    await refreshMenuAdmin();
  };
  
  const categoriesToShow = q ? filteredCategories : derivedCategories;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Menu Management
        </h1>
        <p className="text-sm text-gray-500">
          Add, edit, or remove menu items and categories.
        </p>
      </header>

      {menuError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {menuError}
        </div>
      ) : null}

      {!menuLoading && !rawMenuData ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No admin menu data was returned. Please verify your admin session and
          try again.
        </div>
      ) : null}


      <MenuSectionEditor
        menuData={{ categories: categoriesToShow }}
        categories={categoriesToShow}
        loading={menuLoading}
        onCreateItem={handleCreateItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onReorderCategories={handleReorderCategories}
        onReorderItems={handleReorderItems}
      />
    </div>
  );
}
