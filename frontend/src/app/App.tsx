// src/app/App.tsx
import { lazy, Suspense } from "react";
import { Navbar } from "@/features/public/sections/Navbar";
import { Footer } from "@/features/public/sections/Footer";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Home from "@/features/public/pages/Home";
import About from "@/features/public/pages/About";
import Contact from "@/features/public/pages/Contact";
import Menu from "@/features/public/pages/Menu";

// CMS + auth — only loaded when the user navigates to /cms/* or /adminlogin
const AdminLogin = lazy(() => import("@/features/auth/pages/AdminLogin"));
const CMSLayout = lazy(() =>
  import("@/features/cms/layouts/CMSLayout").then((m) => ({ default: m.CMSLayout })),
);
const DashboardPage = lazy(() => import("@/features/cms/pages/DashboardPage"));
const MenuPage = lazy(() => import("@/features/cms/pages/MenuPage"));
const ContentPage = lazy(() => import("@/features/cms/pages/ContentPage"));
const MediaPage = lazy(() => import("@/features/cms/pages/MediaPage"));
const UsersPage = lazy(() => import("@/features/cms/pages/UsersPage"));
const MessagesPage = lazy(() => import("@/features/cms/pages/MessagesPage"));
const SettingsPage = lazy(() => import("@/features/cms/pages/SettingsPage"));

function CMSFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="h-8 w-8 rounded-full border-4 border-brand-red border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes with navbar and footer */}
      <Route element={<NavFooter />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/menu" element={<Menu />} />
      </Route>

      {/* Admin routes without navbar/footer */}
      <Route
        path="/adminlogin"
        element={
          <Suspense fallback={<CMSFallback />}>
            <AdminLogin />
          </Suspense>
        }
      />

      {/* CMS routes with CMSLayout (floating sidebar) */}
      <Route
        path="/cms"
        element={
          <Suspense fallback={<CMSFallback />}>
            <CMSLayout />
          </Suspense>
        }
      >
        <Route index element={<Navigate to="/cms/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="registeradmin" element={<Navigate to="/cms/users" replace />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Legacy route redirect */}
      <Route
        path="/adminpage/*"
        element={<Navigate to="/cms/dashboard" replace />}
      />
    </Routes>
  );

  function NavFooter() {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>

        <Footer />
      </div>
    );
  }
}
