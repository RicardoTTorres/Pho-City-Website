// src/features/public/components/PdfDownloadButton.tsx
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/shared/components/ui/button";
import { Download } from "lucide-react";
import { MenuPdfDocument } from "./MenuPdfDocument";
import type { MenuCategory, Weekday } from "@/shared/content/content.types";

// Module-level session cache — avoids re-generating the PDF on repeat clicks
// within the same browser session (or until TTL expires / menu changes).
interface PdfCache {
  url: string;
  menuHash: string;
  expiresAt: number;
}
let sessionCache: PdfCache | null = null;

function hashCategories(categories: MenuCategory[]): string {
  return JSON.stringify(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      items: c.items?.map((i) => ({ id: i.id, price: i.price })),
    })),
  );
}

interface PdfDownloadButtonProps {
  categories: MenuCategory[];
  restaurantName: string;
  address: string;
  cityZip: string;
  phone: string;
  hours: Record<Weekday, string>;
  logoUrl: string;
  menuLabel?: string;
  cacheTtlMinutes?: number;
}

export default function PdfDownloadButton({
  categories,
  restaurantName,
  address,
  cityZip,
  phone,
  hours,
  logoUrl,
  menuLabel = "Download Menu",
  cacheTtlMinutes = 60,
}: PdfDownloadButtonProps) {
  const menuHash = hashCategories(categories);
  const now = Date.now();

  // Serve cached blob URL if still valid and menu hasn't changed
  if (
    sessionCache &&
    sessionCache.menuHash === menuHash &&
    sessionCache.expiresAt > now
  ) {
    return (
      <a href={sessionCache.url} download="pho-city-menu.pdf">
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

  return (
    <PDFDownloadLink
      document={
        <MenuPdfDocument
          categories={categories}
          restaurantName={restaurantName}
          address={address}
          cityZip={cityZip}
          phone={phone}
          hours={hours}
          logoUrl={logoUrl}
        />
      }
      fileName="pho-city-menu.pdf"
    >
      {({ loading, url }) => {
        // Cache the blob URL once ready
        if (!loading && url && cacheTtlMinutes > 0) {
          sessionCache = {
            url,
            menuHash,
            expiresAt: Date.now() + cacheTtlMinutes * 60 * 1000,
          };
        }
        return (
          <Button
            variant="secondary"
            size="lg"
            disabled={loading}
            className="shadow-lg ring-1 ring-brand-red/20 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {loading ? "Preparing…" : menuLabel}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}
