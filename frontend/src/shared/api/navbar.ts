// src/shared/api/navbar.ts
import type { NavbarData } from "@/shared/content/content.types";

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: text || "Invalid JSON response" };
  }
}

export async function getNavbar(): Promise<NavbarData> {
  
  const res = await fetch(`${API_URL}/api/navbar`, {
    credentials: "include",
  });

  const json = await parseJson(res);
  if (!res.ok || !json.success) {
    throw new Error(json?.error ?? "Failed to fetch navbar");
  }
  return json.data as NavbarData;
}

export async function putNavbar(payload: NavbarData): Promise<NavbarData> {
  const res = await fetch(`${API_URL}/api/admin/navbar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await parseJson(res);
  if (!res.ok || !json.success) {
    throw new Error(json?.error ?? "Failed to update navbar");
  }
  return json.data as NavbarData;
}
