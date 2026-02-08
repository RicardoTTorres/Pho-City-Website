import type { HeroAPI } from "@/content/content.types";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getHero(): Promise<HeroAPI> {
  const res = await fetch(`${API_URL}/api/hero`);
  if (!res.ok) throw new Error("Failed to fetch hero");
  return await res.json();
}

export async function updateHero(payload: {
  title: string;
  subtitle: string;
  ctaText: string;
  secondaryCtaText: string;
  imageUrl?: string | null;
}): Promise<HeroAPI> {
  const res = await fetch(`${API_URL}/api/hero`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update hero");
  return await res.json();
}
