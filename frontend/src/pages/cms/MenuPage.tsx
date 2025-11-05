import { useState, useEffect, useMemo, useCallback } from "react";
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
  getMenuAdmin,
} from "@/api/menu";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  categoryId: string;
  image?: string;
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
  const [loading, setLoading] = useState(true);
  const [menuDataState, setMenuDataState] = useState<MenuData>({ categories: [] });

  const refreshAdminMenu = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMenuAdmin();
      setMenuDataState(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refreshAdminMenu();
      } finally {
        if (!mounted) return;
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshAdminMenu]);

  const derivedCategories: Category[] = useMemo(() => {
    const cats = menuDataState?.categories ?? [];
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
        visible: (i as any).visible ?? true,
      })),
    }));
  }, [menuDataState]);

  const menuData: MenuData = useMemo(() => ({ categories: derivedCategories }), [derivedCategories]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
        <p className="text-sm text-gray-500">Add, edit, or remove menu items and categories.</p>
      </div>

      <MenuSectionEditor 
        menuData={menuData}
        categories={derivedCategories}
        loading={loading}
        onCreateItem={async (data: NewItemPayload) => {
          await createItem(data);
          await refreshAdminMenu();
        }}
        onUpdateItem={async (id: string, data: NewItemPayload) => {
          await updateItem(id, data);
          // Optimistically update local state so hidden items remain manageable in CMS
          setMenuDataState((prev) => {
            const next: MenuData = {
              categories: prev.categories.map((cat) => {
                return {
                  ...cat,
                  items: (cat.items || []).map((itm) => {
                    if (String(itm.id) !== String(id)) return itm as any;
                    return {
                      ...(itm as any),
                      name: data.name ?? itm.name,
                      description: data.description ?? itm.description,
                      price: data.price ?? itm.price,
                      image: data.image ?? (itm as any).image,
                      visible: (data.visible ?? (itm as any).visible ?? true) as any,
                    } as any;
                  }),
                } as any;
              }),
            } as any;
            return next;
          });
        }}
        onDeleteItem={async (id: string) => {
          const ok = window.confirm("Are you sure you want to delete this item?");
          if (!ok) return;
          await deleteItem(id);
          await refreshAdminMenu();
        }}
        onCreateCategory={async (data: NewCategoryPayload) => {
          await createCategory(data);
          await refreshAdminMenu();
        }}
        onUpdateCategory={async (id: string, data: NewCategoryPayload) => {
          await updateCategory(id, data);
          await refreshAdminMenu();
        }}
        onDeleteCategory={async (id: string) => {
          const ok = window.confirm("Are you sure you want to delete this category?");
          if (!ok) return;
          await deleteCategory(id);
          await refreshAdminMenu();
        }}
      />
    </div>
  );
}
