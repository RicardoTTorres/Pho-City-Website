import { SettingsSectionEditor } from "@/features/cms/sections/SettingsSectionEditor";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Manage site configuration and preferences.</p>

      {/*General Settings*/}
      <section className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Title
            </label>
            <input
              type="text"
              defaultValue="Pho City"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              defaultValue="Authentic Vietnamese Cuisine in Sacramento"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              defaultValue="info@phocity.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
        </div>

        <button className="mt-6 flex items-center gap-2 px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-redHover transition">
          <Save size={18} /> Save Changes
        </button>
      </section>

      {/*Advanced Settings*/}
      <section className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Advanced Settings</h2>
        <SettingsSectionEditor />
      </section>
    </div>
  );
}
