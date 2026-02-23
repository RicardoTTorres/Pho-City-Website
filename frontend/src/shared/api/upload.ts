// src/shared/api/upload.ts
const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export type MediaSection = "menu" | "hero" | "about" | "brand";

export type MediaItem = {
  key: string;
  url: string;
  size: number;
  lastModified: string;
};

export async function listMedia(section?: MediaSection): Promise<MediaItem[]> {
  const params = section ? `?section=${encodeURIComponent(section)}` : "";
  const res = await fetch(`${API_URL}/api/upload${params}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to list media");
  }

  const data = await res.json();
  return data.items as MediaItem[];
}

export async function deleteMedia(key: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to delete media");
  }
}

export async function uploadImage(
  file: File,
  section: MediaSection,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${API_URL}/api/upload?section=${encodeURIComponent(section)}`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}
