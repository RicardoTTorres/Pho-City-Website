import { HeroSectionEditor } from "@/features/cms/sections/HeroSectionEditor";
import { AboutSectionEditor } from "@/features/cms/sections/AboutSectionEditor";
import { ContactSectionEditor } from "@/features/cms/sections/ContactSectionEditor";
import { NavbarSectionEditor } from "@/features/cms/sections/NavbarSectionEditor";
import FooterSectionEditor from "@/features/cms/sections/FooterSectionEditor";
import { useCallback, useEffect, useState } from "react";
import type { FooterData } from "@/shared/content/content.types";
import { useContent } from "@/app/providers/ContentContext";
import { getFooter, updateFooter } from "@/shared/api/footer";

export default function ContentPage() {
  const { content, updateContent } = useContent();
  const [activeSection, setActiveSection] = useState<
    "hero" | "about" | "contact" | "navbar" | "footer"
  >("hero");
  const [footerLoading, setFooterLoading] = useState(false);
  const [footerLoaded, setFooterLoaded] = useState(false);

  const sections = [
    { id: "hero" as const, label: "Hero Section" },
    { id: "about" as const, label: "About Section" },
    { id: "contact" as const, label: "Contact Section" },
    { id: "navbar" as const, label: "Navbar Section" },
    { id: "footer" as const, label: "Footer Section" },
  ];

  const refreshFooter = useCallback(async () => {
    const latest = await getFooter();
    updateContent({ footer: latest.footer });
  }, [updateContent]);

  useEffect(() => {
    if (activeSection !== "footer" || footerLoaded) return;
    let active = true;
    setFooterLoading(true);
    (async () => {
      try {
        await refreshFooter();
      } finally {
        if (active) {
          setFooterLoading(false);
          setFooterLoaded(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [activeSection, footerLoaded, refreshFooter]);

  const handleFooterSave = async (payload: FooterData) => {
    await updateFooter(payload);
    await refreshFooter();
    setFooterLoaded(true);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Edit text, images, and content across your site.
      </p>

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
        {activeSection === "navbar" && <NavbarSectionEditor />}
        {activeSection === "footer" && (
          <FooterSectionEditor
            footer={content.footer}
            loading={footerLoading}
            onSave={handleFooterSave}
          />
        )}
      </div>
    </div>
  );
}
