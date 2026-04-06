"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<{ name: string, email: string, phone?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Phone Form State
  const [phone, setPhone] = useState("");
  const [phoneCurrentPassword, setPhoneCurrentPassword] = useState("");
  
  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show password toggles
  const [showPhoneCurrent, setShowPhoneCurrent] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("agrovanta_token");
    const storedUserStr = localStorage.getItem("agrovanta_user");
    
    if (!storedToken || !storedUserStr) {
      router.push("/signin");
      return;
    }
    
    setToken(storedToken);
    
    try {
      const storedUser = JSON.parse(storedUserStr);
      setUser(storedUser);
      if (storedUser.phone) {
        setPhone(storedUser.phone);
      }
    } catch (e) {
      console.error("Failed to parse user data");
    }
  }, [router]);

  const showPrompt = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!phoneCurrentPassword)) {
      showPrompt("Current password is required to save changes", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          current_password: phoneCurrentPassword,
          new_phone: phone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update phone number");
      }

      const updatedUser = { ...user, phone: data.user.phone };
      localStorage.setItem("agrovanta_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setPhoneCurrentPassword("");
      showPrompt("Phone number updated successfully!", "success");

    } catch (err: any) {
      showPrompt(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      showPrompt("New passwords do not match", "error");
      return;
    }
    
    if (newPassword.length < 6) {
      showPrompt("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showPrompt("Password updated successfully!", "success");

    } catch (err: any) {
      showPrompt(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => show ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  if (!user) {
    return (
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your profile and security preferences.</p>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Profile Details</h2>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Name</label>
              <div className="text-white/90 font-medium px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                {user.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
              <div className="text-white/90 font-medium px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                {user.email}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdatePhone} className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-emerald-400 mb-4">Update Phone Number</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition-all placeholder:text-white/30"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Current Password (to save changes)</label>
              <div className="relative">
                <input
                  type={showPhoneCurrent ? "text" : "password"}
                  required
                  value={phoneCurrentPassword}
                  onChange={(e) => setPhoneCurrentPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPhoneCurrent(!showPhoneCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <EyeIcon show={showPhoneCurrent} />
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
            >
              Update Profile
            </button>
          </form>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Security</h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <EyeIcon show={showCurrent} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <EyeIcon show={showNew} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
