// src/features/public/pages/Home.tsx
import { Hero } from "@/features/public/sections/Hero";
import AboutPreviewSection from "@/features/public/sections/AboutPreviewSection";
import MenuPreview from "@/features/public/sections/MenuPreview";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreviewSection />
      <MenuPreview />
    </>
  );
}
