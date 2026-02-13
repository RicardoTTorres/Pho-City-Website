
import { Navbar } from "@/features/public/sections/Navbar";
import { Footer } from "@/features/public/sections/Footer";
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Home from "@/features/public/pages/Home";
import About from "@/features/public/pages/About";
import Contact from "@/features/public/pages/Contact";
import AdminLogin from "@/features/auth/pages/AdminLogin";
import Menu from "@/features/public/pages/Menu";
import { CMSLayout } from "@/features/cms/layouts/CMSLayout";
import DashboardPage from "@/features/cms/pages/DashboardPage";
import MenuPage from "@/features/cms/pages/MenuPage";
import ContentPage from "@/features/cms/pages/ContentPage";
import MediaPage from "@/features/cms/pages/MediaPage";
import SettingsPage from "@/features/cms/pages/SettingsPage";
import UsersPage from "@/features/cms/pages/UsersPage";
import RegisterAdminPage from "@/features/cms/pages/RegisterAdminPage";

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
      <Route path="/adminlogin" element={<AdminLogin />} />

      {/* CMS routes with CMSLayout (floating sidebar) */}
      <Route path="/cms" element={<CMSLayout />}>
        <Route index element={<Navigate to="/cms/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="registeradmin" element={<RegisterAdminPage />} />
      </Route>

      {/* Legacy route redirect */}
      <Route
        path="/adminpage*"
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
