import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MapPin, Phone, Mail, Clock, Mailbox } from "lucide-react";

type BusinessHour = {
  day: string;
  open: string | null;
  close: string | null;
  closed: boolean;
};

type ContactInfo = {
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  email: string;
  onlineOrdering: string;
  businessHours: BusinessHour[];
};

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function emptyBusinessHours(): BusinessHour[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    open: null,
    close: null,
    closed: false,
  }));
}

function formatHoursValue(hour: BusinessHour): string {
  if (hour.closed) return "Closed";
  const open = hour.open ? String(hour.open).slice(0, 5) : "";
  const close = hour.close ? String(hour.close).slice(0, 5) : "";
  if (!open || !close) return "";
  return `${open} - ${close}`;
}

function parseHoursValue(value: string, original: BusinessHour): BusinessHour {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ...original, open: null, close: null, closed: false };
  }

  if (trimmed.toLowerCase() === "closed") {
    return { ...original, open: null, close: null, closed: true };
  }

  const [open, close] = trimmed.split("-").map((part) => part.trim());
  if (!open || !close) {
    return original;
  }

  return { ...original, open, close, closed: false };
}

export function ContactSectionEditor() {
  const [contact, setContact] = useState<ContactInfo>({
    address: "",
    city: "",
    state: "",
    zipcode: "",
    phone: "",
    email: "",
    onlineOrdering: "",
    businessHours: emptyBusinessHours(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/contact`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setContact({
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zipcode: data.zipcode ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          onlineOrdering: "",
          businessHours: Array.isArray(data.businessHours)
            ? data.businessHours
            : emptyBusinessHours(),
        });
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setContact((prev) => ({
      ...prev,
      businessHours: prev.businessHours.map((entry) =>
        entry.day === day ? parseHoursValue(value, entry) : entry,
      ),
    }));
  };

  const saveContact = () => {
    setSaving(true);
    fetch(`${API_URL}/api/admin/contact`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zipcode: contact.zipcode,
        businessHours: contact.businessHours,
      }),
      credentials: "include",
    })
      .then(() => null)
      .finally(() => setSaving(false));
  };

  if (loading) return <p>Loading contact info...</p>;

  function InfoBox({
    icon,
    title,
    lines,
  }: {
    icon: ReactNode;
    title: string;
    lines: ReactNode[];
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

  const addressLine = [contact.address, contact.city, contact.state, contact.zipcode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid md:grid-cols-2 gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label className="block">
            <span className="text-gray-700">City</span>
            <input
              type="text"
              value={contact.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="mt-1 block w-full border rounded-lg p-2"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">State</span>
            <input
              type="text"
              value={contact.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className="mt-1 block w-full border rounded-lg p-2"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">ZIP</span>
            <input
              type="text"
              value={contact.zipcode}
              onChange={(e) => handleChange("zipcode", e.target.value)}
              className="mt-1 block w-full border rounded-lg p-2"
            />
          </label>
        </div>

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
            {DAYS_OF_WEEK.map((day) => {
              const row = contact.businessHours.find((h) => h.day === day);
              return (
                <div key={day}>
                  <label className="block text-sm">{day}</label>
                  <input
                    type="text"
                    value={row ? formatHoursValue(row) : ""}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    className="mt-1 block w-full border rounded-lg p-1 text-sm"
                    placeholder="09:00 - 20:00 or Closed"
                  />
                </div>
              );
            })}
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

      <div className="bg-gray-50 p-4 rounded-xl border space-y-6">
        <h3 className="font-semibold text-gray-800 text-lg">Live Preview</h3>
        <ul className="space-y-4">
          <InfoBox
            icon={<MapPin className="w-6 h-6 text-brand-red" />}
            title="Location"
            lines={[addressLine]}
          />
          <InfoBox
            icon={<Phone className="w-6 h-6 text-brand-red" />}
            title="Phone"
            lines={[contact.phone]}
          />
          <InfoBox
            icon={<Clock className="w-6 h-6 text-brand-red" />}
            title="Hours"
            lines={DAYS_OF_WEEK.map((day) => {
              const row = contact.businessHours.find((h) => h.day === day);
              return `${day}: ${row ? formatHoursValue(row) : ""}`;
            })}
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
                rel="noreferrer"
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
