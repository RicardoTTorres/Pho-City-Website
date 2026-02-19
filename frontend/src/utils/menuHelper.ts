// src/utils/menuHelper.ts
export function parseBilingualName(name: string): {
    vietnamese: string | null;
    english: string;
  } {
    const raw = (name ?? "").trim();
  
    const match = raw.match(/^\[([^\]]+)\]\s*(.+)$/);
  
    if (!match) {
      return { vietnamese: null, english: raw };
    }
  
    const vietnamese = match[1]?.trim() || null;
    const english = match[2]?.trim() || raw;
  
    return { vietnamese, english };
  }
  