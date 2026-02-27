// src/features/cms/sections/CustomizationsTab.tsx
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Portal } from "@/shared/components/ui/Portal";
import {
  getAllCustomizations,
  upsertCustomization,
  removeCustomization,
  type CategoryCustomization,
  type CustomizationItem,
  type CustomizationSection,
  type CustomizationMap,
} from "@/shared/api/menu";
import type { Category } from "@/features/cms/pages/MenuPage";

const MAX_SECTIONS = 7;

function emptyItem(): CustomizationItem {
  return { name: "", price: "" };
}

function emptySection(): CustomizationSection {
  return { title: "", items: [emptyItem()] };
}

function emptyCustomization(): CategoryCustomization {
  return { enabled: true, sections: [emptySection()] };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            checked ? "bg-brand-red" : "bg-gray-200"
          }`}
        />
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

// ── Section editor card ───────────────────────────────────────────────────────
function SectionCard({
  section,
  sectionIdx,
  totalSections,
  onChange,
  onRemove,
}: {
  section: CustomizationSection;
  sectionIdx: number;
  totalSections: number;
  onChange: (updated: CustomizationSection) => void;
  onRemove: () => void;
}) {
  function setTitle(title: string) {
    onChange({ ...section, title });
  }

  function setItem(ii: number, updated: CustomizationItem) {
    const items = section.items.map((it, i) => (i === ii ? updated : it));
    onChange({ ...section, items });
  }

  function addItem() {
    onChange({ ...section, items: [...section.items, emptyItem()] });
  }

  function removeItem(ii: number) {
    onChange({ ...section, items: section.items.filter((_, i) => i !== ii) });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-red/10 text-brand-red text-xs font-bold flex items-center justify-center">
          {sectionIdx + 1}
        </span>
        <input
          type="text"
          value={section.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Section title  (e.g. Broth Options)"
          maxLength={100}
          className="flex-1 text-sm font-medium bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
        />
        {totalSections > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            aria-label="Remove section"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2">
        {section.items.map((item, ii) => (
          <div key={ii} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <input
              type="text"
              value={item.name}
              onChange={(e) => setItem(ii, { ...item, name: e.target.value })}
              placeholder="Option name"
              maxLength={150}
              className="flex-1 text-sm px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-red/30 focus:border-brand-red/40 placeholder-gray-300"
            />
            <input
              type="text"
              value={item.price}
              onChange={(e) => setItem(ii, { ...item, price: e.target.value })}
              placeholder="+$1.50"
              maxLength={20}
              className="w-20 text-sm px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-red/30 focus:border-brand-red/40 placeholder-gray-300 text-amber-600 font-medium"
            />
            {section.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(ii)}
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Remove item"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-red transition-colors"
        >
          <Plus size={12} />
          Add option
        </button>
      </div>
    </div>
  );
}

// ── Editor Modal ──────────────────────────────────────────────────────────────
function EditorModal({
  category,
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  category: Category;
  initial: CategoryCustomization;
  onSave: (data: CategoryCustomization) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CategoryCustomization>(() =>
    JSON.parse(JSON.stringify(initial)),
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function setSection(idx: number, updated: CustomizationSection) {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === idx ? updated : s)),
    }));
  }

  function addSection() {
    if (draft.sections.length >= MAX_SECTIONS) return;
    setDraft((d) => ({ ...d, sections: [...d.sections, emptySection()] }));
    // Scroll to bottom after render
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }

  function removeSection(idx: number) {
    setDraft((d) => ({
      ...d,
      sections: d.sections.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await onDelete();
    } catch {
      setError("Failed to remove customization.");
      setDeleting(false);
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Panel */}
        <div className="relative w-full sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal size={16} className="text-brand-red" />
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Customization Options
                </h2>
                <p className="text-xs text-gray-400 leading-none mt-0.5">
                  {category.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          >
            {/* Enabled toggle */}
            <Toggle
              checked={draft.enabled}
              onChange={(v) => setDraft((d) => ({ ...d, enabled: v }))}
              label="Show on menu page"
            />

            <p className="text-xs text-gray-400">
              Up to {MAX_SECTIONS} sections · Each section can hold any number
              of options. Leave the price field blank if an option has no
              surcharge.
            </p>

            {/* Section cards */}
            <div className="space-y-3">
              {draft.sections.map((section, idx) => (
                <SectionCard
                  key={idx}
                  section={section}
                  sectionIdx={idx}
                  totalSections={draft.sections.length}
                  onChange={(updated) => setSection(idx, updated)}
                  onRemove={() => removeSection(idx)}
                />
              ))}
            </div>

            {draft.sections.length < MAX_SECTIONS && (
              <button
                type="button"
                onClick={addSection}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-brand-red/40 hover:text-brand-red transition-colors"
              >
                <Plus size={14} />
                Add section
              </button>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
            {/* Delete */}
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Remove accordion?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-60"
                >
                  {deleting ? "Removing…" : "Yes, remove"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
                Remove
              </button>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-red text-white rounded-lg hover:bg-brand-redHover transition-colors disabled:opacity-60 font-medium"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ cust }: { cust: CategoryCustomization | undefined }) {
  if (!cust) return null;
  return cust.enabled ? (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
      Active · {cust.sections.length} section
      {cust.sections.length !== 1 ? "s" : ""}
    </span>
  ) : (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
      Disabled
    </span>
  );
}

// ── Main CustomizationsTab ────────────────────────────────────────────────────
export function CustomizationsTab({ categories }: { categories: Category[] }) {
  const [custMap, setCustMap] = useState<CustomizationMap>({});
  const [loading, setLoading] = useState(true);
  const [managingId, setManagingId] = useState<string | null>(null);

  useEffect(() => {
    getAllCustomizations()
      .then(setCustMap)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const managingCategory = categories.find((c) => c.id === managingId) ?? null;

  async function handleSave(data: CategoryCustomization) {
    if (!managingId) return;
    await upsertCustomization(managingId, data);
    setCustMap((prev) => ({ ...prev, [managingId]: data }));
    setManagingId(null);
  }

  async function handleDelete() {
    if (!managingId) return;
    await removeCustomization(managingId);
    setCustMap((prev) => {
      const next = { ...prev };
      delete next[managingId];
      return next;
    });
    setManagingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Info bar */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <ChevronDown
          size={15}
          className="text-amber-500 mt-0.5 flex-shrink-0 rotate-[-90deg]"
        />
        <p className="text-xs text-amber-800 leading-relaxed">
          Add customization to categories
        </p>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {categories.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-400 text-center">
            No categories found.
          </p>
        ) : (
          categories.map((cat) => {
            const cust = custMap[cat.id];
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {cat.name}
                  </p>
                  <div className="mt-1">
                    {cust ? (
                      <StatusBadge cust={cust} />
                    ) : (
                      <span className="text-xs text-gray-400">
                        No customization
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManagingId(cat.id)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-brand-gold/60 text-brand-gold hover:border-brand-red hover:text-brand-red transition-colors font-medium"
                >
                  {cust ? "Edit" : "Add"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Editor modal */}
      {managingId && managingCategory && (
        <EditorModal
          category={managingCategory}
          initial={custMap[managingId] ?? emptyCustomization()}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setManagingId(null)}
        />
      )}
    </>
  );
}
