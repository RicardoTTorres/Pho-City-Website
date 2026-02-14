import type { MenuData } from "@/shared/content/content.types";

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export type NewItemPayload = {
  name: string;
  description: string;
  price: string; 
  categoryId: string; 
  image?: string;
  visible?: boolean;
  featured?: boolean;
};

export type NewCategoryPayload = {
  name: string;
};

const toNumberPrice = (price: string) => {
  const cleaned = price.toString().replace(/[^0-9.]/g, "");
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) throw new Error("Invalid price");
  return n;
};

export async function getMenu(): Promise<MenuData> {
  const res = await fetch(`${API_URL}/api/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu data");
  const data = await res.json();
  return (data && data.menu) ? data.menu as MenuData : (data as MenuData);
}


export async function getMenuAdmin(): Promise<MenuData> {
  const res = await fetch(`${API_URL}/api/menu/admin`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch admin menu data");
  const data = await res.json();
  return (data && data.menu) ? data.menu as MenuData : (data as MenuData);
}

export async function createItem(payload: NewItemPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      price: toNumberPrice(payload.price),
      image: payload.image,
      visible: payload.visible ?? true,
      featured: payload.featured,
      category: payload.categoryId,
    }),
  });
  if (!res.ok) throw new Error("Failed to add item");
}

export async function updateItem(id: string, payload: NewItemPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      price: toNumberPrice(payload.price),
      image: payload.image,
      visible: payload.visible ?? true,
      featured: payload.featured,
      category: payload.categoryId,
    }),
  });
  if (!res.ok) throw new Error("Failed to update item");
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/items/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete item");
}

export async function createCategory(payload: NewCategoryPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add category");
}

export async function updateCategory(id: string, payload: NewCategoryPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update category");
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete category");
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ categoryIds }),
  });

  if (!res.ok) throw new Error("Failed to reorder categories");
}

export async function reorderItems(categoryId: string, itemIds: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories/${categoryId}/items/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ itemIds }),
  });

  if (!res.ok) throw new Error("Failed to reorder items");
}
