import Link from "next/link";
import { DonorCard } from "@/components/DonorCard";

export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ✅ NEW: এই পেজও prerender এর সময় build-time এ crash করতে পারে
  // যদি apiUrl না থাকে বা backend down থাকে, তাই আগের মতোই
  // guard clause + error handling যোগ করা হলো
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

  // ✅ NEW: প্রথম ১৫টা ডেটা কেটে নেওয়া হচ্ছে (home page এ পুরো
  // লিস্ট দেখানো হবে না)
  const previewBloods = allBloods.slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 sm:text-4xl">
            Blood Donors Near You
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Find a donor and help save a life.
          </p>
        </div>

        {previewBloods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-xl font-semibold text-zinc-900">
              No donors found yet
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Be the first to register as a donor.
            </p>
          </div>
        ) : (
          <>
            {/* ✅ NEW: আগের DonorCard কম্পোনেন্টই পুনরায় ব্যবহার
                করা হচ্ছে (একই responsive grid + card design) */}
            <DonorCard allBloods={previewBloods} />

            {/* ✅ NEW: "See More" বাটন — /all পেজে নিয়ে যাবে,
                শুধু তখনই দেখাবে যখন মোট ডেটা ১৫টার বেশি থাকবে */}
            {allBloods.length > 15 && (
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
    </div>
  );
}
