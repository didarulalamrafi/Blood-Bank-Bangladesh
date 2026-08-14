"use client";

import { Card } from "@heroui/react";
import { Heart, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "favoriteDonors";
const FALLBACK_IMAGE =
  "https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png";

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

        return (
          <Card
            key={allBlood._id}
            className="flex h-full w-full flex-col items-stretch overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer"
          >
            <div className="relative h-[250px] sm:h-[220px] md:h-[200px] w-full shrink-0 bg-zinc-50 overflow-hidden">
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

              <button
                onClick={() => toggleFavorite(allBlood._id)}
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
            </div>

            <div className="flex flex-1 flex-col px-3.5 py-2">
              <div className="flex items-start justify-between gap-1 mb-0.5">
                <div>
                  <h3 className="flex-1 font-bold text-base leading-tight">
                    {allBlood.name}
                  </h3>
                  <p className="text-[14px] font-medium text-gray-600 mb-1.5">
                    {allBlood.location}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md">
                  {allBlood.BloodGroup}
                </div>
              </div>

              <div className="mb-2.5 flex-1">
                <p
                  className={`text-sm font-semibold ${getDayColor(daysSinceDonation)}`}
                >
                  Last Donated:{" "}
                  {daysSinceDonation !== null
                    ? `${daysSinceDonation} days ago`
                    : "Not yet donated"}
                </p>
              </div>

              <a
                href={`tel:${allBlood.mobile}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg shadow-md active:scale-95"
              >
                <Phone className="h-4 w-4" />
                {allBlood.mobile}
              </a>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
