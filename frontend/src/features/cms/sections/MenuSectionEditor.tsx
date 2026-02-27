// src/features/cms/sections/MenuSectionEditor.tsx
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { Portal } from "@/shared/components/ui/Portal";
import { CustomizationsTab } from "@/features/cms/sections/CustomizationsTab";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Star,
} from "lucide-react";
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

// Sortable Item Component
function SortableMenuItem({
  item,
  disabled = false,
  onEdit,
  onDelete,
  onToggleVisible,
  onToggleFeatured,
  onChangeFeaturedPosition,
}: {
  item: MenuItem;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
  onToggleFeatured: () => void;
  onChangeFeaturedPosition: (position: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

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
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-medium text-gray-900">{item.price}</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {item.category}
            </span>
            <div className="flex items-center gap-3">
              {/* Featured toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onToggleFeatured}
                  className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors"
                  aria-label={`Toggle featured for ${item.name}`}
                >
                  <Star
                    className={`w-4 h-4 ${item.featured ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}
                  />
                  <span
                    className={`text-xs ${item.featured ? "text-yellow-600" : "text-gray-500"}`}
                  >
                    {item.featured ? "Featured" : "Feature"}
                  </span>
                </button>
                {item.featured && (
                  <select
                    value={item.featuredPosition ?? ""}
                    onChange={(e) =>
                      onChangeFeaturedPosition(Number(e.target.value))
                    }
                    className="px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-red"
                    aria-label={`Featured position for ${item.name}`}
                  >
                    <option value="" disabled>
                      Pos
                    </option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        #{n}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {/* Visibility toggle */}
              <button
                onClick={onToggleVisible}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors"
                aria-label={`Toggle visibility for ${item.name}`}
              >
                {item.visible ? (
                  <>
                    <Eye className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Hidden</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 text-sm text-brand-gold hover:text-brand-red border border-brand-gold hover:border-brand-red rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sortable Category Component
function SortableCategory({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
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
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {category.items?.length || 0} items
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-2 text-sm text-brand-gold hover:text-brand-red border border-brand-gold hover:border-brand-red rounded-lg transition-colors flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<"items" | "categories" | "customizations">("items");
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
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
  });

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

  // Count total featured items across all categories
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
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
      alert("Failed to update visibility. Please try again.");
    }
  };

  const handleToggleFeatured = async (item: MenuItem) => {
    const willFeature = !item.featured;
    if (willFeature && featuredCount >= 4) {
      alert(
        "Maximum of 4 featured items allowed. Unfeature another item first.",
      );
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
      });
    } catch (error) {
      console.error("Error updating featured:", error);
      alert("Failed to update featured status. Please try again.");
    }
  };

  const handleChangeFeaturedPosition = async (
    item: MenuItem,
    position: number,
  ) => {
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
      };
      if (editingItem) {
        await onUpdateItem(editingItem.id, payload);
      } else {
        await onCreateItem(payload);
      }
      setItemModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      alert(
        `Failed to ${editingItem ? "update" : "add"} item. Please try again.`,
      );
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
      alert(
        `Failed to ${editingCategory ? "update" : "add"} category. Please try again.`,
      );
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
  // Handle drag end for items
  const handleItemDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (filteredCategory === "all") return;

    const categoryId = filteredCategory;
    const itemsInCategory = menuItems.filter(
      (item) => item.categoryId === categoryId,
    );

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

  // Handle drag end for categories
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
        {(["items", "categories", "customizations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-b-2 border-brand-red text-brand-red"
                : "text-gray-600 hover:text-brand-red"
            }`}
          >
            {tab === "items"
              ? "Menu Items"
              : tab === "categories"
                ? "Categories"
                : "Customizations"}
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
                {featuredCount} / 4 slots filled
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((slot) => {
                const item = featuredItems.find(
                  (i) => i.featuredPosition === slot,
                );
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
                      <p className="text-xs text-gray-500 truncate">
                        {item.category}
                      </p>
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
                        className="flex-1 px-2 py-1.5 text-xs text-gray-500 hover:text-red-500 border border-gray-300 hover:border-red-400 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={slot}
                    className="border border-dashed border-gray-200 bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center gap-1 min-h-[120px]"
                  >
                    <span className="text-xs font-bold text-gray-300">
                      #{slot}
                    </span>
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
              sensors={
                filteredCategory === "all" ? disabledItemSensors : sensors
              }
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
              <div className="p-8 text-center text-gray-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No categories found.
              </div>
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
                        onEdit={() => handleEditCategory(category)}
                        onDelete={() => handleDeleteCategory(category.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {/* Customizations Tab */}
      {activeTab === "customizations" && (
        <div className="space-y-4">
          <CustomizationsTab categories={categories} />
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
                    setItemFormData({
                      ...itemFormData,
                      description: e.target.value,
                    })
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
                    setItemFormData({
                      ...itemFormData,
                      categoryId: e.target.value,
                    })
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
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
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
    </div>
  );
}
