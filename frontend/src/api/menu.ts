import type { MenuData } from "@/pages/cms/MenuPage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type NewItemPayload = {
  name: string;
  description: string;
  price: string; // raw string from form; will be converted to number
  categoryId: string; // UI uses categoryId, backend expects `category`
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
  // Support both { menu: { categories: [...] }} and { categories: [...] }
  return (data && data.menu) ? data.menu as MenuData : (data as MenuData);
}

// Admin variant: include hidden items so CMS can manage visibility
export async function getMenuAdmin(): Promise<MenuData> {
  const res = await fetch(`${API_URL}/api/menu/admin`);
  if (!res.ok) throw new Error("Failed to fetch admin menu data");
  const data = await res.json();
  return (data && data.menu) ? data.menu as MenuData : (data as MenuData);
}

export async function createItem(payload: NewItemPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  });
  if (!res.ok) throw new Error("Failed to delete item");
}

export async function createCategory(payload: NewCategoryPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add category");
}

export async function updateCategory(id: string, payload: NewCategoryPayload): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update category");
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/menu/categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete category");
}
