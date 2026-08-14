"use client";

/**
 * ==============================================================
 * Admin Login Page
 * ==============================================================
 * এই পেজে Admin email + password দিয়ে লগইন করবে।
 * লগইন সফল হলে Better Auth নিজে থেকেই একটা secure, httpOnly
 * cookie সেট করে দেয় — সেটা localStorage এ কিছু রাখা লাগে না
 * (আগের ভার্সনে localStorage token ব্যবহার হচ্ছিল, এখন এটা বাদ)
 * ==============================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
// ⚠️ এই পেজ যদি src/app/login/page.jsx এ থাকে, তাহলে
// auth-client.js কে src/lib/auth-client.js এ রাখুন এবং
// "@/lib/auth-client" (Next.js এর @ alias) দিয়ে import করুন
import { signIn } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // লগইন সফল হলে admin dashboard এ পাঠিয়ে দাও
      router.push("/admin/donors");
    } catch (err) {
      setError("সার্ভারের সাথে সংযোগ করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">BBB Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">লগইন করে Dashboard এ যান</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500"
              placeholder="••••••••"
            />
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
      </div>
    </div>
  );
}
