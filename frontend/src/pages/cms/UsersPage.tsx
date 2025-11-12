import { useState } from "react";
import { mockUsers, type MockUser } from "@/data/mockUsers";
import { Trash, Users as UsersIcon, X } from "lucide-react";

export default function UsersPage() {
  //Page-local state so new users render immediately (no API yet)
  const [users, setUsers] = useState<MockUser[]>(mockUsers);

  //Modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Editor" as MockUser["role"],
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = (users.reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
    const newUser: MockUser = {
      id: nextId,
      name: form.name,
      email: form.email,
      role: form.role,
    };
    
    console.log("Create user:", newUser);
    setUsers((prev) => [...prev, newUser]);
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "Editor" });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">CMS / User Management</p>

      {/*Main card*/}
      <section className="bg-white rounded-xl shadow-sm border p-6 mt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <UsersIcon size={18} /> User Management
          </h2>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="self-start md:self-auto bg-brand-red text-white rounded-lg px-4 py-2 hover:bg-brand-redHover transition"
          >
            + Add User
          </button>
        </div>

        {/*Table for md+*/}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        u.role === "Admin"
                          ? "bg-brand-red text-white"
                          : "bg-brand-gold text-white"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                      aria-label={`Delete ${u.name}`}
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/*Cards for small screens*/}
        <div className="md:hidden space-y-3">
          {users.map((u) => (
            <div key={u.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">{u.name}</h3>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    u.role === "Admin" ? "bg-brand-red text-white" : "bg-brand-gold text-white"
                  }`}
                >
                  {u.role}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{u.email}</p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  aria-label={`Delete ${u.name}`}
                >
                  <Trash size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*Modal*/}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-lg border w-full max-w-md mx-4 p-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New User</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as MockUser["role"] }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 bg-brand-red text-white text-sm px-4 py-2 rounded-md hover:bg-brand-redHover transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
