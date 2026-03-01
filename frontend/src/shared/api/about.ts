import type { RestaurantContent } from "@/shared/content/content.types";

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export type AboutContent = RestaurantContent["about"];

export type AboutUpdatePayload = AboutContent;

export async function getAbout(): Promise<AboutContent> {
  const res = await fetch(`${API_URL}/api/about`);
  if (!res.ok) throw new Error("Failed to fetch about section");
  const data = await res.json();
  return data.about as AboutContent;
}

export async function updateAbout(payload: AboutContent): Promise<void> {
  const res = await fetch(`${API_URL}/api/about`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update about section");
}
