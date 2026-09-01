import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  ListFilter,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
} from "lucide-react";
import { ShareDonor } from "@/components/ShareDonor";
import { getDonationTier } from "@/lib/donationTiers";

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

// Small helper row for the info list — skips rendering if the value is empty
function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null;

  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-zinc-400">{label}</span>
        <span className="block truncate text-sm font-semibold text-zinc-800">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-zinc-50"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3 px-2 py-2">{content}</div>;
}

export default async function DonorDetailsPage({ params }) {
  const { id } = await params;
  const donor = await getDonor(id);

  if (!donor) notFound();

  const donorImage = donor.image || FALLBACK_IMAGE;
  const totalDonations = donor.totalDonations ?? 0;
  const tier = getDonationTier(totalDonations);

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

  const lastDonationLabel = donor.date
    ? new Date(donor.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

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
          {/* Image — always shown full/uncropped */}
          <div className="relative w-full bg-red-50">
            <Image
              src={donorImage}
              alt={donor.name || "Donor"}
              width={800}
              height={800}
              priority
              sizes="(max-width: 640px) 100vw, 576px"
              className="h-auto max-h-[70vh] w-full object-contain"
              unoptimized={donorImage.startsWith("data:")}
            />

            {/* Donation tier badge - top left, same as DonorCard */}
            {tier && (
              <div
                className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md ${tier.className}`}
              >
                <Award className="h-3.5 w-3.5" />
                {tier.label}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                  {donor.name}
                </h1>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-500 sm:text-base">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{donor.location}</span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-lg ring-4 ring-white/80 sm:h-14 sm:w-14">
                {donor.BloodGroup}
              </div>
            </div>

            {/* Stats badges */}
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
                {totalDonations} donations
              </span>
            </div>

            {donor.bio && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                {donor.bio}
              </p>
            )}

            {/* All collected info */}
            <div className="mt-5 divide-y divide-zinc-100 border-t border-zinc-100">
              <InfoRow
                icon={Phone}
                label="Mobile Number"
                value={donor.mobile}
                href={donor.mobile ? `tel:${donor.mobile}` : undefined}
              />
              <InfoRow
                icon={PhoneCall}
                label="Alternative Number"
                value={donor.mobile2}
                href={donor.mobile2 ? `tel:${donor.mobile2}` : undefined}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={donor.email}
                href={donor.email ? `mailto:${donor.email}` : undefined}
              />
              <InfoRow
                icon={Building2}
                label="Blood Bank / Group"
                value={donor.BloodBankName}
              />
              <InfoRow icon={MapPin} label="District" value={donor.district} />
              <InfoRow icon={MapPin} label="Upazila" value={donor.upazila} />
              <InfoRow icon={MapPin} label="Union / Area" value={donor.union} />
              <InfoRow
                icon={Calendar}
                label="Last Donation Date"
                value={lastDonationLabel}
              />
            </div>

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
