// src/features/cms/layouts/CMSLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { DashboardNav } from "@/features/cms/components/DashboardNav";
import { CMSHeader } from "@/features/cms/components/CMSHeader";

export function CMSLayout() {
  const API_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "";
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // ---- DARK MODE STATE ----
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("cms-theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const res = await fetch(`${API_URL}/api/admin/verify`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({ ok: false }));
        if (!res.ok || !data?.ok) {
          if (active)
            navigate("/adminlogin", {
              replace: true,
              state: { from: location.pathname },
            });
          return;
        }
      } catch {
        if (active)
          navigate("/adminlogin", {
            replace: true,
            state: { from: location.pathname },
          });
        return;
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    verifySession();
    return () => {
      active = false;
    };
  }, [API_URL, location.pathname, navigate]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("cms-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking admin session...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b
             from-[#F5F5F5] to-[#EAEAEA]
             dark:from-[#1E1E1E] dark:to-[#2A2A2A]
             dark:text-gray-100 transition-colors duration-300"
    >
      {/* Sidebar */}
      <DashboardNav
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ease-in-out pt-4 px-4 pb-4 min-h-screen
          md:pl-4 md:pr-4
          ${collapsed ? "md:ml-[6rem]" : "md:ml-[18rem]"}
        `}
      >
        {/* Header */}
        <CMSHeader
          theme={theme}
          toggleTheme={toggleTheme}
          onMenuToggle={() => setMobileOpen(true)}
        />

        {/* Main Card */}
        <div
          className="bg-white/70 dark:bg-[#2A2A2A]/90 
                     backdrop-blur-sm rounded-2xl shadow-lg 
                     border border-gray-200 dark:border-[#3A3A3A]
                     min-h-full p-6 transition-colors"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
