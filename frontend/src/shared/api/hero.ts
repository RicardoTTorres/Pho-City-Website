// src/shared/api/hero.ts
import type { HeroAPI } from "@/shared/content/content.types";
const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

let heroInFlight: Promise<HeroAPI> | null = null;

export async function getHero(): Promise<HeroAPI> {
  if (heroInFlight) return heroInFlight;

  heroInFlight = (async () => {
    const res = await fetch(`${API_URL}/api/hero`);
    if (!res.ok) throw new Error("Failed to fetch hero");
    return (await res.json()) as HeroAPI;
  })();

  try {
    return await heroInFlight;
  } finally {
    heroInFlight = null;
  }
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
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update hero");
  return await res.json();
}
