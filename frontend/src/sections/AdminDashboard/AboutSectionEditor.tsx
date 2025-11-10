import React, { useState, useEffect } from "react";
import { defaultContent } from "@/content/content";
import { Button } from "@/components/ui/button";
import AboutIcon from "@/assets/About.svg";
import ImageIcon from "@/assets/ImageIcon.svg";
import aboutUs from "@/assets/aboutUs.png";

type LocalAbout = typeof defaultContent.about;

//for user input
export function AboutSectionEditor() {
  const [aboutContent, setAboutContent] = useState<LocalAbout>({
    title: defaultContent.about.title,
    content: defaultContent.about.content,
  });

const [isSaving, setIsSaving] = useState(false);
const [message, setMessage] = useState("");

//Get the about content from the backend, and load it
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${url}/api/about`);
        const data = await res.json();
        if (data?.about) {
          setAboutContent({
            title: data.about.title,
            content: data.about.content,
          });
        }
      } catch (err) {
        console.error("Error fetching About section:", err);
      }
    };
    fetchAbout();
  }, []);

  //updates to database, should reflect on about pg as well
  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${url}/api/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aboutContent.title,
          content: aboutContent.content,
        }),
      });
      if (!res.ok) throw new Error("Failed to update About section.");
      const data = await res.json();
      setMessage(data.message || "About section updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

return (
    <section className="flex flex-col md:flex-row gap-6 w-full px-6 py-6">
      <div className="flex-1 bg-gradient-to-b from-white to-[#FFF7F7] border border-[#FEE2E1] rounded-2xl shadow-md p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal mb-4">
          <div className="bg-[#16A34A] rounded-lg p-1.5 flex items-center justify-center">
            <img src={AboutIcon} alt="About Icon" className="w-4 h-4 brightness-0 invert" />
          </div>
          About Section Content
        </h2>

        <div className="space-y-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">Title</label>
            <input
              type="text"
              value={aboutContent.title}
              onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">Description</label>
            <textarea
              value={aboutContent.content}
              onChange={(e) => setAboutContent({ ...aboutContent, content: e.target.value })}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 h-64 resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-brand-red hover:bg-brand-red-hover text-white shadow-md shadow-black/10 px-8 py-2.5 rounded-md text-sm"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/*Live preview*/}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-md p-6 border border-[#FEE2E1]">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal mb-4">
          <div className="bg-brand-cream rounded-lg p-1.5 flex items-center justify-center">
            <img src={ImageIcon} alt="Preview" className="w-4 h-4 text-brand-charcoal" />
          </div>
          Live Preview
        </h3>
        <div className="text-sm text-gray-500 italic">Gonna work on this some more soon</div>
      </div>
    </section>
  );
}