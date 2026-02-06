import { useState } from "react";
import {
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Plus,
  Footprints,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useContent } from "@/context/ContentContext";

export default function FooterSectionEditor() {
  const { content, updateContent } = useContent();
  const footer = content.footer;

  const [brandName, setBrandName] = useState(footer.brand.name);
  const [brandLogo, setBrandLogo] = useState(footer.brand.logo);
  const [openMediaPicker, setOpenMediaPicker] = useState(false);
  const [footerLogo, setFooterLogo] = useState(footer.brand.logo);

  const [navLinks, setNavLinks] = useState([...footer.navLinks]);

  const [instagramUrl, setInstagramUrl] = useState(footer.instagram.url);
  const [instagramIcon, setInstagramIcon] = useState(footer.instagram.icon);

  const [address, setAddress] = useState(footer.contact.address);
  const [cityZip, setCityZip] = useState(footer.contact.cityZip);
  const [phone, setPhone] = useState(footer.contact.phone);

  function handleSave() {
    updateContent({
      footer: {
        brand: {
          name: brandName,
          logo: footerLogo,
        },
        navLinks,
        instagram: {
          url: instagramUrl,
          icon: instagramIcon,
        },
        contact: {
          address,
          cityZip,
          phone,
        },
      },
    });
  }

  function updateNav(index: number, field: string, value: string | boolean) {
    const copy = [...navLinks];
    (copy[index] as any)[field] = value;
    setNavLinks(copy);
  }

  function addNavLink() {
    setNavLinks([
      ...navLinks,
      { label: "", path: "", external: false, visible: true },
    ]);
  }

  function removeNavLink(index: number) {
    setNavLinks(navLinks.filter((_, i) => i !== index));
  }

  function moveNav(index: number, direction: number) {
    const newLinks = [...navLinks];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= newLinks.length) return;

    const temp = newLinks[index];
    newLinks[index] = newLinks[newIndex];
    newLinks[newIndex] = temp;

    setNavLinks(newLinks);
  }

  return (
    <div className="space-y-8 p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal mb-4">
        <div className="bg-brand-red rounded-lg p-1.5 flex items-center justify-center">
          <Footprints className="w-3.5 h-3.5 text-white" />
        </div>
        Footer Section Editor
      </h2>

      {/* BRAND */}
      <div className="space-y-3">
        <p className="font-medium text-gray-700">Footer Brand</p>

        <div className="space-y-2 bg-white/70 p-4 rounded-xl border shadow-sm">
          {/* Image Picker Box (same UI as Navbar editor) */}
          <div
            className="w-40 h-20 border rounded-xl bg-white/70 flex items-center justify-center cursor-pointer
      hover:ring-2 hover:ring-brand-red transition"
            onClick={() => setOpenMediaPicker(true)}
          >
            {footerLogo ? (
              <img
                src={footerLogo}
                alt="Footer Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <span className="text-gray-500 text-sm">Select Image</span>
            )}
          </div>

          <div>
            <Label>Brand Name</Label>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* NAV LINKS */}
      <div className="space-y-4">
        <p className="font-medium text-gray-700">Footer Navigation Links</p>

        <div className="space-y-4">
          {navLinks.map((link, index) => (
            <div
              key={index}
              className="bg-white/70 rounded-xl p-4 border shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <GripVertical className="cursor-grab" />

                <Input
                  value={link.label}
                  placeholder="Label (e.g. Hours, Careers)"
                  className="flex-1"
                  onChange={(e) => updateNav(index, "label", e.target.value)}
                />

                <Input
                  value={link.path}
                  placeholder="/path or https://"
                  className="flex-1"
                  onChange={(e) => updateNav(index, "path", e.target.value)}
                />

                <button
                  onClick={() => updateNav(index, "visible", !link.visible)}
                  className="p-2 text-gray-600 hover:text-brand-red"
                >
                  {link.visible !== false ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>

                <button
                  onClick={() => removeNavLink(index)}
                  className="p-2 text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Move buttons */}
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
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
          </div>

          <div>
            <Label>Instagram Icon URL</Label>
            <Input
              value={instagramIcon}
              onChange={(e) => setInstagramIcon(e.target.value)}
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
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <Label>City + ZIP</Label>
            <Input
              value={cityZip}
              onChange={(e) => setCityZip(e.target.value)}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </div>

      <Button
        className="w-full mt-6 bg-brand-red hover:bg-brand-red-hover text-white"
        onClick={handleSave}
      >
        Save Footer Changes
      </Button>
    </div>
  );
}
