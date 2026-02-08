const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getTraffic() {
    const res = await fetch(`${API_URL}/api/admin/analytics/traffic`);
    if (!res.ok) throw new Error("Error fetching traffic data");
    const data = await res.json();
    return data;
}

export async function postTraffic(path: string) {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("visitor_id", id);
    }

    const res = await fetch(
        `${API_URL}/api/admin/analytics/traffic`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uuid: id,
                path: path
            })
        }
    );
    
    if (!res.ok) console.warn('Error logging traffic');
}