// src/features/cms/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import { Trash, Users as UsersIcon, X, KeyRound, Plus } from "lucide-react";
import type { AdminUser } from "@/shared/content/content.types";

const API_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "";

type Modal =
  | { type: "add" }
  | { type: "changePassword"; user: AdminUser }
  | { type: "confirmDelete"; user: AdminUser }
  | null;

function roleBadge(role: string) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        isAdmin ? "bg-brand-red text-white" : "bg-brand-gold text-white"
      }`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}) {
  const [form, setForm] = useState({ email: "", password: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/adminUsers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create user");
        return;
      }
      onCreated(data.adminUser);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Add New User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputCls}
            placeholder="user@example.com"
            required
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={inputCls}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </Field>
        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className={inputCls}
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </Field>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <ModalActions onClose={onClose} submitLabel="Create User" saving={saving} />
      </form>
    </ModalShell>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/adminUsers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password");
        return;
      }
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={`Change Password — ${user.email}`} onClose={onClose}>
      {success ? (
        <p className="text-center text-green-600 text-sm py-4">Password updated!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="New Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </Field>
          <Field label="Confirm Password">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              required
            />
          </Field>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <ModalActions onClose={onClose} submitLabel="Update Password" saving={saving} />
        </form>
      )}
    </ModalShell>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmDeleteModal({
  user,
  onClose,
  onConfirm,
  deleting,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <ModalShell title="Delete Admin Account" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
          <Trash size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">
              This action cannot be undone.
            </p>
            <p className="text-sm text-red-600 mt-1">
              The account for <span className="font-semibold">{user.email}</span> will
              be permanently removed. They will immediately lose access to the CMS.
            </p>
          </div>
        </div>
        <div className="pt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="text-sm px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-60"
          >
            <Trash size={14} />
            {deleting ? "Deleting..." : "Yes, delete account"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg border w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onClose,
  submitLabel,
  saving,
}: {
  onClose: () => void;
  submitLabel: string;
  saving: boolean;
}) {
  return (
    <div className="pt-2 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="text-sm px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="bg-brand-red text-white text-sm px-4 py-2 rounded-md hover:bg-brand-redHover transition disabled:opacity-60"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadUsers() {
    setFetchError("");
    try {
      const res = await fetch(`${API_URL}/api/adminUsers`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(Array.isArray(data.adminUsers) ? data.adminUsers : []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleDeleteConfirmed(id: number) {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/adminUsers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 204 || res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setModal(null);
      }
    } catch {
      // silently fail — user stays in list
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <UsersIcon size={18} /> User Management
          </h2>
          <button
            type="button"
            onClick={() => setModal({ type: "add" })}
            className="self-start md:self-auto inline-flex items-center gap-2 bg-brand-red text-white rounded-lg px-4 py-2 text-sm hover:bg-brand-redHover transition"
          >
            <Plus size={16} /> Add User
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <p className="text-sm text-red-500">{fetchError}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-400">No users found.</p>
        ) : (
          <>
            {/* Table — md+ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Email", "Role", "Created", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{u.email}</td>
                      <td className="px-4 py-3">{roleBadge(u.role)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModal({ type: "changePassword", user: u })}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                          >
                            <KeyRound size={13} /> Password
                          </button>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "confirmDelete", user: u })}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-red-100 text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <div key={u.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(u.created_at)}</p>
                    </div>
                    {roleBadge(u.role)}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModal({ type: "changePassword", user: u })}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <KeyRound size={13} /> Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ type: "confirmDelete", user: u })}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-red-100 text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {modal?.type === "add" && (
        <AddUserModal
          onClose={() => setModal(null)}
          onCreated={(user) => {
            setUsers((prev) => [...prev, user]);
            setModal(null);
          }}
        />
      )}

      {modal?.type === "changePassword" && (
        <ChangePasswordModal user={modal.user} onClose={() => setModal(null)} />
      )}

      {modal?.type === "confirmDelete" && (
        <ConfirmDeleteModal
          user={modal.user}
          onClose={() => setModal(null)}
          onConfirm={() => handleDeleteConfirmed(modal.user.id)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
