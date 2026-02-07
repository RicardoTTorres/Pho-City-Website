import type { Footer } from "@/content/content.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getFooter(): Promise<Footer> {
  const res = await fetch(`${API_URL}/api/footer`);
  if (!res.ok) throw new Error("Failed to fetch footer");
  const data = await res.json();
  return data && data.footer ? (data.footer as Footer) : (data as Footer);
}

export async function updateFooter(footer: Footer): Promise<void> {
  const res = await fetch(`${API_URL}/api/footer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(footer),
  });
  if (!res.ok) throw new Error("Failed to update footer");
}
