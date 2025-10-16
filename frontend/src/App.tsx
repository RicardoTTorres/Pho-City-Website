
import { Navbar } from "@/sections/Navbar";
import { ContentProvider } from "@/context/ContentContext";
import { Footer } from "@/sections/Footer";
import { footerConfig } from "@/config/footer.config";
import Home from "@/pages/Home";

export default function App() {
  return (
    <ContentProvider>
      <Navbar />
      <Home />  
      <Footer config={footerConfig} />
    </ContentProvider>
  );
}
