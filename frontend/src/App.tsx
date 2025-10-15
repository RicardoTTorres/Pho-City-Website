
import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { ContentProvider } from "@/context/ContentContext";
import { Footer } from "@/sections/Footer";
import { footerConfig } from "@/config/footer.config";

export default function App() {
  return (
    <ContentProvider>
      <Navbar />
      
      <Hero />
      {}
    <Footer config={footerConfig} />
    </ContentProvider>
    
  );
}
