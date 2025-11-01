import { Search, Settings, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

export type CMSHeaderProps = {
  title?: string;
  showSearch?: boolean;
};

export function CMSHeader(props: CMSHeaderProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { title, showSearch } = useMemo(() => {
    if (props.title || typeof props.showSearch === "boolean") {
      return { title: props.title ?? "", showSearch: props.showSearch ?? false };
    }

    const path = location.pathname.toLowerCase();
    const map: Record<string, { t: string; s: boolean } | undefined> = {
      "/cms": { t: "Dashboard", s: false },
      "/cms/dashboard": { t: "Dashboard", s: false },
      "/cms/menu": { t: "Menu", s: true },
      "/cms/content": { t: "Content", s: true },
      "/cms/media": { t: "Media Library", s: true },
      "/cms/settings": { t: "Settings", s: false },
    };

    const entry = map[path] ?? { t: path.split("/").pop()?.replace(/[-_]/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "CMS", s: false };
    return { title: entry.t, showSearch: entry.s };
  }, [location.pathname, props.title, props.showSearch]);

  //Close menu on outside click or Escape
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="sticky top-4 z-40 mb-4">
      <div className="flex items-center gap-3 justify-between bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm rounded-xl px-4 py-3">
        {/*Left: Title */}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-800 truncate">{title}</h1>
        </div>

        {/*Middle: Search*/}
        {showSearch && (
          <div className="hidden sm:flex items-center w-full max-w-md gap-2">
            <div className="relative w-full">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="search"
                placeholder="Search..."
                className="w-full bg-white/70 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm shadow-inner focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40 outline-none"
              />
            </div>
          </div>
        )}

        {/*Right: Avatar / Settings + User Menu*/}
        <div className="relative" ref={menuRef}>
          <div className="flex items-center gap-2 shrink-0">
            {/*Avatar placeholder*/}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="h-9 w-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold select-none hover:ring-2 hover:ring-gray-300 transition"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open user menu"
            >
              HT
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open settings"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition"
            >
              <Settings size={18} />
            </button>
          </div>

          {menuOpen && (
            <div
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-2 w-44 bg-white/90 backdrop-blur-md border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50"
            >
              <div className="px-3 py-2 text-xs text-gray-500">Signed in as</div>
              <div className="px-3 pb-2 text-sm font-medium text-gray-800 truncate">phocity-admin</div>
              <div className="h-px bg-gray-100" />
              <Link
                to="/cms/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                onClick={() => setMenuOpen(false)}
              >
                <User size={16} /> Profile
              </Link>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                onClick={() => {
                  setMenuOpen(false);
                  //Placeholder for real auth logout flow
                  window.location.href = "/adminlogin";
                }}
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
