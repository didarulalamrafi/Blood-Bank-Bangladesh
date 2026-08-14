"use client";

/**
 * ==============================================================
 * DonorSearch — Redesign (আপনার Navbar/Admin পেজের সাথে মিলিয়ে)
 * ==============================================================
 * আপনার অন্যান্য পেজে যেই design pattern গুলো দেখা যাচ্ছিল, সেগুলো
 * এখানে মিলিয়ে আনা হয়েছে:
 * ১. rounded-full pill button — Navbar এর "Add Donor" বাটনের মতো
 * ২. rounded-xl card + border-zinc-200 + shadow — Admin dashboard
 *    এর card গুলোর মতো
 * ৩. red-600 → hover:red-700 — brand accent সব জায়গায় একই
 * ৪. Droplet আইকন — Home page এর hero section এর সাথে সামঞ্জস্যপূর্ণ
 *
 * মূল বদল: Blood Group dropdown এর বদলে এখন horizontal scroll করা
 * pill button (একটা ট্যাপ করলেই select) — মোবাইলে dropdown এর
 * চেয়ে অনেক দ্রুত ও visually blood-group card এর মতো লাগে, এটাই
 * এই কম্পোনেন্টের signature/distinctive অংশ।
 * ==============================================================
 */

import { useState, useMemo } from "react";
import { Search, X, Droplet } from "lucide-react";
import { DonorCard } from "@/components/DonorCard";
import Link from "next/link";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function DonorSearch({ allBloods, previewCount }) {
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");

  const filtered = useMemo(() => {
    return allBloods.filter((donor) => {
      const donorGroup = (donor.BloodGroup || "").toString().toLowerCase();
      const donorLocation = (donor.location || "").toString().toLowerCase();

      const matchesGroup = bloodGroup
        ? donorGroup === bloodGroup.toLowerCase()
        : true;
      const matchesLocation = location
        ? donorLocation.includes(location.toLowerCase())
        : true;

      return matchesGroup && matchesLocation;
    });
  }, [allBloods, bloodGroup, location]);

  const hasFilters = bloodGroup || location;
  const displayList = hasFilters
    ? filtered
    : previewCount
      ? allBloods.slice(0, previewCount)
      : allBloods;

  const clearFilters = () => {
    setBloodGroup("");
    setLocation("");
  };

  return (
    <div>
      {/* ---------- Search Card ---------- */}
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        {/* Blood group — pill buttons, center-aligned, মোবাইলে দরকার হলে ২ লাইনে wrap হবে */}
        <div className="mb-4">
          <p className="mb-2 text-center text-md font-semibold tracking-wide text-zinc-400">
            Select Blood Group
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {BLOOD_GROUPS.map((g) => {
              const isSelected = bloodGroup === g;
              return (
                <button
                  key={g}
                  onClick={() => setBloodGroup(isSelected ? "" : g)}
                  className={`flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : "border border-zinc-300 text-zinc-600 hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location সার্চ + Clear বাটন */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Search by district, upazila, area..."
              className="w-full rounded-full border border-zinc-300 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ---------- Result count ---------- */}
      <p className="mb-4 text-center text-sm text-zinc-500">
        {hasFilters
          ? `${displayList.length} matching donor${displayList.length === 1 ? "" : "s"} found`
          : previewCount && allBloods.length > previewCount
            ? `Showing ${displayList.length} of ${allBloods.length} donors`
            : `${allBloods.length} total donor${allBloods.length === 1 ? "" : "s"}`}
      </p>

      {/* ---------- Results ---------- */}
      {displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          {/* Home page এর hero এর মতোই Droplet আইকন ব্যবহার করে empty state এ consistency আনা হলো */}
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
            <Droplet className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {hasFilters ? "No matching donors found" : "No donors found yet"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {hasFilters
              ? "Try a different blood group or location."
              : "Be the first to register as a donor."}
          </p>
        </div>
      ) : (
        <>
          <DonorCard allBloods={displayList} />

          {!hasFilters && previewCount && allBloods.length > previewCount && (
            <div className="mt-10 flex justify-center">
              <Link
                href="/all"
                className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                See All Donors
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
