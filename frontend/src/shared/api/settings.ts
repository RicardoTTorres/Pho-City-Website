// src/shared/api/settings.ts

export interface SiteSettings {
  siteName: string;
  tagline: string;
  seoDescription: string;
  googleAnalyticsId: string;
}

export interface ContactSettings {
  notificationEmail: string;
  emailNotificationsEnabled: boolean;
  storeSubmissions: boolean;
}

export interface PdfSettings {
  menuLabel: string;
  cacheTtlMinutes: number;
}

export interface AppSettings {
  site: SiteSettings;
  contact: ContactSettings;
  pdf: PdfSettings;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  submitted_at: string;
  is_read: number;
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch("/api/settings", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load settings");
  const data = await res.json();
  return data.settings as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const res = await fetch("/api/settings", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  const data = await res.json();
  return data.settings as AppSettings;
}

export async function fetchInbox(): Promise<ContactSubmission[]> {
  const res = await fetch("/api/settings/inbox", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load inbox");
  const data = await res.json();
  return data.submissions as ContactSubmission[];
}

export async function markRead(id: number): Promise<void> {
  const res = await fetch(`/api/settings/inbox/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to mark as read");
}

export async function fetchPublicSettings(): Promise<{ pdfLabel: string }> {
  const res = await fetch("/api/settings/public");
  if (!res.ok) return { pdfLabel: "Download Menu" };
  return res.json();
}
