import type { FooterData } from "@/shared/content/content.types";

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

let footerInFlight: Promise<{ footer: FooterData }> | null = null;

export async function getFooter() {
    if (footerInFlight) return footerInFlight;

    footerInFlight = (async () => {
        const res = await fetch(`${API_URL}/api/footer`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as { footer: FooterData };
    })();

    try {
        return await footerInFlight;
    } finally {
        footerInFlight = null;
    }
}

export async function updateFooter(footer: FooterData) {
    const res = await fetch(`${API_URL}/api/footer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ footer })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
