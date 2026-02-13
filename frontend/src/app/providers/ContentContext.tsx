//src/context/ContentContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type {
  FooterData,
  MenuData,
  RestaurantContent,
} from "@/shared/content/content.types";
import { defaultContent } from "@/shared/content/content";
import { getFooter } from "@/shared/api/footer";

interface ContentContextType {
  content: RestaurantContent;
  updateContent: (newContent: Partial<RestaurantContent>) => void;
  resetContent: () => void;
  refreshMenuPublic: () => Promise<void>;
  refreshMenuAdmin: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

function isValidMenuPayload(value: unknown): value is MenuData {
  if (typeof value !== "object" || value === null) return false;
  const categories = (value as { categories?: unknown }).categories;
  if (!Array.isArray(categories)) return false;

  return categories.every((category) => {
    if (typeof category !== "object" || category === null) return false;
    const menuCategory = category as { id?: unknown; name?: unknown };
    return menuCategory.id !== undefined && typeof menuCategory.name === "string";
  });
}

function isLikelyDatabaseMenu(value: MenuData): boolean {
  return value.categories.some((category) => /^[0-9]+$/.test(String(category.id)));
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [content, setContent] = useState<RestaurantContent>(defaultContent);
  const apiUrl = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");
  const isCmsRoute = pathname.startsWith("/cms");

  //Load menu items from backend API when the app starts
  //Replaces default static menu data in ContentContext with database content
  const updateContent = useCallback(
    (newContent: Partial<RestaurantContent>) => {
      setContent((prev) => ({
        ...prev,
        ...newContent,
      }));
    },
    [],
  );

  const refreshMenuPublic = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/menu`);
      if (!res.ok) {
        throw new Error(`Public menu request failed: ${res.status}`);
      }
      const data = await res.json();
      const menuData = data?.menu ?? data;
      if (!isValidMenuPayload(menuData)) {
        throw new Error("Public menu payload missing categories");
      }
      updateContent({ menuPublic: menuData });
    } catch (err) {
      console.error("Public menu fetch failed:", err);
    }
  }, [apiUrl, updateContent]);

  const refreshMenuAdmin = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/menu/admin`, {
        credentials: "include",
      });
      if (!res.ok) {
        // Do not keep stale/static placeholder admin menu when auth is missing.
        if (res.status === 401 || res.status === 403) {
          updateContent({ menuAdmin: null });
          return;
        }
        throw new Error(`Admin menu request failed: ${res.status}`);
      }
      const data = await res.json();
      const menuData = data?.menu ?? data;
      if (!isValidMenuPayload(menuData)) {
        throw new Error("Admin menu payload missing categories");
      }
      updateContent({ menuAdmin: menuData });
    } catch (err) {
      console.error("Admin menu fetch failed:", err);
    }
  }, [apiUrl, updateContent]);

  const refreshFooter = useCallback(async () => {
    try {
      const { footer }: { footer: FooterData } = await getFooter();
      updateContent({ footer });
    } catch (err) {
      console.error("Footer fetch failed:", err);
    }
  }, [updateContent]);

  useEffect(() => {
    refreshMenuPublic();
    refreshFooter();
    if (isCmsRoute) {
      refreshMenuAdmin();
    }
  }, [isCmsRoute, refreshFooter, refreshMenuAdmin, refreshMenuPublic]);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await fetch(`${apiUrl}/api/about`);
        const data = await res.json();

        updateContent({
          about: data.about,
        });
      } catch (err) {
        console.error("About fetch failed:", err);
      }
    }
    fetchAbout();
  }, [apiUrl, updateContent]);

  useEffect(() => {
    if (!isCmsRoute) return;

    async function fetchAdminUsers() {
      try {
        const res = await fetch(`${apiUrl}/api/adminUsers`, {
          credentials: "include",
        });
        const data = await res.json();

        updateContent({
          adminUsers: Array.isArray(data.adminUsers) ? data.adminUsers : [],
        });
      } catch (err) {
        console.error("Admin users fetch failed:", err);
      }
    }
    fetchAdminUsers();
  }, [apiUrl, isCmsRoute, updateContent]);

  // -> add /api/dashboard/stats
  useEffect(() => {
    if (!isCmsRoute) return;

    async function fetchDashboard() {
      try {
        const res = await fetch(`${apiUrl}/api/admin/dashboard/stats`, {
          credentials: "include",
        });
        const data = await res.json();

        updateContent({
          dashboard: data.dashboard,
        });
      } catch (err) {
        console.error("About fetch failed:", err);
      }
    }
    fetchDashboard();
  }, [apiUrl, isCmsRoute, updateContent]);

  //Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("pho-city-content");
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        if (!parsedContent.menuPublic && parsedContent.menu) {
          parsedContent.menuPublic = parsedContent.menu;
        }
        if (!parsedContent.menuAdmin && parsedContent.menu) {
          parsedContent.menuAdmin = parsedContent.menu;
        }
        if (!isValidMenuPayload(parsedContent.menuPublic)) {
          parsedContent.menuPublic = defaultContent.menuPublic;
        }
        if (
          !isValidMenuPayload(parsedContent.menuAdmin) ||
          !isLikelyDatabaseMenu(parsedContent.menuAdmin)
        ) {
          parsedContent.menuAdmin = defaultContent.menuAdmin;
        }
        setContent((prev) => ({
          ...prev,
          ...parsedContent,
        }));
      } catch (error) {
        console.error("Error loading saved content:", error);
      }
    }
  }, []);

  //Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("pho-city-content", JSON.stringify(content));
  }, [content]);

  const resetContent = useCallback(() => {
    setContent(defaultContent);
    localStorage.removeItem("pho-city-content");
  }, []);

  const value = useMemo(
    () => ({
      content,
      updateContent,
      resetContent,
      refreshMenuPublic,
      refreshMenuAdmin,
      refreshFooter,
    }),
    [
      content,
      updateContent,
      resetContent,
      refreshMenuPublic,
      refreshMenuAdmin,
      refreshFooter,
    ],
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
