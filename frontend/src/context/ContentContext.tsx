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
import type { FooterData, RestaurantContent } from "@/content/content.types";
import { defaultContent } from "@/content/content";
import { getFooter } from "@/api/footer";

interface ContentContextType {
  content: RestaurantContent;
  updateContent: (newContent: Partial<RestaurantContent>) => void;
  resetContent: () => void;
  refreshMenuPublic: () => Promise<void>;
  refreshMenuAdmin: () => Promise<void>;
  refreshFooter: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<RestaurantContent>(defaultContent);


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
      const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${url}/api/menu`);
      const data = await res.json();
      const menuData = data?.menu ?? data;
      updateContent({ menuPublic: menuData });
    } catch (err) {
      console.error("Public menu fetch failed:", err);
    }
  }, [updateContent]);

  const refreshMenuAdmin = useCallback(async () => {
    try {
      const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${url}/api/menu/admin`);
      const data = await res.json();
      const menuData = data?.menu ?? data;
      updateContent({ menuAdmin: menuData });
    } catch (err) {
      console.error("Admin menu fetch failed:", err);
    }
  }, [updateContent]);

  const refreshFooter = useCallback(async () => {
    try {
      const data = await getFooter();
     
      const footer = (data as { footer?: FooterData }).footer ?? (data as FooterData);
      updateContent({ footer });
    } catch (err) {
      console.error("Footer fetch failed:", err);
    }
  }, [updateContent]);

  useEffect(() => {
    refreshMenuPublic();
    refreshMenuAdmin();
    refreshFooter();
  }, [refreshMenuPublic, refreshMenuAdmin, refreshFooter]);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${url}/api/about`);
        const data = await res.json();

        updateContent({
          about: data.about,
        });
      } catch (err) {
        console.error("About fetch failed:", err);
      }
    }
    fetchAbout();
  }, []);

  useEffect(() => {
    async function fetchAdminUsers() {
      try {
        const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${url}/api/adminUsers`);
        const data = await res.json();
   
        const adminUsers = Array.isArray(data.adminUsers)
          ? data.adminUsers
          : [];

        updateContent({
          adminUsers,
        });
      } catch (err) {
        console.error("Admin users fetch failed:", err);
      }
    }
    fetchAdminUsers();
  }, [updateContent]);


  useEffect(() => {
    async function fetchDashboard() {
      try {
        const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${url}/api/admin/dashboard/stats`);
        const data = await res.json();

        updateContent({
          dashboard: data.dashboard,
        });
      } catch (err) {
        console.error("About fetch failed:", err);
      }
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    const savedContent = localStorage.getItem("pho-city-content");
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContent((prev) => ({
          ...prev,
          ...parsedContent,
          menuPublic:
            parsedContent.menuPublic ??
            parsedContent.menu ??
            prev.menuPublic,
          menuAdmin:
            parsedContent.menuAdmin ?? parsedContent.menu ?? prev.menuAdmin,
          footer: parsedContent.footer ?? prev.footer,
          adminUsers: Array.isArray(parsedContent.adminUsers)
            ? parsedContent.adminUsers
            : prev.adminUsers,
        }));
      } catch (error) {
        console.error("Error loading saved content:", error);
      }
    }
  }, []);

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
