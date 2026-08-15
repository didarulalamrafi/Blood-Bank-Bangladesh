"use client";

import { Card } from "@heroui/react";
import {
  Award,
  Check,
  Copy,
  Heart,
  MessageCircle,
  Phone,
  Share2,
  X as XIcon,
} from "lucide-react";
import {
  FaFacebookF,
  FaFacebookMessenger,
  FaWhatsapp,
  FaTelegram,
  FaLinkedinIn,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// npm install react-icons  (if not already installed)

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

// Platforms with a real web share URL open directly in a new tab.
// Platforms without an official web share intent (IMO, Instagram, TikTok)
// fall back to copying the share text so the user can paste it manually.
// Real brand icons via react-icons (react-icons/fa6). IMO has no widely
// available brand icon package, so it falls back to a generic chat icon.
const SHARE_PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    Icon: FaFacebookF,
    color: "#1877F2",
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "messenger",
    name: "Messenger",
    Icon: FaFacebookMessenger,
    color: "#0084FF",
    getUrl: (url) =>
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    Icon: FaWhatsapp,
    color: "#25D366",
    getUrl: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: "telegram",
    name: "Telegram",
    Icon: FaTelegram,
    color: "#26A5E4",
    getUrl: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "x",
    name: "X",
    Icon: FaXTwitter,
    color: "#000000",
    getUrl: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    Icon: FaLinkedinIn,
    color: "#0A66C2",
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "imo",
    name: "IMO",
    Icon: MessageCircle,
    color: "#0FB9FE",
    copyOnly: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    Icon: FaInstagram,
    color: "#E1306C",
    copyOnly: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    Icon: FaTiktok,
    color: "#000000",
    copyOnly: true,
  },
];

export function DonorCard({ allBloods }) {
  const [favorites, setFavorites] = useState([]);
  const [openShareId, setOpenShareId] = useState(null);
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const shareRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // Close the share popover when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setOpenShareId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const buildShareText = (allBlood) =>
    `${allBlood.name} — Blood Group: ${allBlood.BloodGroup}, Location: ${allBlood.location}. Contact: ${allBlood.mobile}`;

  // Uses the donor's unique MongoDB _id to build a direct, shareable link.
  // Adjust the path below ("/donor/") to match your actual route.
  const buildShareUrl = (allBlood) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/donor/${allBlood._id}`;
  };

  const buildQrCodeUrl = (data) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(data)}`;

  // Native Web Share API — best UX on mobile since it opens the device's
  // own share sheet (WhatsApp, Messenger, IMO, etc. all show up natively).
  // Falls back to the custom popover when unsupported (mostly desktop).
  const handleShareClick = async (allBlood) => {
    const shareUrl = buildShareUrl(allBlood);
    const shareText = buildShareText(allBlood);

    if (navigator.share) {
      try {
        await navigator.share({
          title: allBlood.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled the native share sheet — do nothing
        if (err?.name !== "AbortError") {
          console.error("Native share failed:", err);
        }
      }
      return;
    }

    setOpenShareId(openShareId === allBlood._id ? null : allBlood._id);
  };

  const handlePlatformClick = async (platform, allBlood) => {
    const shareUrl = buildShareUrl(allBlood);
    const shareText = buildShareText(allBlood);

    if (platform.copyOnly) {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopiedPlatform(platform.id);
        setTimeout(() => setCopiedPlatform(null), 2000);
      } catch (err) {
        console.error("Failed to copy share text:", err);
      }
      return;
    }

    window.open(
      platform.getUrl(shareUrl, shareText),
      "_blank",
      "noopener,noreferrer",
    );
    setOpenShareId(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allBloods.map((allBlood) => {
        const favorited = favorites.includes(allBlood._id);
        const donorImage = allBlood.image || FALLBACK_IMAGE;
        const daysSinceDonation = calculateDaysSinceDonation(allBlood.date);
        const totalDonations = allBlood.totalDonations ?? 0;
        const tier = getDonationTier(totalDonations);
        const isShareOpen = openShareId === allBlood._id;
        const shareUrl = buildShareUrl(allBlood);

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

                <button
                  type="button"
                  aria-label="Share this donor"
                  onClick={() => handleShareClick(allBlood)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-zinc-600 shadow-sm transition hover:bg-gray-50 active:scale-95"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                {isShareOpen && (
                  <div
                    ref={shareRef}
                    className="absolute bottom-full right-0 z-50 mb-2 w-60 rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700">
                        Share this donor
                      </span>
                      <button
                        onClick={() => setOpenShareId(null)}
                        aria-label="Close share menu"
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {SHARE_PLATFORMS.map((platform) => {
                        const { Icon } = platform;
                        return (
                          <button
                            key={platform.id}
                            type="button"
                            title={platform.name}
                            onClick={() =>
                              handlePlatformClick(platform, allBlood)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-110 active:scale-95"
                            style={{ backgroundColor: platform.color }}
                          >
                            {copiedPlatform === platform.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {copiedPlatform && (
                      <p className="mt-2 flex items-center gap-1 text-[11px] text-green-600">
                        <Copy className="h-3 w-3" />
                        Copied — paste it in the app
                      </p>
                    )}

                    {/* QR code for scanning on another device */}
                    <div className="mt-3 flex flex-col items-center gap-1 border-t border-gray-100 pt-2.5">
                      <Image
                        src={buildQrCodeUrl(shareUrl)}
                        alt="QR code to share this donor"
                        width={110}
                        height={110}
                        unoptimized
                        className="rounded-md border border-gray-100"
                      />
                      <span className="text-[10px] text-zinc-400">
                        Scan to open donor profile
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
