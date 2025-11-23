
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { footerConfig } from "@/config/footer.config";
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import Menu from "./pages/Menu";
import { CMSLayout } from "@/layouts/CMSLayout";
import DashboardPage from "@/pages/cms/DashboardPage";
import MenuPage from "@/pages/cms/MenuPage";
import ContentPage from "@/pages/cms/ContentPage";
import MediaPage from "@/pages/cms/MediaPage";
import SettingsPage from "@/pages/cms/SettingsPage";
import UsersPage from "@/pages/cms/UsersPage";

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
      </Route>

      {/* Legacy route redirect */}
      <Route path="/adminpage*" element={<Navigate to="/cms/dashboard" replace />} />
    </Routes>
  );

  function NavFooter() {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>

        <Footer config={footerConfig} />
      </div>
    );
  }
}
