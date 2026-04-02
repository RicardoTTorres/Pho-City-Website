// src/features/auth/components/RequireAuth.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export function RequireAuth() {
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    fetch(`${API_URL}/api/auth/verify`, { credentials: "include" })
      .then((res) => setStatus(res.ok ? "ok" : "fail"))
      .catch(() => setStatus("fail"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="h-8 w-8 rounded-full border-4 border-brand-red border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === "fail") {
    return <Navigate to="/adminlogin" replace />;
  }

  return <Outlet />;
}
