import type { FooterData } from "@/content/content.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fetch footer data from the backend.
export async function getFooter(): Promise<{ footer: FooterData }> {
  const res = await fetch(`${API_URL}/api/footer`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{ footer: FooterData }>;
}

// Persist footer data to the backend.
export async function updateFooter(footer: FooterData) {
  const res = await fetch(`${API_URL}/api/footer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ footer }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
