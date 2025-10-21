
import { Navbar } from "@/sections/Navbar";
import { ContentProvider } from "@/context/ContentContext";
import { Footer } from "@/sections/Footer";
import { footerConfig } from "@/config/footer.config";
import {Routes, Route} from 'react-router-dom';
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import Menu from "./pages/Menu";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
      </Routes>
      <Footer config={footerConfig} />
    </>
  );
}
