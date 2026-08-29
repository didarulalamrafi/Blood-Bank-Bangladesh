import { DonorSearch } from "@/components/DonorSearch";

export default async function AllDonorsPage() {
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
      {/* Hero banner ইচ্ছাকৃতভাবে বাদ — এটা শুধু Home page-এ থাকবে।
          Donor page-এ সরাসরি heading + search + list দেখানো হচ্ছে। */}
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
