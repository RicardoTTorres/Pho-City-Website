// src/features/cms/sections/MenuSectionEditor.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { Portal } from "@/shared/components/ui/Portal";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Star,
  TrendingUp,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import { parseBilingualName } from "@/utils/menuHelper";
import {
  getAllCustomizations,
  upsertCustomization,
  removeCustomization,
  type CustomizationMap,
  type CategoryCustomization,
  type CustomizationSection,
} from "@/shared/api/menu";
import {
  EditorModal,
  emptyCustomization,
} from "@/features/cms/sections/CustomizationsTab";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type {
  MenuItem,
  Category,
  MenuData,
} from "@/features/cms/pages/MenuPage";
import type { NewItemPayload, NewCategoryPayload } from "@/shared/api/menu";

// ── Customization templates ───────────────────────────────────────────────────

const NOODLE_ITEMS = [
  { name: "Rice Noodle", price: "" },
  { name: "Fresh Noodle", price: "" },
  { name: "Clear Noodle", price: "" },
  { name: "Egg Noodle", price: "" },
  { name: "Small Vermicelli Noodle", price: "" },
  { name: "Large Vermicelli Noodle", price: "" },
  { name: "No Noodle", price: "" },
  { name: "Easy Noodle", price: "" },
  { name: "Uncooked Noodle", price: "" },
];

const SOUP_SIZE_SECTION: CustomizationSection = {
  title: "Soup Size (Required)",
  items: [
    { name: "Small", price: "" },
    { name: "Medium", price: "+$1.00" },
    { name: "Large", price: "+$2.00" },
  ],
};

const NOODLE_SECTION: CustomizationSection = {
  title: "Noodle Selection (Required, up to 2)",
  items: NOODLE_ITEMS,
};

const SPECIAL_INSTRUCTIONS_SECTION: CustomizationSection = {
  title: "Special Instructions",
  items: [
    { name: "Let us know any preferences or changes to your order", price: "" },
  ],
};

const TEMPLATES: Record<string, CategoryCustomization> = {
  sandwich: {
    enabled: true,
    sections: [
      {
        title: "Remove From Sandwich (Optional)",
        items: [
          { name: "No Butter", price: "" },
          { name: "No Pate", price: "" },
          { name: "No Pickled Daikon and Carrots", price: "" },
          { name: "No Cucumber", price: "" },
          { name: "No Cilantro", price: "" },
          { name: "No Jalapenos", price: "" },
        ],
      },
      {
        title: "Add to Sandwich (Optional, up to 10)",
        items: [
          { name: "Add Fried Egg (qty 1)", price: "+$3.50" },
          { name: "Add Grilled Pork", price: "+$3.50" },
          { name: "Add Grilled Beef", price: "+$3.50" },
          { name: "Add Grilled Chicken", price: "+$3.50" },
          { name: "Add Vietnamese Ham", price: "+$3.50" },
          { name: "Add Pate", price: "+$1.50" },
          { name: "Add Butter", price: "+$0.50" },
        ],
      },
      SPECIAL_INSTRUCTIONS_SECTION,
    ],
  },
  pho: {
    enabled: true,
    sections: [
      {
        title: "Pho Size (Required)",
        items: [
          { name: "Small", price: "" },
          { name: "Medium", price: "+$1.00" },
          { name: "Large", price: "+$2.00" },
        ],
      },
      NOODLE_SECTION,
      {
        title: "Remove from Pho (Optional)",
        items: [
          { name: "No Onions", price: "" },
          { name: "No White Onions", price: "" },
          { name: "No Green Onions", price: "" },
          { name: "No Cilantro", price: "" },
        ],
      },
      {
        title: "Remove from Dac Biet (Optional)",
        items: [
          { name: "No Beef Meatballs", price: "" },
          { name: "No Brisket", price: "" },
          { name: "No Flank", price: "" },
          { name: "No Rare Steak", price: "" },
          { name: "No Tendon", price: "" },
          { name: "No Tripe", price: "" },
        ],
      },
      {
        title: "Pho Add On's (Optional)",
        items: [
          { name: "Noodle", price: "+$4.50" },
          { name: "Rare Steak", price: "+$6.50" },
          { name: "Beefball", price: "+$4.50" },
          { name: "Brisket", price: "+$4.50" },
          { name: "Chicken", price: "+$4.50" },
          { name: "Flank", price: "+$4.50" },
          { name: "Tripe", price: "+$4.50" },
          { name: "Shrimp", price: "+$4.50" },
          { name: "Wonton", price: "+$4.50" },
          { name: "Onion and Oil", price: "+$1.00" },
          { name: "Onion and Vinegar", price: "+$1.00" },
          { name: "Crushed Peanuts", price: "+$1.00" },
          { name: "Ginger Fish Sauce", price: "+$1.00" },
          { name: "Chili Oil", price: "+$1.00" },
        ],
      },
      SPECIAL_INSTRUCTIONS_SECTION,
    ],
  },
  bunRieu: {
    enabled: true,
    sections: [
      SOUP_SIZE_SECTION,
      NOODLE_SECTION,
      {
        title: "Remove from Bun Rieu (Optional)",
        items: [
          { name: "No Onions", price: "" },
          { name: "No Green Onions", price: "" },
          { name: "No Cilantro", price: "" },
        ],
      },
      SPECIAL_INSTRUCTIONS_SECTION,
    ],
  },
  bbh: {
    enabled: true,
    sections: [
      SOUP_SIZE_SECTION,
      NOODLE_SECTION,
      {
        title: "BBH Add On's (Optional)",
        items: [
          { name: "Noodle", price: "+$4.50" },
          { name: "Pork Blood", price: "+$4.50" },
          { name: "Beef Shank", price: "+$4.50" },
          { name: "Pork Hock", price: "+$4.50" },
          { name: "Vietnamese Ham", price: "+$4.50" },
          { name: "Rare Steak", price: "+$6.50" },
          { name: "Shrimp", price: "+$4.50" },
          { name: "Beefball", price: "+$4.50" },
          { name: "Brisket", price: "+$4.50" },
          { name: "Chicken", price: "+$4.50" },
          { name: "Flank", price: "+$4.50" },
          { name: "Tripe", price: "+$4.50" },
          { name: "Wonton", price: "+$4.50" },
          { name: "Crushed Peanuts", price: "+$1.00" },
          { name: "Onion and Oil", price: "+$1.00" },
          { name: "Onion and Vinegar", price: "+$1.00" },
        ],
      },
      {
        title: "Remove from BBH (Optional)",
        items: [
          { name: "No Pork Blood", price: "" },
          { name: "No Beef Shank", price: "" },
          { name: "No Pork Hock", price: "" },
          { name: "No Vietnamese Ham", price: "" },
          { name: "No Onions", price: "" },
          { name: "No Green Onions", price: "" },
          { name: "No Cilantro", price: "" },
        ],
      },
      SPECIAL_INSTRUCTIONS_SECTION,
    ],
  },
  riceNoodleSoup: {
    enabled: true,
    sections: [
      NOODLE_SECTION,
      {
        title: "C-1 Size (Required)",
        items: [
          { name: "Medium", price: "" },
          { name: "Large", price: "+$2.00" },
        ],
      },
      {
        title: "Remove from Hu Tieu / Mi (Optional)",
        items: [
          { name: "No Fried Onions", price: "" },
          { name: "No Green Onions", price: "" },
        ],
      },
      {
        title: "Add Noodle (Optional)",
        items: [{ name: "Add Noodles", price: "+$2.00" }],
      },
      {
        title: "Add Shrimp Rice Cracker (Optional)",
        items: [{ name: "Add Shrimp Cracker", price: "+$2.25" }],
      },
      SPECIAL_INSTRUCTIONS_SECTION,
    ],
  },
  ricePlate: {
    enabled: true,
    sections: [
      {
        title: "Rice Add On's (Optional)",
        items: [
          { name: "Sunny Side Up Eggs", price: "+$4.50" },
          { name: "Egg Roll", price: "+$3.00" },
          { name: "Shredded Skin Pork", price: "+$3.00" },
          { name: "Egg Foo Yong", price: "+$3.00" },
          { name: "Vegetables", price: "+$3.00" },
          { name: "Grilled Pork", price: "+$4.50" },
          { name: "Grilled Shrimp", price: "+$4.50" },
          { name: "Grilled Chicken", price: "+$4.50" },
          { name: "Grilled Beef", price: "+$4.50" },
          { name: "Pork Chop (1 Piece)", price: "+$5.50" },
        ],
      },
      {
        title: "Remove From Rice (Optional)",
        items: [{ name: "No Green Onion", price: "" }],
      },
      SPECIAL_INSTRUCTIONS_SECTION,
    ],
  },
  stirFry: {
    enabled: true,
    sections: [SPECIAL_INSTRUCTIONS_SECTION],
  },
  vermicelli: {
    enabled: true,
    sections: [
      {
        title: "Vermicelli Add On's (Optional)",
        items: [
          { name: "Extra Grilled Chicken", price: "+$4.50" },
          { name: "Extra Grilled Pork", price: "+$4.50" },
          { name: "Extra Grilled Beef", price: "+$4.50" },
          { name: "Extra Grilled Shrimp", price: "+$4.50" },
          { name: "Extra Egg Roll", price: "+$3.00" },
          { name: "Extra Vermicelli", price: "+$3.00" },
          { name: "Extra Vegetables", price: "+$3.00" },
        ],
      },
      {
        title: "Remove from Vermicelli (Optional)",
        items: [
          { name: "No Peanuts", price: "" },
          { name: "No Fried Onions", price: "" },
        ],
      },
      {
        title: "Vermicelli Modifier (Optional, up to 1)",
        items: [
          { name: "Replace Vermicelli w/ Extra Veggies", price: "" },
          { name: "Easy Vermicelli More Veggies", price: "" },
        ],
      },
      SPECIAL_INSTRUCTIONS_SECTION,
    ],
  },
};

function getTemplateForCategory(name: string): CategoryCustomization {
  const lower = name.toLowerCase();
  if (lower.includes("sandwich") || lower.includes("bánh mì") || lower.includes("banh mi")) {
    return JSON.parse(JSON.stringify(TEMPLATES.sandwich));
  }
  if (lower.includes("bun rieu") || lower.includes("bún riêu")) {
    return JSON.parse(JSON.stringify(TEMPLATES.bunRieu));
  }
  if (
    lower.includes("spicy beef") ||
    lower.includes("bbh") ||
    lower.includes("bún bò huế") ||
    lower.includes("bun bo hue")
  ) {
    return JSON.parse(JSON.stringify(TEMPLATES.bbh));
  }
  if (
    lower.includes("pho") ||
    lower.includes("phở") ||
    lower.includes("ph\u1edf")
  ) {
    return JSON.parse(JSON.stringify(TEMPLATES.pho));
  }
  if (
    lower.includes("rice noodle") ||
    lower.includes("hu tieu") ||
    lower.includes("hủ tiếu") ||
    lower.includes("mi xao")
  ) {
    return JSON.parse(JSON.stringify(TEMPLATES.riceNoodleSoup));
  }
  if (lower.includes("rice plate") || lower.includes("com ") || lower.includes("cơm")) {
    return JSON.parse(JSON.stringify(TEMPLATES.ricePlate));
  }
  if (lower.includes("stir fry") || lower.includes("stir-fry")) {
    return JSON.parse(JSON.stringify(TEMPLATES.stirFry));
  }
  if (
    lower.includes("vermicelli") ||
    lower.includes("bún") ||
    (lower.includes("bun") && !lower.includes("bun rieu") && !lower.includes("bun bo"))
  ) {
    return JSON.parse(JSON.stringify(TEMPLATES.vermicelli));
  }
  // Default: just special instructions
  const base = emptyCustomization();
  base.sections = [JSON.parse(JSON.stringify(SPECIAL_INSTRUCTIONS_SECTION))];
  return base;
}

// ── Customization status badge ────────────────────────────────────────────────
function CustBadge({ cust }: { cust: CategoryCustomization | undefined }) {
  if (!cust) return null;
  return cust.enabled ? (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
      {cust.sections.length} custom section{cust.sections.length !== 1 ? "s" : ""}
    </span>
  ) : (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
      disabled
    </span>
  );
}

interface MenuSectionEditorProps {
  menuData: MenuData;
  categories: Category[];
  loading: boolean;
  onCreateItem: (data: NewItemPayload) => Promise<void>;
  onUpdateItem: (id: string, data: NewItemPayload) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onCreateCategory: (data: NewCategoryPayload) => Promise<void>;
  onUpdateCategory: (id: string, data: NewCategoryPayload) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (categoryIds: string[]) => Promise<void>;
  onReorderItems: (categoryId: string, itemIds: string[]) => Promise<void>;
}

// ── Sortable Item ─────────────────────────────────────────────────────────────
function SortableMenuItem({
  item,
  disabled = false,
  onEdit,
  onDelete,
  onToggleVisible,
  onToggleFeatured,
  onChangeFeaturedPosition,
  onTogglePopular,
  onCustomize,
}: {
  item: MenuItem;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
  onToggleFeatured: () => void;
  onChangeFeaturedPosition: (position: number) => void;
  onTogglePopular: () => void;
  onCustomize: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kebabOpen) return;
    const handler = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) {
        setKebabOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [kebabOpen]);

  const { english, vietnamese } = parseBilingualName(item.name);

  // Normalize price to always show as "$X.XX"
  const displayPrice = (() => {
    const raw = String(item.price).replace(/[^0-9.]/g, "");
    const num = parseFloat(raw);
    return Number.isFinite(num) ? `$${num.toFixed(2)}` : String(item.price);
  })();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="px-3 py-2.5 sm:px-4 bg-white border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + Price */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-1">
                {english}
              </h3>
              {vietnamese && (
                <p className="text-[11px] sm:text-xs text-gray-400 italic leading-snug line-clamp-1">
                  {vietnamese}
                </p>
              )}
            </div>
            {/* Price badge — clearly styled so it reads as price, not index */}
            <span className="shrink-0 text-[11px] sm:text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded tabular-nums leading-none mt-0.5">
              {displayPrice}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Bottom row: status chips + action cluster */}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            {/* Status chips */}
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              {item.featured && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-[10px] sm:text-[11px] font-medium leading-none">
                  <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-yellow-500" />
                  #{item.featuredPosition}
                </span>
              )}
              {item.popular && (
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] sm:text-[11px] font-medium leading-none">
                  Popular
                </span>
              )}
              {!item.visible && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 border border-gray-200 rounded text-[10px] sm:text-[11px] font-medium leading-none">
                  Hidden
                </span>
              )}
            </div>

            {/* Action cluster: Edit + ⋮ only */}
            <div className="flex items-center shrink-0">
              <button
                onClick={onEdit}
                className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-brand-gold hover:text-white hover:bg-brand-gold border border-brand-gold rounded-l-md transition-colors inline-flex items-center gap-1"
              >
                <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Edit
              </button>

              <div ref={kebabRef} className="relative">
                <button
                  onClick={() => setKebabOpen((v) => !v)}
                  className="px-1.5 py-1 text-gray-400 hover:text-gray-700 border border-l-0 border-gray-200 hover:border-gray-300 rounded-r-md transition-colors"
                  aria-label="More actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {kebabOpen && (
                  <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48 z-20">
                    {/* Popular */}
                    <button
                      onClick={() => { onTogglePopular(); setKebabOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors"
                    >
                      <TrendingUp className={`w-3.5 h-3.5 ${item.popular ? "text-amber-500" : "text-gray-400"}`} />
                      <span className={item.popular ? "text-amber-700 font-medium" : "text-gray-700"}>
                        {item.popular ? "Unmark popular" : "Mark popular"}
                      </span>
                    </button>
                    {/* Visibility */}
                    <button
                      onClick={() => { onToggleVisible(); setKebabOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors"
                    >
                      {item.visible
                        ? <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                        : <Eye className="w-3.5 h-3.5 text-green-500" />}
                      <span className="text-gray-700">{item.visible ? "Hide item" : "Show item"}</span>
                    </button>
                    {/* Feature */}
                    <button
                      onClick={() => { onToggleFeatured(); setKebabOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${item.featured ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
                      <span className={item.featured ? "text-yellow-700 font-medium" : "text-gray-700"}>
                        {item.featured ? "Unfeature" : "Feature on homepage"}
                      </span>
                    </button>
                    {/* Featured position select */}
                    {item.featured && (
                      <div className="px-3 pb-1.5">
                        <select
                          value={item.featuredPosition ?? ""}
                          onChange={(e) => onChangeFeaturedPosition(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-red"
                        >
                          <option value="" disabled>Position</option>
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>#{n}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* Customizations */}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { onCustomize(); setKebabOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-700">Category customizations</span>
                      </button>
                    </div>
                    {/* Delete */}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { onDelete(); setKebabOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sortable Category ─────────────────────────────────────────────────────────
function SortableCategory({
  category,
  cust,
  onEdit,
  onDelete,
  onCustomize,
}: {
  category: Category;
  cust: CategoryCustomization | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onCustomize: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-white border-b border-gray-200 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-600">
                {category.items?.length || 0} items
              </p>
              <CustBadge cust={cust} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onCustomize}
              className="p-2 text-gray-400 hover:text-brand-red border border-gray-200 hover:border-brand-red/40 rounded-lg transition-colors"
              aria-label="Manage customizations"
              title="Manage customizations"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-2 text-sm text-brand-gold hover:text-brand-red border border-brand-gold hover:border-brand-red rounded-lg transition-colors flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg transition-colors"
              aria-label="Delete category"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main MenuSectionEditor ────────────────────────────────────────────────────
export function MenuSectionEditor({
  menuData,
  categories,
  loading,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onReorderItems,
}: MenuSectionEditorProps) {
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");
  const [filteredCategory, setFilteredCategory] = useState("all");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
  });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: "" });

  // Customization state
  const [custMap, setCustMap] = useState<CustomizationMap>({});
  const [managingCategoryId, setManagingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    getAllCustomizations()
      .then(setCustMap)
      .catch(() => {});
  }, []);

  const managingCategory = categories.find((c) => c.id === managingCategoryId) ?? null;

  async function handleSaveCustomization(data: CategoryCustomization) {
    if (!managingCategoryId) return;
    await upsertCustomization(managingCategoryId, data);
    setCustMap((prev) => ({ ...prev, [managingCategoryId]: data }));
    setManagingCategoryId(null);
  }

  async function handleDeleteCustomization() {
    if (!managingCategoryId) return;
    await removeCustomization(managingCategoryId);
    setCustMap((prev) => {
      const next = { ...prev };
      delete next[managingCategoryId];
      return next;
    });
    setManagingCategoryId(null);
  }

  function openCustomizeForCategory(categoryId: string) {
    setManagingCategoryId(categoryId);
  }

  function openCustomizeForItem(item: MenuItem) {
    setManagingCategoryId(item.categoryId);
  }

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const disabledItemSensors = useSensors();

  const menuItems: MenuItem[] = [];
  menuData.categories.forEach((category) => {
    if (category.items) {
      category.items.forEach((item) => {
        menuItems.push({
          ...item,
          category: category.name,
          categoryId: category.id,
        });
      });
    }
  });

  const filteredItems =
    filteredCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.categoryId === filteredCategory);

  const visibleItemsCount = filteredItems.filter((item) => item.visible).length;

  const handleAddItem = () => {
    setEditingItem(null);
    setItemFormData({
      name: "",
      description: "",
      price: "",
      categoryId: categories[0]?.id || "",
      image: "",
    });
    setItemModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description,
      price: item.price.replace("$", ""),
      categoryId: item.categoryId,
      image: item.image || "",
    });
    setItemModalOpen(true);
  };

  const featuredCount = menuItems.filter((item) => item.featured).length;
  const featuredItems = menuItems
    .filter((item) => item.featured)
    .sort((a, b) => (a.featuredPosition ?? 99) - (b.featuredPosition ?? 99));

  const handleToggleVisible = async (item: MenuItem) => {
    try {
      await onUpdateItem(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        image: item.image || "",
        visible: !item.visible,
        featured: item.featured,
        featuredPosition: item.featuredPosition,
        popular: item.popular,
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
      alert("Failed to update visibility. Please try again.");
    }
  };

  const handleToggleFeatured = async (item: MenuItem) => {
    const willFeature = !item.featured;
    if (willFeature && featuredCount >= 6) {
      alert("Maximum of 6 featured items allowed. Unfeature another item first.");
      return;
    }
    try {
      await onUpdateItem(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        image: item.image || "",
        visible: item.visible,
        featured: willFeature,
        featuredPosition: willFeature ? item.featuredPosition : null,
        popular: item.popular,
      });
    } catch (error) {
      console.error("Error updating featured:", error);
      alert("Failed to update featured status. Please try again.");
    }
  };

  const handleTogglePopular = async (item: MenuItem) => {
    try {
      await onUpdateItem(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        image: item.image || "",
        visible: item.visible,
        featured: item.featured,
        featuredPosition: item.featuredPosition,
        popular: !item.popular,
      });
    } catch (error) {
      console.error("Error updating popular:", error);
      alert("Failed to update popular status. Please try again.");
    }
  };

  const handleChangeFeaturedPosition = async (item: MenuItem, position: number) => {
    try {
      await onUpdateItem(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        image: item.image || "",
        visible: item.visible,
        featured: item.featured,
        featuredPosition: position,
        popular: item.popular,
      });
    } catch (error) {
      console.error("Error updating featured position:", error);
      alert("Failed to update featured position. Please try again.");
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: NewItemPayload = {
        ...itemFormData,
        visible: editingItem?.visible ?? true,
        featured: editingItem?.featured ?? false,
        featuredPosition: editingItem?.featuredPosition ?? null,
        popular: editingItem?.popular ?? false,
      };
      if (editingItem) {
        await onUpdateItem(editingItem.id, payload);
      } else {
        await onCreateItem(payload);
      }
      setItemModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      alert(`Failed to ${editingItem ? "update" : "add"} item. Please try again.`);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await onDeleteItem(itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: "" });
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name });
    setCategoryModalOpen(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: NewCategoryPayload = { ...categoryFormData };
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, payload);
      } else {
        await onCreateCategory(payload);
      }
      setCategoryModalOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      alert(`Failed to ${editingCategory ? "update" : "add"} category. Please try again.`);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await onDeleteCategory(categoryId);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  const handleItemDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (filteredCategory === "all") return;

    const categoryId = filteredCategory;
    const itemsInCategory = menuItems.filter((item) => item.categoryId === categoryId);
    const oldIndex = itemsInCategory.findIndex((item) => item.id === active.id);
    const newIndex = itemsInCategory.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedItems = arrayMove(itemsInCategory, oldIndex, newIndex);
    const itemIds = reorderedItems.map((item) => item.id);
    try {
      await onReorderItems(categoryId, itemIds);
    } catch (error) {
      console.error("Error reordering items:", error);
      alert("Failed to reorder items. Please try again.");
    }
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
    const categoryIds = reorderedCategories.map((cat) => cat.id);
    try {
      await onReorderCategories(categoryIds);
    } catch (error) {
      console.error("Error reordering categories:", error);
      alert("Failed to reorder categories. Please try again.");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
        {(["items", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-b-2 border-brand-red text-brand-red"
                : "text-gray-600 hover:text-brand-red"
            }`}
          >
            {tab === "items" ? "Menu Items" : "Categories"}
          </button>
        ))}
      </div>

      {/* Menu Items Tab */}
      {activeTab === "items" && (
        <div className="space-y-3 md:space-y-4">
          {/* Featured Items Panel */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                Featured on Homepage
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {featuredCount} / 6 slots filled
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((slot) => {
                const item = featuredItems.find((i) => i.featuredPosition === slot);
                return item ? (
                  <div
                    key={slot}
                    className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 flex flex-col gap-2"
                  >
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full self-start">
                      #{slot}
                    </span>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-20 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{item.category}</p>
                      <p className="text-xs font-medium text-gray-700 mt-0.5">
                        {item.price}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="flex-1 px-2 py-1.5 text-xs text-brand-gold hover:text-brand-red border border-brand-gold hover:border-brand-red rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className="px-2.5 py-1.5 text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 rounded transition-colors flex items-center justify-center"
                        aria-label="Remove from featured"
                        title="Remove from featured"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={slot}
                    className="border border-dashed border-gray-200 bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center gap-1 min-h-[120px]"
                  >
                    <span className="text-xs font-bold text-gray-300">#{slot}</span>
                    <span className="text-xs text-gray-400">Empty slot</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters and Add Button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <select
                value={filteredCategory}
                onChange={(e) => setFilteredCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                {visibleItemsCount} visible
              </span>
            </div>
            <Button
              onClick={handleAddItem}
              className="w-full sm:w-auto bg-brand-red hover:bg-brand-gold text-white text-sm md:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DndContext
              sensors={filteredCategory === "all" ? disabledItemSensors : sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd}
            >
              <SortableContext
                items={filteredItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      disabled={filteredCategory === "all"}
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                      onToggleVisible={() => handleToggleVisible(item)}
                      onToggleFeatured={() => handleToggleFeatured(item)}
                      onChangeFeaturedPosition={(pos) =>
                        handleChangeFeaturedPosition(item, pos)
                      }
                      onTogglePopular={() => handleTogglePopular(item)}
                      onCustomize={() => openCustomizeForItem(item)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-xl md:text-2xl font-bold text-brand-red">
              Categories
            </h2>
            <Button
              onClick={handleAddCategory}
              className="w-full sm:w-auto bg-brand-red hover:bg-brand-gold text-white text-sm md:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No categories found.</div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryDragEnd}
              >
                <SortableContext
                  items={categories.map((cat) => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-gray-200">
                    {categories.map((category) => (
                      <SortableCategory
                        key={category.id}
                        category={category}
                        cust={custMap[category.id]}
                        onEdit={() => handleEditCategory(category)}
                        onDelete={() => handleDeleteCategory(category.id)}
                        onCustomize={() => openCustomizeForCategory(category.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {/* Item Modal */}
      {itemModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[92vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-red mb-4">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <form onSubmit={handleSubmitItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={itemFormData.categoryId}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemFormData.price}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    required
                    inputMode="decimal"
                  />
                </div>
                <ImageUpload
                  section="menu"
                  currentUrl={itemFormData.image || null}
                  onUploaded={(url) =>
                    setItemFormData({ ...itemFormData, image: url })
                  }
                  label="Image (optional)"
                />
                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setItemModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2.5 bg-brand-red hover:bg-brand-gold text-white rounded-lg transition-colors font-medium"
                  >
                    {editingItem ? "Update" : "Add"} Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[92vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-red mb-4">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    required
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2.5 bg-brand-red hover:bg-brand-gold text-white rounded-lg transition-colors font-medium"
                  >
                    {editingCategory ? "Update" : "Add"} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Customization EditorModal */}
      {managingCategoryId && managingCategory && (
        <EditorModal
          category={managingCategory}
          initial={
            custMap[managingCategoryId] ??
            getTemplateForCategory(managingCategory.name)
          }
          onSave={handleSaveCustomization}
          onDelete={handleDeleteCustomization}
          onClose={() => setManagingCategoryId(null)}
        />
      )}
    </div>
  );
}
