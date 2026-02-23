// src/features/cms/pages/SettingsPage.tsx
import { useEffect, useRef, useState } from "react";
import {
  Inbox,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  fetchSettings,
  saveSettings,
  fetchInbox,
  markRead,
} from "@/shared/api/settings";
import type { AppSettings, ContactSubmission } from "@/shared/api/settings";

const DEFAULT_SETTINGS: AppSettings = {
  site: {
    siteName: "Pho City",
    tagline: "Authentic Vietnamese Cuisine",
    seoDescription:
      "Experience authentic Vietnamese flavors in Sacramento. Traditional pho, fresh rolls, and modern Vietnamese fusion crafted with passion.",
    googleAnalyticsId: "",
  },
  contact: {
    notificationEmail: "",
    emailNotificationsEnabled: false,
    storeSubmissions: true,
  },
  pdf: {
    menuLabel: "Download Menu",
    cacheTtlMinutes: 60,
  },
};

// ── Reusable field components ──────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition resize-none"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-brand-red" : "bg-gray-200"}`}
        />
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 ${className}`}
    >
      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-brand-red/80">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InboxPanel() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInbox();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkRead(id: number) {
    try {
      await markRead(id);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_read: 1 } : s)),
      );
    } catch {
      /* silent */
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const unreadCount = submissions.filter((s) => !s.is_read).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Inbox size={16} className="text-brand-red" />
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-brand-red/80">
            Message Inbox
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-red text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={load}
          className="p-1.5 text-gray-400 hover:text-brand-red transition"
          aria-label="Refresh inbox"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse">
              <div className="flex gap-3 mb-2">
                <div className="h-3.5 w-28 bg-gray-100 rounded" />
                <div className="h-3.5 w-40 bg-gray-100 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-5 py-8 text-center text-sm text-red-500">
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          No messages yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`px-5 py-4 ${!s.is_read ? "bg-brand-red/[0.03]" : ""}`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {!s.is_read && (
                  <span className="w-2 h-2 rounded-full bg-brand-red flex-shrink-0" />
                )}
                <span className="text-sm font-semibold text-gray-800">
                  {s.name}
                </span>
                <span className="text-xs text-gray-400">{s.email}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {formatDate(s.submitted_at)}
                </span>
              </div>

              {expanded === s.id ? (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {s.message}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                  {s.message}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setExpanded((p) => (p === s.id ? null : s.id))}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-red transition"
                >
                  {expanded === s.id ? (
                    <>
                      <ChevronUp size={12} /> Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} /> Read
                    </>
                  )}
                </button>
                {!s.is_read && (
                  <button
                    onClick={() => handleMarkRead(s.id)}
                    className="text-xs text-brand-red hover:text-brand-red/70 font-medium transition"
                  >
                    Mark read
                  </button>
                )}
                <a
                  href={`mailto:${s.email}?subject=Re: Your message&body=${encodeURIComponent(`Hi ${s.name},\n\n`)}`}
                  className="text-xs text-gray-400 hover:text-brand-red transition ml-auto"
                >
                  Reply
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const dirtyRef = useRef(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => setSettings(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function patch<K extends keyof AppSettings>(
    section: K,
    updates: Partial<AppSettings[K]>,
  ) {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    dirtyRef.current = true;
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const saved = await saveSettings(settings);
      setSettings(saved);
      setSaveStatus("success");
      dirtyRef.current = false;
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-white rounded-xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-brand-red/90 transition disabled:opacity-60"
        >
          {saving ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : saveStatus === "success" ? (
            <CheckCircle size={15} />
          ) : saveStatus === "error" ? (
            <AlertCircle size={15} />
          ) : (
            <Save size={15} />
          )}
          {saving
            ? "Saving…"
            : saveStatus === "success"
              ? "Saved!"
              : saveStatus === "error"
                ? "Error"
                : "Save Changes"}
        </button>
      </div>

      {/* 2-column grid for settings cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Identity */}
        <Card title="Site Identity">
          <div className="space-y-3">
            <div>
              <FieldLabel>Site Name</FieldLabel>
              <TextInput
                value={settings.site.siteName}
                onChange={(v) => patch("site", { siteName: v })}
                placeholder="Pho City"
              />
            </div>
            <div>
              <FieldLabel>Tagline</FieldLabel>
              <TextInput
                value={settings.site.tagline}
                onChange={(v) => patch("site", { tagline: v })}
                placeholder="Authentic Vietnamese Cuisine"
              />
            </div>
          </div>
        </Card>

        {/* PDF Menu */}
        <Card title="PDF Menu">
          <div className="space-y-3">
            <div>
              <FieldLabel>Download Button Label</FieldLabel>
              <TextInput
                value={settings.pdf.menuLabel}
                onChange={(v) => patch("pdf", { menuLabel: v })}
                placeholder="Download Menu"
              />
              <p className="text-xs text-gray-400 mt-1">
                Text shown on the PDF button in the hero section.
              </p>
            </div>
            <div>
              <FieldLabel>Cache Duration (minutes)</FieldLabel>
              <input
                type="number"
                min={0}
                max={1440}
                value={settings.pdf.cacheTtlMinutes}
                onChange={(e) =>
                  patch("pdf", {
                    cacheTtlMinutes: Math.max(
                      0,
                      parseInt(e.target.value, 10) || 0,
                    ),
                  })
                }
                className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
              />
              <p className="text-xs text-gray-400 mt-1">
                How long a generated PDF is cached per browser session. 0 = no
                cache.
              </p>
            </div>
          </div>
        </Card>

        {/* SEO */}
        <Card title="SEO">
          <div className="space-y-3">
            <div>
              <FieldLabel>Meta Description</FieldLabel>
              <TextArea
                value={settings.site.seoDescription}
                onChange={(v) => patch("site", { seoDescription: v })}
                placeholder="Describe the restaurant for search engines…"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-1">
                Recommended: 150–160 characters.{" "}
                <span
                  className={
                    settings.site.seoDescription.length > 160
                      ? "text-red-500"
                      : ""
                  }
                >
                  {settings.site.seoDescription.length} / 160
                </span>
              </p>
            </div>
            <div>
              <FieldLabel>Google Analytics ID</FieldLabel>
              <TextInput
                value={settings.site.googleAnalyticsId}
                onChange={(v) => patch("site", { googleAnalyticsId: v })}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave blank to disable tracking.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Notifications */}
        <Card title="Contact Notifications">
          <div className="space-y-4">
            <Toggle
              checked={settings.contact.emailNotificationsEnabled}
              onChange={(v) =>
                patch("contact", { emailNotificationsEnabled: v })
              }
              label="Email notifications"
              description="Receive an email when a visitor submits the contact form."
            />
            {settings.contact.emailNotificationsEnabled && (
              <div>
                <FieldLabel>Notification Email</FieldLabel>
                <TextInput
                  type="email"
                  value={settings.contact.notificationEmail}
                  onChange={(v) => patch("contact", { notificationEmail: v })}
                  placeholder="owner@example.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Falls back to GMAIL_USER env var if blank.
                </p>
              </div>
            )}
            <Toggle
              checked={settings.contact.storeSubmissions}
              onChange={(v) => patch("contact", { storeSubmissions: v })}
              label="Store messages in inbox"
              description="Save submissions to the database for review below."
            />
          </div>
        </Card>
      </div>

      {/* Inbox — full width below the grid */}
      <InboxPanel />
    </div>
  );
}
