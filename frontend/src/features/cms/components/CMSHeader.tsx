// src/features/cms/components/CMSHeader.tsx
import { Search, Settings, LogOut, Sun, Moon, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

export type CMSHeaderProps = {
  title?: string;
  showSearch?: boolean;
  toggleTheme: () => void;
  theme: string;
  onMenuToggle?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function CMSHeader({
  title: forcedTitle,
  showSearch: forcedSearch,
  toggleTheme,
  theme,
  onMenuToggle,
  searchValue,
  onSearchChange,
}: CMSHeaderProps) {
  const API_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "";
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { title, showSearch } = useMemo(() => {
    if (forcedTitle || typeof forcedSearch === "boolean") {
      return { title: forcedTitle ?? "", showSearch: forcedSearch ?? false };
    }

    const path = location.pathname.toLowerCase();
    const map: Record<string, { t: string; s: boolean } | undefined> = {
      "/cms": { t: "Dashboard", s: false },
      "/cms/dashboard": { t: "Dashboard", s: false },
      "/cms/menu": { t: "Menu", s: true },
      "/cms/media": { t: "Media Library", s: true },
      "/cms/usermanual": { t: "User-manual", s: true },
    };

    const entry = map[path] ?? {
      t:
        path
          .split("/")
          .pop()
          ?.replace(/[-_]/g, " ")
          ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "CMS",
      s: false,
    };

    return { title: entry.t, showSearch: entry.s };
  }, [location.pathname, forcedTitle, forcedSearch]);

  // Close menu events
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors on logout
    } finally {
      window.location.href = "/adminlogin";
    }
  }

  return (
    <div className="sticky top-4 z-40 mb-4">
      <div
        className="flex items-center gap-3 justify-between
          bg-white/80 dark:bg-[#2A2A2A]/90 
          border border-gray-100 dark:border-[#3A3A3A]
          shadow-sm rounded-xl px-4 py-3 transition-colors"
      >
        {/* Mobile menu button + Title */}
        <div className="flex items-center gap-2 min-w-0">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-lg
                         hover:bg-gray-100 dark:hover:bg-[#3A3A3A]
                         text-gray-600 dark:text-gray-100 transition"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate">
            {title}
          </h1>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="hidden sm:flex items-center w-full max-w-md gap-2">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="search"
                placeholder="Search..."
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full bg-white/70 dark:bg-[#2A2A2A] 
                           dark:text-gray-100 border border-gray-200 dark:border-[#3A3A3A]
                           rounded-lg pl-9 pr-3 py-2 text-sm shadow-inner 
                           focus:ring-2 focus:ring-brand-red/40 outline-none"
              />
            </div>
          </div>
        )}

        {/* User + Settings + Theme Toggle */}
        <div className="relative" ref={menuRef}>
          <div className="flex items-center gap-2 shrink-0">
            {/* DARK MODE TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-[#3A3A3A]
                         text-gray-600 dark:text-gray-100 transition"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-[#3A3A3A]
                         text-gray-600 dark:text-gray-100 transition"
            >
              <Settings size={18} />
            </button>

            {/* Avatar */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-9 w-9 rounded-full 
                         bg-gray-200 dark:bg-[#3A3A3A] 
                         text-gray-700 dark:text-gray-100
                         flex items-center justify-center font-semibold 
                         hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-500 transition"
            >
              HT
            </button>
          </div>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 
                bg-white/90 dark:bg-[#2A2A2A]/90 backdrop-blur-md 
                border border-gray-100 dark:border-[#3A3A3A]
                shadow-xl rounded-xl overflow-hidden z-50 transition-colors"
            >
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                Signed in as
              </div>

              <div className="px-3 pb-2 text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                phocity-admin
              </div>

              <div className="h-px bg-gray-100 dark:bg-[#3A3A3A]" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm 
                           text-red-600 dark:text-red-400 
                           hover:bg-red-50 dark:hover:bg-red-900/40 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
