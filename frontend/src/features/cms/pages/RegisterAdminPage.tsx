import { useState } from "react";
import { useContent } from "@/app/providers/ContentContext";

export default function RegisterAdminPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { content } = useContent();

  const addNewAdmin = async () => {
    const alreadyExists = content.adminUsers.some((user) => user.email === email);

    if (alreadyExists)
    {
      alert("The new admin wasn't registered because an admin with that email already exists");
      return;
    }
    else if ((password === "") || (email === ""))
    {
      alert("The new admin wasn't registered because some of the fields weren't completed");
      return;
    }

    try {
      const url = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");
      const res = await fetch(`${url}/api/adminUsers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          new_email: email,
          new_password: password,
        }),
      });
  
      if (!res.ok)
      {
        throw new Error("Failed to create new admin.");
      }
  
      const data = await res.json();
    }
    catch (err)
    {
      console.error(err);
    }

    alert("New admin registered");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="space-y-6">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email of new admin account"
        className="w-1/2 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs"
      />
      <br></br>

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password of new admin account"
        className="w-1/2 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs"
      />
      <br></br>

      <button className="bg-brand-red hover:bg-brand-red-hover text-white shadow-md shadow-black/10 px-8 py-2.5 rounded-md text-sm"
        onClick={addNewAdmin}>
        Register Admin Account
      </button>
    </div>
  );
}