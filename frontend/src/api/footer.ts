const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type FooterData = {
    navLinks: {
        label: string;
        path: string;
        external?: boolean;
    }[];
    contact: {
        address: string;
        cityZip: string;
        phone: string;
    };
    socialLinks: {
        platform: string;
        url: string;
        icon?: string;  
    }[];
};

export async function getFooter() {
    const res = await fetch(`${API_URL}/api/footer`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<{footer: FooterData}>;
}

export async function updateFooter(footer: FooterData) {
    const res = await fetch(`${API_URL}/api/footer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ footer })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}