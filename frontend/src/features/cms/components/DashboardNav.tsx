// src/features/cms/components/DashboardNav.tsx
import {
  LayoutDashboard,
  Utensils,
  FileText,
  Image,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { navConfig } from "@/shared/config/nav.config";

interface DashboardNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function DashboardNav({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: DashboardNavProps) {
  const location = useLocation();
  const role = "admin"; //placeholder: replace with real auth role

  const baseTabs = [
    { name: "Dashboard", path: "/cms/dashboard", icon: LayoutDashboard },
    { name: "Menu", path: "/cms/menu", icon: Utensils },
    { name: "Content", path: "/cms/content", icon: FileText },
    { name: "Media", path: "/cms/media", icon: Image },
  ] as const;

  const tabs =
    role === "admin"
      ? [
          { name: "Dashboard", path: "/cms/dashboard", icon: LayoutDashboard },
          { name: "Users", path: "/cms/users", icon: Users },
          ...baseTabs.slice(1),
        ]
      : baseTabs;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-4 bottom-4 left-4 z-50 flex flex-col justify-between
          bg-white/80 backdrop-blur-md border border-gray-100
          shadow-xl shadow-gray-200/80 rounded-2xl
          transition-all duration-300 ease-in-out
          ${collapsed ? "md:w-20" : "md:w-64"} w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"} md:translate-x-0
        `}
      >
        {/*Top Section*/}
        <div className="p-4 flex items-center justify-between">
          {collapsed && (
            <img
              src="/PhoFavicon.png"
              alt={navConfig.brand.name}
              className="h-8 w-auto transition-all duration-300 hidden md:block"
            />
          )}
          <button
            onClick={() => {
              // On mobile, close the drawer; on desktop, toggle collapse
              if (window.innerWidth < 768) {
                setMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="text-gray-500 hover:text-brand-red transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={20} className="hidden md:block" />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/*Navigation Links*/}
        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto">
          {tabs.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium
                transition-all duration-200
                ${collapsed ? "md:justify-center" : "justify-start"}
                ${
                  isActive(path)
                    ? "bg-brand-red text-white"
                    : "text-gray-700 hover:bg-brand-red/10 hover:text-brand-red"
                }
              `}
              aria-label={name}
            >
              <Icon size={20} />
              {!collapsed && <span className="md:inline">{name}</span>}
              {collapsed && <span className="md:hidden">{name}</span>}
            </Link>
          ))}
        </nav>

        {/*Help Box*/}
        <div
          className={`m-4 p-3 rounded-xl bg-gray-50 border text-center text-xs text-gray-500 transition-all
            ${collapsed ? "hidden md:hidden" : "block"}
          `}
        >
          Need help? <br />
          <a
            href="/cms/usermanual"
            className="text-brand-red font-semibold hover:underline"
          >
            Documentation
          </a>
        </div>
      </aside>
    </>
  );
}
