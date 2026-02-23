// src/shared/components/ui/MediaPickerModal.tsx
import { useEffect, useState } from "react";
import { X, ImageIcon } from "lucide-react";
import { listMedia } from "@/shared/api/upload";
import type { MediaItem, MediaSection } from "@/shared/api/upload";
import { Portal } from "./Portal";

const SECTIONS: MediaSection[] = ["menu", "hero", "about", "brand"];

function fileName(key: string): string {
  return key.split("/").pop() ?? key;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  defaultSection?: MediaSection;
}

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  defaultSection,
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<MediaSection | "all">(
    defaultSection ?? "all",
  );

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    const section = activeSection !== "all" ? activeSection : undefined;
    listMedia(section)
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load media"),
      )
      .finally(() => setLoading(false));
  }, [open, activeSection]);

  // Reset section filter when re-opened
  useEffect(() => {
    if (open) setActiveSection(defaultSection ?? "all");
  }, [open, defaultSection]);

  if (!open) return null;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="font-semibold text-gray-900">Media Library</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section filter tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-2 border-b border-gray-100 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSection("all")}
            className={`px-3 py-1 text-xs rounded-full transition whitespace-nowrap ${
              activeSection === "all"
                ? "bg-brand-red text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-3 py-1 text-xs rounded-full transition whitespace-nowrap ${
                activeSection === s
                  ? "bg-brand-red text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-500 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <ImageIcon size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-red focus:outline-none focus:border-brand-red transition"
                  title={fileName(item.key)}
                >
                  <img
                    src={item.url}
                    alt={fileName(item.key)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                  {/* Hover overlay with filename */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-end p-1">
                    <span className="text-white text-[9px] leading-tight line-clamp-2 break-all">
                      {fileName(item.key)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400">
            Click an image to use it. To add new images, upload them via the
            Media page.
          </p>
        </div>
      </div>
    </div>
    </Portal>
  );
}
