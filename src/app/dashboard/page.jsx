"use client";

/**
 * ==============================================================
 * Dashboard Page (/dashboard)
 * ==============================================================
 * Logged-in user এর overview: account summary, donor status,
 * পরবর্তী eligible donation date (approx), আর সাম্প্রতিক
 * donation history — সব এক জায়গায়।
 *
 * Data source: GET /api/users/:id  (backend এ বানাতে হবে)
 * এই route টা user + donor profile + সর্বশেষ কয়েকটা donation
 * একসাথে রিটার্ন করবে বলে ধরে নেওয়া হয়েছে, যেমন:
 * {
 *   user: { id, name, email, phone, image },
 *   donor: { bloodGroup, district, upazila, union, totalDonations,
 *            lastDonationDate, bloodBankName, bio } | null,
 *   recentDonations: [{ id, date, location, notes }]
 * }
 * ==============================================================
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Droplet,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const DAYS_BETWEEN_DONATIONS = 90; // approx eligibility window — confirm against your program's actual medical guideline

function daysBetween(dateA, dateB) {
  return Math.round(
    (dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setLoggingOut(false);
      setError("লগ আউট করা যায়নি, আবার চেষ্টা করুন।");
    }
  };

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?next=/dashboard");
    }
  }, [sessionLoading, session, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(`/api/users/${session.user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => setProfileData(data))
      .catch(() => setError("তথ্য লোড করা যায়নি, পেজ রিফ্রেশ করে দেখুন।"))
      .finally(() => setLoading(false));
  }, [session]);

  if (sessionLoading || !session?.user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-400">লোড হচ্ছে...</p>
      </div>
    );
  }

  const donor = profileData?.donor || null;
  const recentDonations = profileData?.recentDonations || [];

  let eligibility = null;
  if (donor?.lastDonationDate) {
    const last = new Date(donor.lastDonationDate);
    const now = new Date();
    const passed = daysBetween(last, now);
    const remaining = DAYS_BETWEEN_DONATIONS - passed;
    eligibility =
      remaining > 0
        ? { eligible: false, remaining }
        : { eligible: true, remaining: 0 };
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">স্বাগতম,</p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {session.user.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              প্রোফাইল এডিট
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "..." : "লগ আউট"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            লোড হচ্ছে...
          </div>
        ) : !donor ? (
          /* No donor profile yet — CTA */
          <div className="rounded-lg border border-dashed border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
              <Droplet className="h-6 w-6 text-red-600" fill="currentColor" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              আপনি এখনো ডোনার প্রোফাইল সম্পূর্ণ করেননি
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
              রক্তের গ্রুপ, লোকেশন যোগ করলে কেউ প্রয়োজনে আপনাকে খুঁজে পাবে।
            </p>
            <Link
              href="/donor/add"
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              ডোনার প্রোফাইল তৈরি করুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs text-zinc-500">রক্তের গ্রুপ</p>
                <p className="mt-1 text-xl font-bold text-red-600">
                  {donor.bloodGroup || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs text-zinc-500">মোট দান</p>
                <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {donor.totalDonations ?? 0}
                </p>
              </div>
              <div className="col-span-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:col-span-2">
                <p className="text-xs text-zinc-500">শেষ দান</p>
                <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(donor.lastDonationDate)}
                </p>
                {eligibility && (
                  <p
                    className={`mt-1 text-xs font-medium ${
                      eligibility.eligible ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {eligibility.eligible
                      ? "আপনি এখন রক্ত দিতে পারবেন"
                      : `আরও প্রায় ${eligibility.remaining} দিন অপেক্ষা করুন`}
                  </p>
                )}
              </div>
            </div>

            {/* Location card */}
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
              {[donor.district, donor.upazila, donor.union]
                .filter(Boolean)
                .join(", ") || "লোকেশন যোগ করা হয়নি"}
            </div>

            {/* Donation history */}
            <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  সাম্প্রতিক দান
                </h3>
                <Link
                  href="/profile#donations"
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  সব দেখুন
                </Link>
              </div>

              {recentDonations.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-400">
                  এখনো কোনো দানের তথ্য যোগ করা হয়নি।
                </p>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {recentDonations.slice(0, 4).map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                        <Droplet
                          className="h-4 w-4 text-red-600"
                          fill="currentColor"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {d.location || "লোকেশন উল্লেখ নেই"}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-zinc-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(d.date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <Link
                  href="/profile#donations"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  নতুন দানের তথ্য যোগ করুন
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
