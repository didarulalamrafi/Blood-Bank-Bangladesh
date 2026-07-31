"use client";

import { useEffect, useState } from "react";
import { DonorCard } from "@/components/DonorCard";

export default function FavouritePage() {
  const [favoriteDonors, setFavoriteDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const storedIds = JSON.parse(
          localStorage.getItem("favoriteDonors") || "[]",
        );

        if (storedIds.length === 0) {
          setFavoriteDonors([]);
          setLoading(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/all`, { cache: "no-store" });

        if (!res.ok) throw new Error("Failed to fetch donors");

        const allBloods = await res.json();
        const filtered = allBloods.filter((donor) =>
          storedIds.includes(donor._id),
        );

        setFavoriteDonors(filtered);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">Loading your favourites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-black">
        <h2 className="text-2xl font-bold text-zinc-900">
          Failed to load favourites
        </h2>
        <p className="mt-2 text-sm text-zinc-500">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 sm:text-4xl">
            Your Favourite Donors
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Donors you&apos;ve saved for quick access.
          </p>
        </div>

        {favoriteDonors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-xl font-semibold text-zinc-900">
              No favourites yet
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Tap the heart icon on a donor card to save them here.
            </p>
          </div>
        ) : (
          <DonorCard allBloods={favoriteDonors} />
        )}
      </div>
    </div>
  );
}
