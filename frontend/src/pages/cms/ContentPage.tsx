import { HeroSectionEditor } from "@/sections/AdminDashboard/HeroSectionEditor";
import { AboutSectionEditor } from "@/sections/AdminDashboard/AboutSectionEditor";
import { ContactSectionEditor } from "@/sections/AdminDashboard/ContactSectionEditor";
import { useState } from "react";

export default function ContentPage() {
  const [activeSection, setActiveSection] = useState<"hero" | "about" | "contact">("hero");

  const sections = [
    { id: "hero" as const, label: "Hero Section" },
    { id: "about" as const, label: "About Section" },
    { id: "contact" as const, label: "Contact Section" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Edit text, images, and content across your site.</p>

      {/*Section Tabs*/}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors
              ${
                activeSection === section.id
                  ? "bg-white text-brand-red border-b-2 border-brand-red"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }
            `}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/*Section Content*/}
      <div>
        {activeSection === "hero" && <HeroSectionEditor />}
        {activeSection === "about" && <AboutSectionEditor />}
        {activeSection === "contact" && <ContactSectionEditor />}
      </div>
    </div>
  );
}
