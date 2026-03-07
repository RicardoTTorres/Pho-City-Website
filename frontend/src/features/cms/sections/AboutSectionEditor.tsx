// src/features/cms/sections/AboutSectionEditor.tsx
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useContent } from "@/app/providers/ContentContext";
import { Button } from "@/shared/components/ui/button";
import AboutIcon from "@/shared/assets/About.svg";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { getAbout, updateAbout, type AboutContent } from "@/shared/api/about";

interface CollapsiblePanelProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsiblePanel({
  title,
  defaultOpen = false,
  children,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-brand-gold/25 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white to-brand-cream text-sm font-semibold text-brand-charcoal hover:from-brand-cream hover:to-brand-cream/70 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-brand-charcoal/60 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-4 bg-brand-cream/40">
          {children}
        </div>
      )}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg bg-warm-cream border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50";

const TEXTAREA_CLASS =
  "w-full rounded-lg bg-warm-cream border-2 border-brand-gold text-brand-charcoal text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-brand-charcoal mb-1">
      {children}
    </label>
  );
}

const EMPTY_ABOUT: AboutContent = {
  heroTitle: "",
  heroIntro: "",
  heroImage: null,
  beginningTitle: "",
  beginningBody: "",
  foodTitle: "",
  foodBody: "",
  foodImage: null,
  commitmentTitle: "",
  commitmentBody: "",
  closingText: "",
  previewHeading: "",
  previewBody: "",
  previewButtonLabel: "",
};

export function AboutSectionEditor() {
  const { updateContent } = useContent();

  const [form, setForm] = useState<AboutContent>(EMPTY_ABOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAbout()
      .then((data) => setForm(data))
      .catch(() => setMessage("Error loading about content."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = <K extends keyof AboutContent>(
    field: K,
    value: AboutContent[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateAbout(form);
      updateContent({ about: form });
      setMessage("About section saved!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error saving changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full px-2 sm:px-6 py-4 sm:py-6">
      {/* Editor card */}
      <div className="bg-gradient-to-b from-white to-brand-cream/60 border border-brand-gold/25 rounded-2xl shadow-md p-6">
        {/* Header */}
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal mb-6">
          <div className="bg-brand-red rounded-lg p-1.5 flex items-center justify-center">
            <img
              src={AboutIcon}
              alt="About Icon"
              className="w-4 h-4 brightness-0 invert"
            />
          </div>
          About Section Editor
        </h2>

        {loading ? (
          <div className="text-sm text-gray-500 py-4">
            Loading about content…
          </div>
        ) : (
          <div className="space-y-3">
            <CollapsiblePanel title="Homepage Preview" defaultOpen={false}>
              <div>
                <FieldLabel>Section Heading</FieldLabel>
                <input
                  type="text"
                  value={form.previewHeading ?? ""}
                  onChange={(e) =>
                    handleChange("previewHeading", e.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Body Text</FieldLabel>
                <textarea
                  value={form.previewBody ?? ""}
                  onChange={(e) => handleChange("previewBody", e.target.value)}
                  className={`${TEXTAREA_CLASS} h-28`}
                />
              </div>
              <div>
                <FieldLabel>Button Label</FieldLabel>
                <input
                  type="text"
                  value={form.previewButtonLabel ?? ""}
                  onChange={(e) =>
                    handleChange("previewButtonLabel", e.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Hero" defaultOpen>
              <div>
                <FieldLabel>Page Title</FieldLabel>
                <input
                  type="text"
                  value={form.heroTitle}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Intro Text</FieldLabel>
                <textarea
                  value={form.heroIntro}
                  onChange={(e) => handleChange("heroIntro", e.target.value)}
                  className={`${TEXTAREA_CLASS} h-28`}
                />
              </div>
              <ImageUpload
                section="about"
                currentUrl={form.heroImage || null}
                onUploaded={(url) => handleChange("heroImage", url)}
                label="Hero Image (optional)"
              />
            </CollapsiblePanel>

            <CollapsiblePanel title="Section 1">
              <div>
                <FieldLabel>Section Title</FieldLabel>
                <input
                  type="text"
                  value={form.beginningTitle}
                  onChange={(e) =>
                    handleChange("beginningTitle", e.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Body</FieldLabel>
                <textarea
                  value={form.beginningBody}
                  onChange={(e) =>
                    handleChange("beginningBody", e.target.value)
                  }
                  className={`${TEXTAREA_CLASS} h-28`}
                />
              </div>
            </CollapsiblePanel>
            <CollapsiblePanel title="Section 2">
              <div>
                <FieldLabel>Section Title</FieldLabel>
                <input
                  type="text"
                  value={form.foodTitle}
                  onChange={(e) => handleChange("foodTitle", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Body</FieldLabel>
                <textarea
                  value={form.foodBody}
                  onChange={(e) => handleChange("foodBody", e.target.value)}
                  className={`${TEXTAREA_CLASS} h-28`}
                />
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Section 3">
              <div>
                <FieldLabel>Section Title</FieldLabel>
                <input
                  type="text"
                  value={form.commitmentTitle}
                  onChange={(e) =>
                    handleChange("commitmentTitle", e.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Body</FieldLabel>
                <textarea
                  value={form.commitmentBody}
                  onChange={(e) =>
                    handleChange("commitmentBody", e.target.value)
                  }
                  className={`${TEXTAREA_CLASS} h-28`}
                />
              </div>
            </CollapsiblePanel>

            <div className="pt-4 flex justify-center">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-red hover:bg-brand-red-hover text-white shadow-md shadow-black/10 px-8 py-2.5 rounded-md text-sm"
              >
                {saving ? "Saving…" : "Save Changes"}
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
        )}
      </div>
    </section>
  );
}
