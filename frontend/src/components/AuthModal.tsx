"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { fetchApi } from "../lib/api";

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authModalTab === "login") {
        const res = await fetchApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (res.user) {
          setUser(res.user);
          closeAuthModal();
        }
      } else {
        const res = await fetchApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        if (res.user) {
          setUser(res.user);
          closeAuthModal();
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-cinema-900 border border-cinema-700 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-cinema-muted hover:text-white hover:bg-cinema-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-cinema-700/80 mb-6">
          <button
            onClick={() => {
              openAuthModal("login");
              setError(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
              authModalTab === "login"
                ? "border-cinema-red text-white"
                : "border-transparent text-cinema-muted hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              openAuthModal("register");
              setError(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
              authModalTab === "register"
                ? "border-cinema-red text-white"
                : "border-transparent text-cinema-muted hover:text-slate-300"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === "register" && (
            <div>
              <label className="block text-xs font-medium text-cinema-muted mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariqul Islam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cinema-950 border border-cinema-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted focus:outline-none focus:border-cinema-red transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-cinema-muted mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted focus:outline-none focus:border-cinema-red transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cinema-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted focus:outline-none focus:border-cinema-red transition"
              />
            </div>
          </div>

          {authModalTab === "login" && (
            <div className="text-[11px] text-cinema-muted bg-cinema-950/60 p-2.5 rounded-lg border border-cinema-800">
              💡 Demo login: <span className="text-white font-mono">user@nexflix.com</span> / <span className="text-white font-mono">user123</span>
              <br />
              Admin: <span className="text-white font-mono">admin@nexflix.com</span> / <span className="text-white font-mono">admin123</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white font-semibold text-sm shadow-lg shadow-cinema-red/30 transition disabled:opacity-50 mt-2"
          >
            {isLoading ? "Processing..." : authModalTab === "login" ? "Sign In" : "Register Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
