// src/features/cms/pages/MediaPage.tsx
import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, ImageIcon, RefreshCw } from "lucide-react";
import {
  listMedia,
  deleteMedia,
  uploadImage,
} from "@/shared/api/upload";
import type { MediaItem, MediaSection } from "@/shared/api/upload";
import { Portal } from "@/shared/components/ui/Portal";

const SECTIONS: MediaSection[] = ["menu", "hero", "about", "brand"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileName(key: string): string {
  return key.split("/").pop() ?? key;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<MediaSection | "all">("all");
  const [uploadSection, setUploadSection] = useState<MediaSection>("menu");
  const [uploading, setUploading] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load(section: MediaSection | "all") {
    setLoading(true);
    setError(null);
    try {
      const s = section !== "all" ? section : undefined;
      const data = await listMedia(s);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(sectionFilter);
  }, [sectionFilter]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadImage(file, uploadSection);
      await load(sectionFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    setDeletingKey(item.key);
    try {
      await deleteMedia(item.key);
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <section className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-red transition-colors">
        <div className="flex flex-col items-center justify-center gap-3">
          <Upload size={40} className="text-gray-400" />
          <h3 className="font-semibold text-gray-700">Upload Image</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Section:</label>
            <select
              value={uploadSection}
              onChange={(e) => setUploadSection(e.target.value as MediaSection)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Choose File"}
          </button>
          <p className="text-xs text-gray-400">JPEG, PNG, WebP · max 5 MB</p>
        </div>
      </section>

      {/* Grid Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Uploaded Media
            {!loading && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({items.length} {items.length === 1 ? "file" : "files"})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={sectionFilter}
              onChange={(e) =>
                setSectionFilter(e.target.value as MediaSection | "all")
              }
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="all">All Sections</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => load(sectionFilter)}
              className="p-1.5 text-gray-500 hover:text-brand-red transition"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg aspect-square animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
            <p>No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
            {items.map((item) => (
              <div
                key={item.key}
                className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition group"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={item.url}
                    alt={fileName(item.key)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
                <div className="p-1.5">
                  <p
                    className="text-xs font-medium text-gray-700 truncate"
                    title={fileName(item.key)}
                  >
                    {fileName(item.key)}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">
                      {item.key.split("/")[0]}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatBytes(item.size)}
                    </span>
                  </div>
                  <button
                    onClick={() => setPendingDelete(item)}
                    disabled={deletingKey === item.key}
                    className="mt-1 flex items-center gap-0.5 text-[10px] text-red-500 hover:text-red-700 transition disabled:opacity-50"
                  >
                    <Trash2 size={10} />
                    {deletingKey === item.key ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Delete confirmation modal */}
      {pendingDelete && (
        <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Delete image?</h3>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border">
              <img
                src={pendingDelete.url}
                alt={fileName(pendingDelete.key)}
                className="w-14 h-14 object-cover rounded-md flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {fileName(pendingDelete.key)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pendingDelete.key.split("/")[0]} · {formatBytes(pendingDelete.size)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This will permanently remove the file from S3. Any pages still
              using this image will show a broken image.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
