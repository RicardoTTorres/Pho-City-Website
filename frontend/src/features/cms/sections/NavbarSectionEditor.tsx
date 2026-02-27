// src/features/cms/sections/NavbarSectionEditor.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Plus,
  Navigation,
  Save,
} from "lucide-react";

// import { MediaPickerModal } from "@/components/MediaPickerModal";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { getNavbar, putNavbar } from "@/shared/api/navbar";
import type { NavbarData, NavbarLink } from "@/shared/content/content.types";

function labelToString(label: NavbarLink["label"]) {
  return typeof label === "string" ? label : (label.en ?? "");
}

function ensureDefaults(data: NavbarData): NavbarData {
  return {
    version: data.version ?? 1,
    i18n: data.i18n ?? {
      enabled: false,
      defaultLocale: "en",
      supportedLocales: ["en"],
    },
    brand: { name: data.brand?.name ?? "Pho City", logo: data.brand?.logo || "/logo.png" },
    links: Array.isArray(data.links) ? data.links : [],
    ctas: data.ctas ?? {
      pickup: { enabled: false, label: { en: "Pickup" }, href: "" },
      delivery: { enabled: false, label: { en: "Delivery" }, href: "" },
    },

    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
  };
}

export function NavbarSectionEditor() {

  // API-driven state
  const [navbar, setNavbar] = useState<NavbarData>(() =>
    ensureDefaults({ links: [] }),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const dirtyRef = useRef(false);

  // Load navbar from backend
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setStatus(null);

        const data = await getNavbar();
        if (!alive) return;

        // Normalize ordering locally for a stable UI
        const normalized = ensureDefaults(data);
        normalized.links = (normalized.links ?? [])
          .slice()
          .sort((a, b) => a.order - b.order);

        setNavbar(normalized);
      } catch (e: any) {
        if (!alive) return;
        setStatus(e?.message ?? "Failed to load navbar");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const markDirty = () => {
    dirtyRef.current = true;
  };

  const links = useMemo(() => navbar.links ?? [], [navbar.links]);

  // Update link fields
  const updateLink = (id: string, patch: Partial<NavbarLink>) => {
    setNavbar((prev) => {
      const next = ensureDefaults(prev);
      next.links = (next.links ?? []).map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      );
      return next;
    });
    markDirty();
  };

  // Add new link
  const addLink = () => {
    setNavbar((prev) => {
      const next = ensureDefaults(prev);
      const maxOrder = (next.links ?? []).reduce(
        (m, l) => Math.max(m, l.order ?? 0),
        0,
      );

      const newLink: NavbarLink = {
        id: crypto.randomUUID(),
        label: "New Link",
        href: "/",
        type: "internal",
        order: maxOrder + 1,
        enabled: true,
      };

      next.links = [...(next.links ?? []), newLink].sort(
        (a, b) => a.order - b.order,
      );
      return next;
    });
    markDirty();
  };

  // Remove link
  const removeLink = (id: string) => {
    setNavbar((prev) => {
      const next = ensureDefaults(prev);
      next.links = (next.links ?? []).filter((l) => l.id !== id);

      // Re-number orders after deletion so ordering stays consistent
      next.links = (next.links ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((l, i) => ({ ...l, order: i + 1 }));

      return next;
    });
    markDirty();
  };

  // Reorder links (Footer-style swap + renumber order)
  function moveNav(index: number, direction: number) {
    setNavbar((prev) => {
      const next = ensureDefaults(prev);

      // Work on a sorted copy so UI index matches array index
      const newLinks = (next.links ?? [])
        .slice()
        .sort((a, b) => a.order - b.order);
      const newIndex = index + direction;

      if (
        newIndex < 0 ||
        newIndex >= newLinks.length ||
        newLinks[index] === undefined ||
        newLinks[newIndex] === undefined
      ) {
        return prev;
      }

      const temp = newLinks[index];
      newLinks[index] = newLinks[newIndex];
      newLinks[newIndex] = temp;

      // Persist order changes
      next.links = newLinks.map((l, i) => ({ ...l, order: i + 1 }));

      return next;
    });

    markDirty();
  }

  // Save to backend
  const onSave = async () => {
    try {
      setSaving(true);
      setStatus(null);

      const payload: NavbarData = {
        ...ensureDefaults(navbar),
        links: (links ?? [])
          .map((l) => ({
            ...l,
            label: typeof l.label === "string" ? l.label.trim() : l.label,
            href: l.href.trim(),
          }))
          .sort((a, b) => a.order - b.order),
      };

      const saved = await putNavbar(payload);

      const normalized = ensureDefaults(saved);
      normalized.links = (normalized.links ?? [])
        .slice()
        .sort((a, b) => a.order - b.order);

      setNavbar(normalized);

      dirtyRef.current = false;
      setStatus("Navbar section saved!");
      setTimeout(() => setStatus(null), 3000);
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to save navbar changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal">
          <div className="bg-brand-red rounded-lg p-1.5 flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5 text-white" />
          </div>
          Navbar Section Editor
        </h2>

        <button
          onClick={onSave}
          disabled={loading || saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red hover:bg-brand-red-hover text-white disabled:opacity-50 self-start sm:self-auto"
          type="button"
        >
          <Save size={18} className={saving ? "animate-spin" : ""} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {status && (
        <div className={`text-sm mt-2 text-right ${status.includes("Failed") || status.includes("Error") ? "text-red-500" : "text-green-600"}`}>
          {status}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading navbar...</div>
      ) : null}

      {/* LOGO SECTION */}
      <div className="space-y-3">
       

        <ImageUpload
          section="brand"
          currentUrl={navbar.brand?.logo}
          label="Logo Image"
          onUploaded={(url) => {
            setNavbar((prev) => ({
              ...prev,
              brand: {
                name: prev.brand?.name ?? "Pho City",
                logo: url,
              },
            }));
            markDirty();
          }}
        />

       
      </div>

      {/* LINKS SECTION */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-brand-charcoal">Navigation Links</p>

        <div className="space-y-4">
          {links
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((link, index) => (
              <div
                key={link.id}
                className="bg-white/70 rounded-xl p-4 border shadow-sm flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <GripVertical className="cursor-grab shrink-0" />

                    <input
                      value={labelToString(link.label)}
                      placeholder="Label (e.g., Home)"
                      className="flex-1 border rounded p-2 min-w-0"
                      onChange={(e) =>
                        updateLink(link.id, { label: e.target.value })
                      }
                    />
                  </div>

                  <input
                    value={link.href}
                    placeholder="/menu or https://..."
                    className="flex-1 border rounded p-2 min-w-0"
                    onChange={(e) =>
                      updateLink(link.id, { href: e.target.value })
                    }
                  />

                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded p-2 flex-1 sm:flex-none"
                      value={link.type}
                      onChange={(e) =>
                        updateLink(link.id, {
                          type: e.target.value as "internal" | "external",
                        })
                      }
                    >
                      <option value="internal">internal</option>
                      <option value="external">external</option>
                    </select>

                    <button
                      onClick={() =>
                        updateLink(link.id, { enabled: !link.enabled })
                      }
                      className="p-2 text-gray-600 hover:text-brand-red"
                      type="button"
                      title={link.enabled ? "Disable" : "Enable"}
                    >
                      {link.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    <button
                      onClick={() => removeLink(link.id)}
                      className="p-2 text-gray-500 hover:text-red-500"
                      type="button"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Move Up / Move Down buttons */}
                <div className="flex gap-2 ml-8">
                  <button
                    onClick={() => moveNav(index, -1)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveNav(index, 1)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    type="button"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
        </div>

        <button
          onClick={addLink}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-redHover"
          type="button"
        >
          <Plus size={18} /> Add Link
        </button>
      </div>
      {/* CTA BUTTONS SECTION */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-brand-charcoal">Order Button Settings</p>

        <div className="space-y-6 bg-white/70 p-4 rounded-xl border shadow-sm">
          {/* PICKUP */}
          <div className="space-y-3">
            <Label>Pickup Label</Label>
            <Input
              value={navbar.ctas?.pickup?.label?.en ?? ""}
              onChange={(e) => {
                setNavbar((prev) => ({
                  ...prev,
                  ctas: {
                    pickup: {
                      enabled: prev.ctas?.pickup?.enabled ?? false,
                      label: { en: e.target.value },
                      href: prev.ctas?.pickup?.href ?? "",
                    },
                    delivery: prev.ctas?.delivery ?? {
                      enabled: false,
                      label: { en: "Delivery" },
                      href: "",
                    },
                  },
                }));
                markDirty();
              }}
            />

            <Label>Pickup URL</Label>
            <Input
              placeholder="https://..."
              value={navbar.ctas?.pickup?.href ?? ""}
              onChange={(e) => {
                setNavbar((prev) => ({
                  ...prev,
                  ctas: {
                    pickup: {
                      enabled: prev.ctas?.pickup?.enabled ?? false,
                      label: prev.ctas?.pickup?.label ?? { en: "Pickup" },
                      href: e.target.value,
                    },
                    delivery: prev.ctas?.delivery ?? {
                      enabled: false,
                      label: { en: "Delivery" },
                      href: "",
                    },
                  },
                }));
                markDirty();
              }}
            />

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={navbar.ctas?.pickup?.enabled ?? false}
                onChange={(e) => {
                  setNavbar((prev) => ({
                    ...prev,
                    ctas: {
                      pickup: {
                        enabled: e.target.checked,
                        label: prev.ctas?.pickup?.label ?? { en: "Pickup" },
                        href: prev.ctas?.pickup?.href ?? "",
                      },
                      delivery: prev.ctas?.delivery ?? {
                        enabled: false,
                        label: { en: "Delivery" },
                        href: "",
                      },
                    },
                  }));
                  markDirty();
                }}
              />
              Enable Pickup Button
            </label>
          </div>

          {/* DELIVERY */}
          <div className="space-y-3">
            <Label>Delivery Label</Label>
            <Input
              value={navbar.ctas?.delivery?.label?.en ?? ""}
              onChange={(e) => {
                setNavbar((prev) => ({
                  ...prev,
                  ctas: {
                    pickup: prev.ctas?.pickup ?? {
                      enabled: false,
                      label: { en: "Pickup" },
                      href: "",
                    },
                    delivery: {
                      enabled: prev.ctas?.delivery?.enabled ?? false,
                      label: { en: e.target.value },
                      href: prev.ctas?.delivery?.href ?? "",
                    },
                  },
                }));
                markDirty();
              }}
            />

            <Label>Delivery URL</Label>
            <Input
              placeholder="https://..."
              value={navbar.ctas?.delivery?.href ?? ""}
              onChange={(e) => {
                setNavbar((prev) => ({
                  ...prev,
                  ctas: {
                    pickup: prev.ctas?.pickup ?? {
                      enabled: false,
                      label: { en: "Pickup" },
                      href: "",
                    },
                    delivery: {
                      enabled: prev.ctas?.delivery?.enabled ?? false,
                      label: prev.ctas?.delivery?.label ?? { en: "Delivery" },
                      href: e.target.value,
                    },
                  },
                }));
                markDirty();
              }}
            />

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={navbar.ctas?.delivery?.enabled ?? false}
                onChange={(e) => {
                  setNavbar((prev) => ({
                    ...prev,
                    ctas: {
                      pickup: prev.ctas?.pickup ?? {
                        enabled: false,
                        label: { en: "Pickup" },
                        href: "",
                      },
                      delivery: {
                        enabled: e.target.checked,
                        label: prev.ctas?.delivery?.label ?? { en: "Delivery" },
                        href: prev.ctas?.delivery?.href ?? "",
                      },
                    },
                  }));
                  markDirty();
                }}
              />
              Enable Delivery Button
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}
