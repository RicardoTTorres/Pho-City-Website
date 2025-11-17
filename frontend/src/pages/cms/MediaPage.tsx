import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";

export default function MediaPage() {
  //Placeholder media items
  const mediaItems = [
    { id: 1, name: "hero-bowl.jpg", url: "/img/hero-bowl.jpg", size: "256 KB" },
    { id: 2, name: "pho-dac-biet.jpg", url: "/img/pho-dac-biet.jpg", size: "312 KB" },
    { id: 3, name: "spring-rolls.jpg", url: "/img/spring-rolls.jpg", size: "189 KB" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Upload and manage images for your website.</p>

      {/*Upload Section*/}
      <section className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-red transition-colors">
        <div className="flex flex-col items-center justify-center gap-3">
          <Upload size={48} className="text-gray-400" />
          <h3 className="font-semibold text-gray-700">Upload Media</h3>
          <p className="text-sm text-gray-500">Drag and drop files here, or click to browse</p>
          <button className="mt-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-redHover transition">
            Choose Files
          </button>
        </div>
      </section>

      {/*Media Grid*/}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Media</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border overflow-hidden group hover:shadow-md transition">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <ImageIcon size={32} className="text-gray-400" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{item.size}</p>
                <button className="mt-2 flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
