import Link from "next/link";
import { Droplet, Heart, Users } from "lucide-react";
import { DonorSearch } from "@/components/DonorSearch";

export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ✅ prerender এর সময় build-time এ crash এড়াতে guard clause
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${apiUrl}/all`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-black">
        <h2 className="text-2xl font-bold text-zinc-900">
          Failed to load donors
        </h2>
        <p className="mt-2 text-sm text-zinc-500">Please try again later.</p>
      </div>
    );
  }

  const allBloods = await res.json();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Hero Banner — blood donation সম্পর্কে motivational message */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 px-4 py-14 sm:py-20">
        {/* subtle background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/10 p-3 backdrop-blur-sm">
            <Droplet className="h-8 w-8 text-white" fill="white" />
          </div>

          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            Donate Blood, Save Lives
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-red-50 sm:text-base">
            একটি রক্তদান বাঁচাতে পারে তিনটি পর্যন্ত জীবন। আপনার এক ফোঁটা রক্ত
            হতে পারে কারো বেঁচে থাকার শেষ ভরসা। আজই একজন ডোনার হন অথবা প্রয়োজনে
            একজন ডোনার খুঁজে নিন।
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/add"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Become a Donor
            </Link>
            <Link
              href="/all"
              className="rounded-lg border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Find a Donor
            </Link>
          </div>

          {/* quick stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
            <div className="flex flex-col items-center">
              <Heart className="mb-1 h-5 w-5 text-red-100" />
              <span className="text-xl font-bold text-white">
                {allBloods.length}+
              </span>
              <span className="text-xs text-red-100">Registered Donors</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="mb-1 h-5 w-5 text-red-100" />
              <span className="text-xl font-bold text-white">24/7</span>
              <span className="text-xs text-red-100">Support Available</span>
            </div>
            <div className="flex flex-col items-center">
              <Droplet className="mb-1 h-5 w-5 text-red-100" />
              <span className="text-xl font-bold text-white">3 Lives</span>
              <span className="text-xs text-red-100">Per Donation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Donor list section */}
      <div className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Blood Donors Near You
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Find a donor and help save a life.
            </p>
          </div>

          <DonorSearch allBloods={allBloods} />
        </div>
      </div>
    </div>
  );
}
