import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardNav } from "@/components/cms/DashboardNav";
import { CMSHeader } from "@/components/cms/CMSHeader";

export function CMSLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-gold-50 to-brand-gold-100">
      {/*Floating Sidebar*/}
      <DashboardNav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/*Main Content Area with dynamic margin*/}
      <main
        className={`transition-all duration-300 ease-in-out pt-4 pr-4 pb-4 min-h-screen
          ${collapsed ? "ml-[6rem]" : "ml-[18rem]"}
        `}
      >
        {/*Top header bar*/}
        <CMSHeader />

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 min-h-full p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
