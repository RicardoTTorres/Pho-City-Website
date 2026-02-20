// src/shared/components/ui/ImageUpload.tsx
import { useRef, useState } from "react";
import { uploadImage } from "@/shared/api/upload";

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

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 text-sm font-medium rounded-lg border border-brand-gold bg-[#F5F1E8] text-brand-charcoal hover:bg-brand-gold/20 transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Choose Image"}
      </button>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
