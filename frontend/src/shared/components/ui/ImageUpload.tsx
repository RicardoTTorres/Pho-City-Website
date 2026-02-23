// src/shared/components/ui/ImageUpload.tsx
import { useRef, useState } from "react";
import { uploadImage } from "@/shared/api/upload";
import { MediaPickerModal } from "./MediaPickerModal";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface ImageUploadProps {
  section: "menu" | "hero" | "about" | "brand";
  currentUrl: string | null | undefined;
  onUploaded: (url: string) => void;
  label?: string;
}

export function ImageUpload({
  section,
  currentUrl,
  onUploaded,
  label = "Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File must be under 5 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const url = await uploadImage(file, section);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-brand-charcoal mb-1">
        {label}
      </label>

      {currentUrl && (
        <img
          src={currentUrl}
          alt="Current"
          className="w-24 h-24 object-cover rounded-lg border border-gray-200 mb-2"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-brand-gold bg-[#F5F1E8] text-brand-charcoal hover:bg-brand-gold/20 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload New"}
        </button>

        <button
          type="button"
          disabled={uploading}
          onClick={() => setPickerOpen(true)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Library
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          onUploaded(url);
          setPickerOpen(false);
        }}
        defaultSection={section}
      />
    </div>
  );
}
