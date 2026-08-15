"use client";

import { Card } from "@heroui/react";
import { Award, Heart, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShareDonor } from "./ShareDonor";

const STORAGE_KEY = "favoriteDonors";
const FALLBACK_IMAGE =
  "https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png";

// Donation-count based badge tiers. Adjust thresholds/labels here if needed.
const DONATION_TIERS = [
  {
    min: 20,
    label: "Diamond",
    className: "bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600",
  },
  {
    min: 15,
    label: "Platinum",
    className: "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500",
  },
  {
    min: 10,
    label: "Gold",
    className: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600",
  },
  {
    min: 5,
    label: "Silver",
    className: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
  },
];

function getDonationTier(count) {
  return DONATION_TIERS.find((tier) => count >= tier.min) || null;
}

export function DonorCard({ allBloods }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const calculateDaysSinceDonation = (donationDate) => {
    if (!donationDate) return null;
    const lastDate = new Date(donationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDayColor = (days) => {
    if (days === null) return "text-zinc-500";
    return days >= 90
      ? "text-green-600 font-semibold"
      : "text-red-600 font-semibold";
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allBloods.map((allBlood) => {
        const favorited = favorites.includes(allBlood._id);
        const donorImage = allBlood.image || FALLBACK_IMAGE;
        const daysSinceDonation = calculateDaysSinceDonation(allBlood.date);
        const totalDonations = allBlood.totalDonations ?? 0;
        const tier = getDonationTier(totalDonations);

        return (
          <Card
            key={allBlood._id}
            className="flex h-full w-full flex-col items-stretch overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer"
          >
            {/* Clicking the image opens the donor's details page */}
            <a
              href={`/donor/${allBlood._id}`}
              className="relative h-[250px] sm:h-[220px] md:h-[200px] w-full shrink-0 bg-zinc-50 overflow-hidden block"
            >
              <Image
                src={donorImage}
                alt={allBlood.name || "Donor"}
                fill
                priority={false}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-top"
                style={{ width: "100%", height: "100%" }}
                unoptimized={donorImage.startsWith("data:")}
              />

              {/* Donation tier badge - top left */}
              {tier && (
                <div
                  className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md ${tier.className}`}
                >
                  <Award className="h-3.5 w-3.5" />
                  {tier.label}
                </div>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(allBlood._id);
                }}
                aria-label="Toggle favourite"
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:bg-white hover:scale-110"
              >
                <Heart
                  className={`h-5 w-5 transition-transform ${
                    favorited
                      ? "fill-red-600 text-red-600 scale-110"
                      : "text-zinc-400"
                  }`}
                />
              </button>
            </a>

            <div className="flex flex-1 flex-col px-3.5 py-2">
              <div className="flex items-start justify-between gap-1 mb-0.5">
                <div>
                  <a href={`/donor/${allBlood._id}`}>
                    <h3 className="flex-1 font-bold text-base leading-tight hover:underline">
                      {allBlood.name}
                    </h3>
                  </a>
                  <p className="text-[14px] font-medium text-gray-600 mb-1.5">
                    {allBlood.location}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md">
                  {allBlood.BloodGroup}
                </div>
              </div>

              <div className="mb-2.5 flex-1 space-y-1">
                <p
                  className={`text-sm font-semibold ${getDayColor(daysSinceDonation)}`}
                >
                  Last Donated:{" "}
                  {daysSinceDonation !== null
                    ? `${daysSinceDonation} days ago`
                    : "Not yet donated"}
                </p>

                <p className="flex items-center gap-1 text-sm font-semibold text-zinc-700">
                  <Award className="h-3.5 w-3.5 text-red-600" />
                  Total Donations: {totalDonations}
                </p>
              </div>

              <div className="relative flex w-full items-center gap-2">
                <a
                  href={`tel:${allBlood.mobile}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg shadow-md active:scale-95"
                >
                  <Phone className="h-4 w-4" />
                  {allBlood.mobile}
                </a>

                <ShareDonor donor={allBlood} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
