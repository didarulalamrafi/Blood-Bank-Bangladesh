"use client";

/**
 * ==============================================================
 * User Login Page
 * ==============================================================
 * সাধারণ ইউজার (দাতা/গ্রহীতা) এখান থেকে email + password দিয়ে
 * লগইন করবে। লগইন সফল হলে Better Auth নিজে থেকেই secure,
 * httpOnly cookie সেট করে দেয় — localStorage এ কিছু রাখা লাগে না।
 * ==============================================================
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await signIn.email({
        email,
        password,
      });

      if (signInError) {
        // Better Auth নিজেই readable error message দেয়
        setError(signInError.message || "লগইন ব্যর্থ হয়েছে");
        return;
      }

      // লগইন সফল হলে ইউজার ড্যাশবোর্ডে পাঠিয়ে দাও
      router.push("/dashboard");
    } catch (err) {
      setError("সার্ভারের সাথে সংযোগ করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">আমার ব্লাড ব্যাংক</h1>
          <p className="mt-1 text-sm text-zinc-500">আপনার একাউন্টে লগইন করুন</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              ইমেইল
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-500">
                পাসওয়ার্ড
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-red-600 hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-sm outline-none focus:border-red-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? "লুকান" : "দেখুন"}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          নতুন এখানে?{" "}
          <Link
            href="/register"
            className="font-semibold text-red-600 hover:underline"
          >
            একাউন্ট তৈরি করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
