import { MenuSectionEditor } from "@/sections/AdminDashboard/MenuSectionEditor";

export default function MenuPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Add, edit, or remove menu items and categories.</p>
      
      <MenuSectionEditor />
    </div>
  );
}
