import { useState } from "react";
//Asset imports for any Icons/Images
import ChefIcon from "@/shared/assets/ChefIcon.svg";
import SecurityIcon from "@/shared/assets/SecurityIcon.svg";
import PasswordLockedIcon from "@/shared/assets/PasswordLockedIcon.svg";
import ShowPasswordIcon from "@/shared/assets/ShowPasswordIcon.svg";

//Just to make password visible for password input
export default function AdminLogin() {
  const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function handleLogin() {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Login failed");
      return;
    }

    window.location.href = "/cms/dashboard";
  } catch {
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
}

  /*Everything Below is just rendering the setup for the login Page you will see for our CMS system*/
  return (
    <div className="min-h-screen flex items-center justify-center">
      {" "}
      {/*Centering the Login*/}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
        {" "}
        {/*Sizing for the Login*/}
        {/*Red Header for CMS Login*/}
        <div className="p-6 flex flex-col items-center bg-brand-red brightness-90">
          <div className="bg-white/20 rounded-full p-2 mb-2 flex items-center justify-center">
            <img src={ChefIcon} alt="Chef Icon" className="w-5 h-5" />
          </div>
          <h1 className="text-white text-xl font-semibold">Pho City Admin</h1>
          <p className="text-brand-cream text-[10px] mt-1 text-center opacity-90">
            Content Management System
          </p>
        </div>
        {/*--------------Split for Red Header and Secure Access Section------------------*/}
        {/*Secure Access Section*/}
        <div className="p-6 flex flex-col items-center">
          <div className="bg-gradient-to-b from-brand-gold to-brand-goldHover rounded-full p-3 mb-4 flex items-center justify-center">
            <img src={SecurityIcon} alt="Security Icon" className="h-6 w-6" />{" "}
            {/*Icon(Chef Hat) Found in Assets*/}
          </div>
          <h2 className="font-bold text-sm text-gray-700">Secure Access</h2>
          <p className="text-gray-500 text-xs text-center mb-4">Enter your credentials to manage restaurant content</p>

          {/*Label above email input*/}
          <label className="w-full text-xs text-black-700 mb-1">Admin Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs mb-3"
          />

          
          {/*Label above password input*/}
          <label className="w-full text-xs text-black-700 mb-1">
            Admin Password
          </label>
          <div className="relative w-full mb-4">
            {/*(Left side Password-Input) lock icon*/}
            <img
              src={PasswordLockedIcon}
              alt="Lock"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none"
            />

            {/*Password input for login*/}
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs"
            />

            {/*(Right side Password-Input) eye icon - clickable, toggles visibility*/}
            <img
              src={ShowPasswordIcon}
              alt="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-80 cursor-pointer hover:opacity-100 z-20"
              onClick={() => setShowPassword((s) => !s)}
            />
          </div>

          {/*Error message display if login fails*/}
          {error && (
            <div className="w-full text-xs text-red-600 mb-3 text-center">
              {error}
            </div>
          )}

          {/*Access button*/} {/*Will implement a login authentication*/}
          <button
            className="w-full bg-gradient-to-b from-brand-red to-brand-redHover text-white text-xs py-2 rounded-lg hover:bg-brand-redHover transition disabled:opacity-70"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Access Admin Dashboard"}
          </button>
          {/*Demo Credentials*/}
          <div className="mt-6 p-3 text-center text-sm text-brand-charcoal w-full rounded-[10px] bg-gradient-to-r from-brand-gold/10 to-brand-gold/10">
            <p className="mb-1 font-semibold text-xs">Demo Credentials</p>
            <p className="mb-1 text-xs">Email: admin@phocity.com</p>
            <p className="mb-1 text-xs">Password: changeme</p>
            <a
              href="/"
              className="text-brand-gold hover:underline text-xs inline-block mt-1"
            >
              ← Return to Restaurant Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
