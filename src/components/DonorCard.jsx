"use client";

import { Card } from "@heroui/react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "favoriteDonors";
const FALLBACK_IMAGE =
  "https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png";

export function DonorCard({ allBloods }) {
  const [favorites, setFavorites] = useState([]);

  // ✅ প্রথমবার mount হওয়ার সময় localStorage থেকে
  // আগের favourite id গুলো load করা হচ্ছে
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // ✅ favourite toggle করলে state আর localStorage
  // দুইটাই একসাথে update হচ্ছে
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allBloods.map((allBlood) => {
        const favorited = favorites.includes(allBlood._id);

        // ✅ FIXED: আগে সব card এ একই hardcoded ছবি দেখাচ্ছিল।
        // এখন donor এর নিজের uploaded image (base64 বা url) থাকলে
        // সেটা দেখাবে, না থাকলে fallback placeholder দেখাবে।
        const donorImage = allBlood.image || FALLBACK_IMAGE;

        return (
          <Card
            key={allBlood._id}
            className="flex h-full w-full flex-col items-stretch overflow-hidden"
          >
            <div className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-t-2xl bg-zinc-100">
              <Image
                src={donorImage}
                alt={allBlood.name || "Donor"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain"
                // ✅ FIXED: object-cover ব্যবহার করলে ছবির কিছু অংশ crop
                // হয়ে যাচ্ছিল (মাথার উপরের অংশ বাদ পড়ছিল)। এখন
                // object-contain দেওয়া হলো, তাতে পুরো ছবিটাই frame এর
                // ভেতরে দেখা যাবে, কোনো অংশ কাটা যাবে না — ছবি যদি
                // container এর অনুপাতের সাথে না মেলে তাহলে দুই পাশে
                // হালকা ফাঁকা জায়গা (letterbox) দেখাবে
                // base64 data URL হলে Next.js optimizer এটা handle
                // করতে পারে না, তাই unoptimized রাখা হলো
                unoptimized={donorImage.startsWith("data:")}
              />

              {/* ছবির উপরে floating favourite icon */}
              <button
                onClick={() => toggleFavorite(allBlood._id)}
                aria-label="Toggle favourite"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white"
              >
                <Heart
                  className={`h-4.5 w-4.5 ${
                    favorited ? "fill-red-600 text-red-600" : "text-zinc-500"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-1 flex-col px-4 pb-4">
              <Card.Header className="gap-1.5 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <Card.Title className="truncate text-lg">
                    {allBlood.name}
                  </Card.Title>

                  {/* ✅ NEW: Blood Group এখন নামের right side এ
                      একটা circle badge আকারে দেখানো হচ্ছে */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {allBlood.BloodGroup}
                  </div>
                </div>
                <div>
                  <p className="truncate text-sm text-default-500">
                    Location: {allBlood.location}
                  </p>
                </div>
              </Card.Header>

              <Card.Footer className="mt-4 flex w-full flex-col items-start gap-3">
                {/* Last Donation Date আর Mobile আলাদা করে দেখানো হচ্ছে */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    Last Donation Date:{" "}
                    <span className="font-normal text-default-600">
                      {allBlood.date || "Not donated yet"}
                    </span>
                  </span>
                  <span className="text-sm text-default-600">
                    Mobile: {allBlood.mobile}
                  </span>
                </div>

                {/* ✅ FIXED: Blood Group button বাদ দেওয়া হলো, badge
                    আকারে উপরেই দেখানো হচ্ছে। নিচে শুধু Favourite button */}
                <div className="flex w-full flex-col gap-2">
                  <button
                    onClick={() => toggleFavorite(allBlood._id)}
                    className={`flex h-auto w-full items-center justify-center gap-2 rounded-lg border-2 py-2 font-semibold transition-all duration-200 ${
                      favorited
                        ? "border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700"
                        : "border-zinc-300 bg-transparent text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 transition-transform duration-200 ${
                        favorited ? "scale-110 fill-white text-white" : ""
                      }`}
                    />
                    {favorited ? "Added to Favourite" : "Add to Favourite"}
                  </button>
                </div>
              </Card.Footer>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
