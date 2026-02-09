import { useState } from "react";
import { useContent } from "@/context/ContentContext";

export default function RegisterAdminPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { content } = useContent();

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

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          if (email === content.adminUsers.email)
          {
            alert("email is already in the first entry of admin users in database");
          }
          else
          {
            alert("email isnt in the first entry of of admin users in database");
          }
        }}>
        Register Admin Account
      </button>
    </div>
  );
}
