import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardNav } from "@/components/cms/DashboardNav";
import { CMSHeader } from "@/components/cms/CMSHeader";

export function CMSLayout() {
  const [collapsed, setCollapsed] = useState(false);

  // ---- DARK MODE STATE ----
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("cms-theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("cms-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

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
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ease-in-out pt-4 pr-4 pb-4 min-h-screen
          ${collapsed ? "ml-[6rem]" : "ml-[18rem]"}
        `}
      >
        {/* Header */}
        <CMSHeader theme={theme} toggleTheme={toggleTheme} />

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
