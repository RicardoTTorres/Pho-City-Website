// src/features/public/components/PdfDownloadButton.tsx
import { Button } from "@/shared/components/ui/button";
import { Download } from "lucide-react";

interface PdfDownloadButtonProps {
  menuLabel?: string;
}

export default function PdfDownloadButton({
  menuLabel = "Download Menu",
}: PdfDownloadButtonProps) {
  return (
    <a href="/api/menu/pdf" download="pho-city-menu.pdf">
      <Button
        variant="secondary"
        size="lg"
        className="shadow-lg ring-1 ring-brand-red/20 inline-flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {menuLabel}
      </Button>
    </a>
  );
}
