import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Award, ListFilter, Phone } from "lucide-react";
import { ShareDonor } from "@/components/ShareDonor";

const FALLBACK_IMAGE =
  "https://i.ibb.co/LXR28brz/Gemini-Generated-Image-qjg53tqjg53tqjg5.png";

// Change this if your "all donors" list page lives at a different path
const ALL_DONORS_PATH = "/all";

// Set NEXT_PUBLIC_API_URL in your .env.local to your Express backend's URL
// e.g. NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getDonor(id) {
  try {
    const res = await fetch(`${API_URL}/all/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch donor:", err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const donor = await getDonor(id);
  if (!donor) return { title: "Donor Not Found" };

  return {
    title: `${donor.name} — ${donor.BloodGroup} Blood Donor`,
    description: `Contact ${donor.name} in ${donor.location} for ${donor.BloodGroup} blood donation.`,
  };
}

export default async function DonorDetailsPage({ params }) {
  const { id } = await params;
  const donor = await getDonor(id);

  if (!donor) notFound();

  const hasRealImage = Boolean(donor.image);
  const donorImage = donor.image || FALLBACK_IMAGE;

  const daysSinceDonation = donor.date
    ? Math.ceil(
        Math.abs(new Date() - new Date(donor.date)) / (1000 * 60 * 60 * 24),
      )
    : null;

  const dayColor =
    daysSinceDonation === null
      ? "text-zinc-500"
      : daysSinceDonation >= 90
        ? "text-green-600"
        : "text-red-600";

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-xl">
        {/* Back link */}
        <Link
          href={ALL_DONORS_PATH}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all donors
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
          {/* Image */}
          <div
            className={`relative h-[260px] w-full sm:h-[340px] ${
              hasRealImage ? "bg-zinc-100" : "bg-red-50"
            }`}
          >
            <Image
              src={donorImage}
              alt={donor.name || "Donor"}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 576px"
              className={
                hasRealImage ? "object-cover object-top" : "object-contain p-8"
              }
              unoptimized={donorImage.startsWith("data:")}
            />

            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent sm:hidden" />

            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-lg ring-4 ring-white/80 sm:h-14 sm:w-14">
              {donor.BloodGroup}
            </div>
          </div>

          {/* Details */}
          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">
              {donor.name}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 sm:text-base">
              {donor.location}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-zinc-200 sm:text-sm ${dayColor}`}
              >
                {daysSinceDonation !== null
                  ? `Last donated ${daysSinceDonation} days ago`
                  : "Not yet donated"}
              </span>

              <span className="flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200 sm:text-sm">
                <Award className="h-3.5 w-3.5 text-red-600" />
                {donor.totalDonations ?? 0} donations
              </span>
            </div>

            {donor.bio && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                {donor.bio}
              </p>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center gap-2">
              <a
                href={`tel:${donor.mobile}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-95 hover:bg-red-700 sm:text-base"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span className="truncate">{donor.mobile}</span>
              </a>

              <ShareDonor donor={donor} className="shrink-0" />
            </div>
          </div>
        </div>

        {/* See all donors */}
        <Link
          href={ALL_DONORS_PATH}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
        >
          <ListFilter className="h-4 w-4" />
          See All Donors
        </Link>
      </div>
    </div>
  );
}
