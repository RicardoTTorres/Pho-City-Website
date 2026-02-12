import { useState } from "react";
import { useContent } from "@/context/ContentContext";

export default function RegisterAdminPage() {
  // Local form state for a simple demo register flow.
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { content } = useContent();
  const adminUsers = Array.isArray(content.adminUsers)
    ? content.adminUsers
    : [];

  return (
    <div className="space-y-6">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email of new admin account"
        className="w-full rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs"
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password of new admin account"
        className="w-full rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs"
      />

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          // Simple client-side check using the fetched admin list.
          const exists = adminUsers.some((user) => user.email === email);
          if (exists) {
            alert("Email is already in the admin users list.");
          } else {
            alert("Email is not in the admin users list.");
          }
        }}
      >
        Register Admin Account
      </button>
    </div>
  );
}
