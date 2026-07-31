"use client";

import { Button, Card } from "@heroui/react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "favoriteDonors";

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

        return (
          <Card
            key={allBlood._id}
            className="flex h-full w-full flex-col items-stretch overflow-hidden"
          >
            <div className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-t-2xl">
              <Image
                src="https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png"
                alt={allBlood.name || "Donor"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                <Card.Title className="truncate text-lg">
                  {allBlood.name}
                </Card.Title>
                <div>
                  <p className="truncate text-sm text-default-500">
                    Location: {allBlood.location}
                  </p>
                </div>
              </Card.Header>

              <Card.Footer className="mt-4 flex w-full flex-col items-start gap-3">
                {/* ✅ FIXED: Last Donation Date আর Mobile আলাদা করে
                    দেখানো হচ্ছে, আগে দুইটা mix হয়ে গিয়েছিল */}
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

                <div className="flex w-full flex-col gap-2">
                  <Button
                    variant="danger"
                    className="h-auto w-full items-center justify-center whitespace-normal py-2 text-center font-semibold"
                  >
                    Blood Group: {allBlood.BloodGroup}
                  </Button>

                  <Button
                    onClick={() => toggleFavorite(allBlood._id)}
                    variant={favorited ? "danger" : "bordered"}
                    className="h-auto w-full items-center justify-center gap-2 py-2 font-semibold"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorited ? "fill-white text-white" : ""
                      }`}
                    />
                    {favorited ? "Added to Favourite" : "Favourite"}
                  </Button>
                </div>
              </Card.Footer>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
