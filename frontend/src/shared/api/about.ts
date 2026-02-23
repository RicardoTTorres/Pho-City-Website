import type { RestaurantContent } from "@/shared/content/content.types";

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export type AboutUpdatePayload = RestaurantContent["about"]

export async function updateAbout(payload: AboutUpdatePayload): Promise<AboutUpdatePayload> {
  const res = await fetch(`${API_URL}/api/about`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update about section");
  return await res.json();
}