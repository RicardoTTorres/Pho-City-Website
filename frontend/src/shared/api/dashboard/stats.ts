export async function getDashboardStats(apiUrl = "") {
    const res = await fetch(`${apiUrl}/api/admin/dashboard/stats`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(`Dashboard stats failed: ${res.status}`);
    }

    return res.json();
}