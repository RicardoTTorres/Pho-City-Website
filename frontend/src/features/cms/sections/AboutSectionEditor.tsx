// src/features/cms/sections/AboutSectionEditor.tsx
import { useState, useRef, useEffect } from "react";
import { useContent } from "@/app/providers/ContentContext";
import { Button } from "@/shared/components/ui/button";
import AboutIcon from "@/shared/assets/About.svg";
import ImageIcon from "@/shared/assets/ImageIcon.svg";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { updateAbout, type AboutUpdatePayload } from "@/shared/api/about";

//using the constants to try and imitate the live preview of about page
const CANVAS_WIDTH = 1600;
const TEXT_MAX_WIDTH_PERCENT = 45;
const IMAGE_WIDTH_PIXELS = 650;
const CANVAS_PADDING = 50;
const H1_MARGIN_BOTTOM = 50;
const SCALE = 0.55;

//for user input
export function AboutSectionEditor() {
  const { content, updateContent } = useContent();
  const aboutContent = content.about;
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [scaledHeight, setScaledHeight] = useState<number>(0);

  // measuring preview size
  useEffect(() => {
    // Delay ensures the canvas has fully rendered before measuring
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const fullHeight = contentRef.current.offsetHeight;
        setScaledHeight(fullHeight * SCALE);
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [aboutContent]);

  //updating changed input/content
  const handleChange = <K extends keyof typeof aboutContent>(
    field: K,
    value: (typeof aboutContent)[K],
  ) => {
    updateContent({
      about: { ...aboutContent, [field]: value },
    });
  };

  //updates to database, should reflect on about pg as well
  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const data = await updateAbout(aboutContent);
      setMessage("About section updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  //layout for content editor and preview
  return (
    <section className="flex flex-col md:flex-row gap-6 w-full px-2 sm:px-6 py-4 sm:py-6">
      {/*Left Editor*/}
      <div className="flex-1 bg-gradient-to-b from-white to-[#FFF7F7] border border-[#FEE2E1] rounded-2xl shadow-md p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal mb-4">
          <div className="bg-[#16A34A] rounded-lg p-1.5 flex items-center justify-center">
            <img
              src={AboutIcon}
              alt="About Icon"
              className="w-4 h-4 brightness-0 invert"
            />
          </div>
          About Section Editor
        </h2>

        <div className="space-y-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Title
            </label>
            <input
              type="text"
              value={aboutContent.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Description
            </label>
            <textarea
              value={aboutContent.content}
              onChange={(e) => handleChange("content", e.target.value)}
              className="w-full rounded-lg bg-[#F5F1E8] border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 h-64 resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <ImageUpload
            section="about"
            currentUrl={aboutContent.imageUrl || null}
            onUploaded={(url) => handleChange("imageUrl", url)}
            label="About Image (optional)"
          />

          <div className="pt-4 flex justify-center">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-brand-red hover:bg-brand-red-hover text-white shadow-md shadow-black/10 px-8 py-2.5 rounded-md text-sm"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {message && (
            <p
              className={`mt-3 text-center text-sm ${
                message.includes("Error") ? "text-red-500" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/*Live preview*/}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-md p-6 border border-[#FEE2E1] flex flex-col">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal mb-4">
          <div className="bg-brand-cream rounded-lg p-1.5 flex items-center justify-center">
            <img
              src={ImageIcon}
              alt="Preview"
              className="w-4 h-4 text-brand-charcoal"
            />
          </div>
          Live Preview
        </h3>

        {/*Makes preview scrollable because its a bit long horizontally*/}
        <div
          className="relative mx-auto w-full overflow-x-auto overflow-y-hidden rounded-xl"
          style={{
            background: "#FFF9F8",
            border: "1px solid #FEE2E1",
            boxShadow: "0 0 6px rgba(0,0,0,0.06)",
            height: scaledHeight || "auto",
          }}
        >
          <div
            ref={contentRef}
            style={{
              width: CANVAS_WIDTH * SCALE,
              transform: `scale(${SCALE})`,
              transformOrigin: "top left",
              overflow: "visible",
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                width: CANVAS_WIDTH,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: CANVAS_PADDING,
              }}
            >
              <div style={{ maxWidth: `${TEXT_MAX_WIDTH_PERCENT}%` }}>
                <h1
                  style={{
                    marginBottom: H1_MARGIN_BOTTOM,
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: "#2B2B2B",
                  }}
                >
                  {aboutContent.title}
                </h1>
                <div
                  style={{
                    whiteSpace: "pre-line",
                    color: "#2B2B2B",
                    lineHeight: "1.6",
                    fontSize: "1rem",
                  }}
                >
                  {aboutContent.content}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <img
                  src={aboutContent.imageUrl}
                  alt="About Us"
                  style={{
                    width: IMAGE_WIDTH_PIXELS,
                    height: "auto",
                    borderRadius: 0,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
