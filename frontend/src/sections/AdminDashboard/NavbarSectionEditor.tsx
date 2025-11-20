import { useState } from "react";
import { Eye, EyeOff, Trash2, GripVertical, Plus } from "lucide-react";
// import { MediaPickerModal } from "@/components/MediaPickerModal";

export function NavbarSectionEditor() {
  //TEMP STATE (replace with API later)
  const [logo, setLogo] = useState<string | null>(null);

  const [links, setLinks] = useState([
    { id: 1, label: "Home", path: "/", visible: true },
    { id: 2, label: "About", path: "/about", visible: true },
    { id: 3, label: "Contact", path: "/contact", visible: true },
    { id: 4, label: "Menu", path: "/menu", visible: true },
  ]);

  const [pickupUrl, setPickupUrl] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");

  const [openMediaPicker, setOpenMediaPicker] = useState(false);

  //Update link fields
  const updateLink = (id: number, field: string, value: string | boolean) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  //Add new link
  const addLink = () => {
    setLinks((prev) => [
      ...prev,
      { id: Date.now(), label: "", path: "", visible: true },
    ]);
  };

  //Remove link
  const removeLink = (id: number) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  //Reorder links
  const moveLink = (index: number, direction: number) => {
    const newLinks = [...links];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= newLinks.length) return;

    const temp = newLinks[index];
    newLinks[index] = newLinks[newIndex];
    newLinks[newIndex] = temp;

    setLinks(newLinks);
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-semibold text-brand-red">Navbar Settings</h2>

      {/*LOGO SECTION*/}
      <div className="space-y-3">
        <p className="font-medium text-gray-700">Navbar Logo</p>

        <div
          className="w-40 h-20 border rounded-xl bg-white/70 flex items-center justify-center cursor-pointer
          hover:ring-2 hover:ring-brand-red transition"
          onClick={() => setOpenMediaPicker(true)}
        >
          {logo ? (
            <img
              src={logo}
              alt="Logo Preview"
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <span className="text-gray-500 text-sm">Select Image</span>
          )}
        </div>
      </div>

      {/*LINKS SECTION*/}
      <div className="space-y-4">
        <p className="font-medium text-gray-700">Navigation Links</p>

        <div className="space-y-4">
          {links.map((link, index) => (
            <div
              key={link.id}
              className="bg-white/70 rounded-xl p-4 border shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <GripVertical className="cursor-grab" onClick={() => {}} />

                <input
                  value={link.label}
                  placeholder="Label (e.g., Home)"
                  className="flex-1 border rounded p-2"
                  onChange={(e) => updateLink(link.id, "label", e.target.value)}
                />

                <input
                  value={link.path}
                  placeholder="/home"
                  className="flex-1 border rounded p-2"
                  onChange={(e) => updateLink(link.id, "path", e.target.value)}
                />

                <button
                  onClick={() => updateLink(link.id, "visible", !link.visible)}
                  className="p-2 text-gray-600 hover:text-brand-red"
                >
                  {link.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

                <button
                  onClick={() => removeLink(link.id)}
                  className="p-2 text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Move Up / Move Down buttons */}
              <div className="flex gap-2 ml-8">
                <button
                  onClick={() => moveLink(index, -1)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveLink(index, 1)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
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
        >
          <Plus size={18} /> Add Link
        </button>
      </div>

      {/*CTA BUTTONS SECTION*/}
      <div className="space-y-4">
        <p className="font-medium text-gray-700">Order Button URLs</p>

        <input
          type="text"
          className="w-full border rounded p-3"
          placeholder="Pickup URL"
          value={pickupUrl}
          onChange={(e) => setPickupUrl(e.target.value)}
        />

        <input
          type="text"
          className="w-full border rounded p-3"
          placeholder="Delivery URL"
          value={deliveryUrl}
          onChange={(e) => setDeliveryUrl(e.target.value)}
        />
      </div>

      {/* FUTURE*/}
      {/* 
      <MediaPickerModal 
        open={openMediaPicker} 
        onClose={() => setOpenMediaPicker(false)}
        onSelect={(url) => {
          setLogo(url);
          setOpenMediaPicker(false);
        }}
      />
      */}
    </div>
  );
}
