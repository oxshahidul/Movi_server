"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { fetchApi } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.user) {
        setUser(res.user);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cinema-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cinema-900 border border-cinema-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cinema-red mx-auto flex items-center justify-center shadow-lg shadow-cinema-red/30">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Sign In to ScreenBox</h1>
          <p className="text-xs text-cinema-muted">Access bufferless BDIX cinema streaming</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cinema-950 border border-cinema-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-red"
              />
            </div>
          </div>

          <div className="text-[11px] text-cinema-muted bg-cinema-950/70 p-3 rounded-xl border border-cinema-800">
            💡 Demo user: <span className="text-white font-mono">user@screenbox.com</span> / <span className="text-white font-mono">user123</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white text-sm font-bold shadow-lg shadow-cinema-red/30 transition disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-cinema-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-cinema-red font-semibold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
