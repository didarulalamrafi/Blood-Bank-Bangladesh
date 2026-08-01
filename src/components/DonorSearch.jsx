"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
  // filter না থাকলে শুধু প্রথম previewCount টা donor দেখাবে,
  // filter থাকলে পুরো list-এর ভেতর থেকে matched গুলো দেখাবে
  const displayList = hasFilters
    ? filtered
    : previewCount
      ? allBloods.slice(0, previewCount)
      : allBloods;

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-40"
          >
            <option value="">All Groups</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Search by district, upazila, area..."
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setBloodGroup("");
                setLocation("");
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 text-center text-sm text-zinc-500">
        {hasFilters
          ? `${displayList.length} matching donor${displayList.length === 1 ? "" : "s"} found`
          : previewCount && allBloods.length > previewCount
            ? `Showing ${displayList.length} of ${allBloods.length} donors`
            : `${allBloods.length} total donor${allBloods.length === 1 ? "" : "s"}`}
      </p>

      {/* Results */}
      {displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
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
                className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
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
