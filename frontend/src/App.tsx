
import { Navbar } from "@/sections/Navbar";
import { ContentProvider } from "@/context/ContentContext";
import { Footer } from "@/sections/Footer";
import { footerConfig } from "@/config/footer.config";
import {Routes, Route, Outlet} from 'react-router-dom';
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import Menu from "./pages/Menu";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<NavFooter />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/menu" element={<Menu />} />
      </Route>
      {/*routes with no footer or nav, such as admin*/}
      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/adminpage*" element={<AdminDashboard />} />
    </Routes>
  );

  function NavFooter() {
    return (
     <>
        <Navbar />
        <Outlet />
        <Footer config={footerConfig} />
      </>
    );
  }
}
