import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Mailbox } from "lucide-react";
import { ContactInfo } from "@/types";

export function ContactSectionEditor() {
  const [contact, setContact] = useState<ContactInfo>({
    address: "",
    phone: "",
    email: "",
    onlineOrdering: "",
    hours: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/contact`, { credentials: "include" })
      .then((res) => res.json())
      .then((data: ContactInfo) => {
        setContact(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setContact((prev) => ({
      ...prev,
      hours: { ...prev.hours, [day]: value },
    }));
  };

  const saveContact = () => {
    setSaving(true);
    fetch(`${BACKEND_URL}/api/admin/contact`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => setSaving(false))
      .catch(() => setSaving(false));
  };

  if (loading) return <p>Loading contact info...</p>;

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  function InfoBox({
    icon,
    title,
    lines,
  }: {
    icon: React.ReactNode;
    title: string;
    lines: React.ReactNode[];
  }) {
    return (
      <li className="flex gap-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <p className="font-semibold text-lg text-brand-red">{title}</p>
          {lines.map((line, i) => (
            <p key={i} className="text-gray-700">
              {line}
            </p>
          ))}
        </div>
      </li>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-charcoal mb-4">
          <div className="bg-brand-red rounded-lg p-1.5 flex items-center justify-center">
            <Mailbox className="w-3.5 h-3.5 text-white" />
          </div>
          Contact Section Editor
        </h2>

        <label className="block">
          <span className="text-gray-700">Address</span>
          <input
            type="text"
            value={contact.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="mt-1 block w-full border rounded-lg p-2"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Phone</span>
          <input
            type="text"
            value={contact.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="mt-1 block w-full border rounded-lg p-2"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Email</span>
          <input
            type="text"
            value={contact.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="mt-1 block w-full border rounded-lg p-2"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Online Ordering Link</span>
          <input
            type="text"
            value={contact.onlineOrdering}
            onChange={(e) => handleChange("onlineOrdering", e.target.value)}
            className="mt-1 block w-full border rounded-lg p-2"
          />
        </label>

        <div>
          <span className="text-gray-700 font-semibold">Hours</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {daysOfWeek.map((day) => (
              <div key={day}>
                <label className="block text-sm">{day}</label>
                <input
                  type="text"
                  value={contact.hours[day] || ""}
                  onChange={(e) => handleHoursChange(day, e.target.value)}
                  className="mt-1 block w-full border rounded-lg p-1 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={saveContact}
          disabled={saving}
          className="mt-2 px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-redHover transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Live Preview */}
      <div className="bg-gray-50 p-4 rounded-xl border space-y-6">
        <h3 className="font-semibold text-gray-800 text-lg">Live Preview</h3>
        <ul className="space-y-4">
          <InfoBox
            icon={<MapPin className="w-6 h-6 text-brand-red" />}
            title="Location"
            lines={[contact.address]}
          />
          <InfoBox
            icon={<Phone className="w-6 h-6 text-brand-red" />}
            title="Phone"
            lines={[contact.phone]}
          />
          <InfoBox
            icon={<Clock className="w-6 h-6 text-brand-red" />}
            title="Hours"
            lines={daysOfWeek.map(
              (day) => `${day}: ${contact.hours[day] || ""}`
            )}
          />
          <InfoBox
            icon={<Mail className="w-6 h-6 text-brand-red" />}
            title="Email"
            lines={[contact.email]}
          />
          <InfoBox
            icon={<MapPin className="w-6 h-6 text-brand-red" />}
            title="Order Online"
            lines={[
              <a
                key="link"
                href={contact.onlineOrdering}
                target="_blank"
                className="text-brand-red hover:underline"
              >
                {contact.onlineOrdering || "N/A"}
              </a>,
            ]}
          />
        </ul>
      </div>
    </div>
  );
}
