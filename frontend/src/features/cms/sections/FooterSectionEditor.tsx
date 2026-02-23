// src/sections/cms/FooterSectionEditor.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2, GripVertical, Plus, Footprints, Save } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import type { FooterData } from "@/shared/content/content.types";

const DEFAULT_LOGO = "/logo.png";
const DEFAULT_INSTAGRAM_ICON = "/instagram_icon.png";

type FooterSectionEditorProps = {
  footer: FooterData;
  loading: boolean;
  onSave: (payload: FooterData) => Promise<void>;
};

function pickString(value: unknown, defaultValue: string) {
  if (typeof value !== "string") return defaultValue;
  const trimmed = value.trim();
  return trimmed ? trimmed : defaultValue;
}

function normalizeFooter(footer: FooterData): FooterData {
  const socialLinks = Array.isArray(footer.socialLinks)
    ? footer.socialLinks
    : [];
  const instagram = socialLinks.find((s) => s.platform === "instagram") ?? {
    platform: "instagram",
    url: "",
    icon: DEFAULT_INSTAGRAM_ICON,
  };

  return {
    brand: {
      name: typeof footer.brand?.name === "string" ? footer.brand.name : "",
      logo: pickString(footer.brand?.logo, DEFAULT_LOGO),
    },
    navLinks: (footer.navLinks ?? []).map((link) => ({
      label: typeof link.label === "string" ? link.label : "",
      path: typeof link.path === "string" ? link.path : "",
      external: typeof link.external === "boolean" ? link.external : false,
    })),
    socialLinks: [
      {
        platform: "instagram",
        url: typeof instagram.url === "string" ? instagram.url : "",
        icon: pickString(instagram.icon, DEFAULT_INSTAGRAM_ICON),
      },
    ],
    contact: {
      address:
        typeof footer.contact?.address === "string"
          ? footer.contact.address
          : "",
      cityZip:
        typeof footer.contact?.cityZip === "string"
          ? footer.contact.cityZip
          : "",
      phone:
        typeof footer.contact?.phone === "string" ? footer.contact.phone : "",
    },
  };
}

export default function FooterSectionEditor({
  footer,
  loading,
  onSave,
}: FooterSectionEditorProps) {
  const initialFooter = useMemo(() => normalizeFooter(footer), [footer]);

  const [brandName, setBrandName] = useState(initialFooter.brand.name);
  const [footerLogo, setFooterLogo] = useState(initialFooter.brand.logo);

  const [navLinks, setNavLinks] = useState([...initialFooter.navLinks]);

  const initialInstagram = initialFooter.socialLinks[0] ?? {
    platform: "instagram",
    url: "",
    icon: DEFAULT_INSTAGRAM_ICON,
  };
  const [instagramUrl, setInstagramUrl] = useState(initialInstagram.url);
  const [instagramIcon, setInstagramIcon] = useState(
    initialInstagram.icon ?? DEFAULT_INSTAGRAM_ICON,
  );

  const [address, setAddress] = useState(initialFooter.contact.address);
  const [cityZip, setCityZip] = useState(initialFooter.contact.cityZip);
  const [phone, setPhone] = useState(initialFooter.contact.phone);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [saveError, setSaveError] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const didInitRef = useRef(false);

  const syncFromFooter = useCallback((next: FooterData) => {
    const normalized = normalizeFooter(next);

    setBrandName(normalized.brand.name);
    setFooterLogo(normalized.brand.logo);
    setNavLinks([...normalized.navLinks]);

    const ig = normalized.socialLinks[0] ?? {
      platform: "instagram",
      url: "",
      icon: DEFAULT_INSTAGRAM_ICON,
    };
    setInstagramUrl(ig.url);
    setInstagramIcon(ig.icon ?? DEFAULT_INSTAGRAM_ICON);

    setAddress(normalized.contact.address);
    setCityZip(normalized.contact.cityZip);
    setPhone(normalized.contact.phone);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!didInitRef.current) {
      syncFromFooter(footer);
      didInitRef.current = true;
      return;
    }
  }, [footer, loading, syncFromFooter]);

  const markDirty = () => {
    dirtyRef.current = true;
  };
  async function handleSave() {
    const normalizedNavLinks = navLinks.map((link) => ({
      label: typeof link.label === "string" ? link.label : "",
      path: typeof link.path === "string" ? link.path : "",
      external: typeof link.external === "boolean" ? link.external : false,
    }));

    const payloadFooter: FooterData = {
      brand: {
        name: typeof brandName === "string" ? brandName : "",
        logo: pickString(footerLogo, DEFAULT_LOGO),
      },
      navLinks: normalizedNavLinks,
      socialLinks: [
        {
          platform: "instagram",
          url: typeof instagramUrl === "string" ? instagramUrl : "",
          icon: pickString(instagramIcon, DEFAULT_INSTAGRAM_ICON),
        },
      ],
      contact: {
        address: typeof address === "string" ? address : "",
        cityZip: typeof cityZip === "string" ? cityZip : "",
        phone: typeof phone === "string" ? phone : "",
      },
    };

    try {
      setSaving(true);

      await onSave(payloadFooter);
      dirtyRef.current = false;
      setFooterLogo(payloadFooter.brand.logo);
      setInstagramIcon(
        payloadFooter.socialLinks[0]?.icon ?? DEFAULT_INSTAGRAM_ICON,
      );
      setNavLinks([...normalizedNavLinks]);
      setSaveSuccess("Footer saved successfully!");
      setTimeout(() => setSaveSuccess(null), 3000);

      setSaveError(null);
    } catch (err) {
      console.error("Footer update failed:", err);
      setSaveError("Failed to save footer changes.");
    } finally {
      setSaving(false);
    }
  }

  function updateNav(
    index: number,
    field: "label" | "path" | "external",
    value: string | boolean,
  ) {
    const copy = [...navLinks];
    const target = copy[index];
    if (!target) return;
    if (field === "external") {
      target.external = Boolean(value);
    } else {
      target[field] = String(value);
    }
    setNavLinks(copy);
    markDirty();
  }

  function addNavLink() {
    setNavLinks([...navLinks, { label: "", path: "", external: false }]);
    markDirty();
  }

  function removeNavLink(index: number) {
    setNavLinks(navLinks.filter((_, i) => i !== index));
    markDirty();
  }

  function moveNav(index: number, direction: number) {
    const newLinks = [...navLinks];
    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= newLinks.length ||
      newLinks[index] === undefined ||
      newLinks[newIndex] === undefined
    ) {
      return;
    }

    const temp = newLinks[index];
    newLinks[index] = newLinks[newIndex];
    newLinks[newIndex] = temp;

    setNavLinks(newLinks);
    markDirty();
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading footer settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal">
          <div className="bg-brand-red rounded-lg p-1.5 flex items-center justify-center">
            <Footprints className="w-3.5 h-3.5 text-white" />
          </div>
          Footer Section Editor
        </h2>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red hover:bg-brand-red-hover text-white disabled:opacity-50 self-start sm:self-auto"
          type="button"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {saveSuccess && (
        <p className="text-sm text-green-600 mt-2 text-right">{saveSuccess}</p>
      )}

      {saveError ? (
        <p className="text-sm text-red-600 mt-2 text-right">{saveError}</p>
      ) : null}

      {/* BRAND */}
      <div className="space-y-3">
        

        <ImageUpload
          section="brand"
          currentUrl={footerLogo}
          label="Logo Image"
          onUploaded={(url) => {
            setFooterLogo(url);
            markDirty();
          }}
        />
      </div>

      {/*NAV LINKS*/}
      <div className="space-y-4">
        <p className="font-medium text-gray-700">Footer Navigation Links</p>

        <div className="space-y-4">
          {navLinks.map((link, index) => (
            <div
              key={index}
              className="bg-white/70 rounded-xl p-4 border shadow-sm flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <GripVertical className="cursor-grab shrink-0" />

                  <Input
                    value={link.label}
                    placeholder="Label (e.g. Hours, Careers)"
                    className="flex-1 min-w-0"
                    onChange={(e) => updateNav(index, "label", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    value={link.path}
                    placeholder="/path or https://"
                    className="flex-1 min-w-0"
                    onChange={(e) => updateNav(index, "path", e.target.value)}
                  />

                  <button
                    onClick={() => removeNavLink(index)}
                    className="p-2 text-gray-500 hover:text-red-500 shrink-0"
                    aria-label="Remove nav link"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 ml-8">
                <button
                  onClick={() => moveNav(index, -1)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveNav(index, 1)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addNavLink}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-redHover"
        >
          <Plus size={18} /> Add Link
        </button>
      </div>

      {/* INSTAGRAM */}
      <div className="space-y-4">
        <p className="font-medium text-gray-700">Instagram</p>

        <div className="space-y-3 bg-white/70 p-4 rounded-xl border shadow-sm">
          <div>
            <Label>Instagram URL</Label>
            <Input
              value={instagramUrl}
              onChange={(e) => {
                setInstagramUrl(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div>
            <Label>Instagram Icon URL</Label>
            <Input
              value={instagramIcon}
              onChange={(e) => {
                setInstagramIcon(e.target.value);
                markDirty();
              }}
            />
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <div className="space-y-4">
        <p className="font-medium text-gray-700">Contact Information</p>

        <div className="space-y-3 bg-white/70 p-4 rounded-xl border shadow-sm">
          <div>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div>
            <Label>City + ZIP</Label>
            <Input
              value={cityZip}
              onChange={(e) => {
                setCityZip(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                markDirty();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
