// src/features/auth/pages/AdminLogin.tsx
import { useState } from "react";
import ChefIcon from "@/shared/assets/ChefIcon.svg";
import SecurityIcon from "@/shared/assets/SecurityIcon.svg";
import PasswordLockedIcon from "@/shared/assets/PasswordLockedIcon.svg";
import ShowPasswordIcon from "@/shared/assets/ShowPasswordIcon.svg";

const API_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "";


type ResetStep = "email" | "code";

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong.");
        return;
      }
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Reset failed. Check your code and try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-5 bg-brand-red flex items-center justify-between">
          <h2 className="text-white text-sm font-semibold">Reset Admin Password</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 text-sm font-medium">
                Password reset successfully!
              </p>
              <p className="text-gray-500 text-xs">You can now log in with your new password.</p>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-brand-red text-white text-xs py-2 rounded-lg hover:brightness-110"
              >
                Back to Login
              </button>
            </div>
          ) : step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <p className="text-xs text-gray-500">
                Enter your admin email address and we'll send you a reset code.
              </p>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red text-white text-xs py-2 rounded-lg hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-gray-500">
                Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span> and choose a new password.
              </p>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Reset Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal tracking-widest"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red text-white text-xs py-2 rounded-lg hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(""); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Red Header */}
        <div className="p-6 flex flex-col items-center bg-brand-red brightness-90">
          <div className="bg-white/20 rounded-full p-2 mb-2 flex items-center justify-center">
            <img src={ChefIcon} alt="Chef Icon" className="w-5 h-5" />
          </div>
          <h1 className="text-white text-xl font-semibold">Pho City Admin</h1>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col items-center">
          <div className="bg-gradient-to-b from-brand-gold to-brand-goldHover rounded-full p-3 mb-4 flex items-center justify-center">
            <img src={SecurityIcon} alt="Security Icon" className="h-6 w-6" />
          </div>
          <h2 className="font-bold text-sm text-gray-700">Secure Access</h2>
          <p className="text-gray-500 text-xs text-center mb-4">
            Enter your credentials to manage restaurant content
          </p>

          <label className="w-full text-xs text-gray-700 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs mb-3"
          />

          <label className="w-full text-xs text-gray-700 mb-1">Password</label>
          <div className="relative w-full mb-1">
            <img
              src={PasswordLockedIcon}
              alt="Lock"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red bg-brand-cream border-2 border-brand-gold text-brand-charcoal text-xs"
            />
            <img
              src={ShowPasswordIcon}
              alt="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-80 cursor-pointer hover:opacity-100 z-20"
              onClick={() => setShowPassword((s) => !s)}
            />
          </div>

          {/* Forgot password link */}
          <div className="w-full flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-brand-gold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="w-full text-xs text-red-600 mb-3 text-center">{error}</div>
          )}

          <button
            className="w-full bg-brand-red text-white text-xs py-2 rounded-lg hover:brightness-110 disabled:opacity-60"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Access Admin Dashboard"}
          </button>

          <div className="mt-6 p-3 text-center text-sm text-brand-charcoal w-full rounded-[10px] bg-gradient-to-r from-brand-gold/10 to-brand-gold/10">
            <a href="/" className="text-brand-gold hover:underline text-xs inline-block mt-1">
              ← Return to main site
            </a>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
