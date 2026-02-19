// src/shared/api/acitivity.ts
const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export interface ActivityEntry {
  id: number;
  action: string;
  section: string;
  description: string;
  admin_email: string | null;
  created_at: string;
}

export async function fetchRecentActivity(): Promise<ActivityEntry[]> {
  const res = await fetch(`${API_URL}/api/admin/activity`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch activity");
  const data = await res.json();
  return data.activity;
}
