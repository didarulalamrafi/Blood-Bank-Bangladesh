"use client";

import { Check, Copy, MessageCircle, Share2, X as XIcon } from "lucide-react";
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

// Platforms with a real web share URL open directly in a new tab.
// Platforms without an official web share intent (IMO, Instagram, TikTok)
// fall back to copying the share text so the user can paste it manually.
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

/**
 * Reusable share button + popover (native share / platform icons / QR code).
 * Pass the donor object (must include _id, name, BloodGroup, location, mobile).
 * Used by both DonorCard (list/grid) and the donor details page.
 */
export function ShareDonor({ donor, className = "" }) {
  const [open, setOpen] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildShareText = () =>
    `${donor.name} — Blood Group: ${donor.BloodGroup}, Location: ${donor.location}. Contact: ${donor.mobile}`;

  // Unique link per donor using their MongoDB _id.
  // Adjust the path below if your details route lives somewhere else.
  const buildShareUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/donor/${donor._id}`
      : "";

  const buildQrCodeUrl = (data) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(data)}`;

  // Native Web Share API — best UX on mobile (opens the device's own share
  // sheet). Tries to attach the donor's actual image as a file (Web Share
  // API Level 2) so the receiving app shows both the photo AND the link,
  // not just text. Falls back step by step if anything isn't supported:
  // file-share unsupported → CORS/fetch fails → share() unsupported at all.
  const handleShareClick = async () => {
    const shareUrl = buildShareUrl();
    const shareText = buildShareText();
    const imageUrl = donor.image;

    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    // ধাপ ১: ছবি ফাইল হিসেবে attach করে + লিংক text-এ জুড়ে শেয়ার করার চেষ্টা।
    // (url আর files একসাথে অনেক ব্রাউজারেই ঠিকমতো কাজ করে না, তাই লিংকটা
    // text-এর ভেতরেই বসানো হচ্ছে — এতে receiving app-এ ছবি + লিংক দুটোই যায়)
    if (canNativeShare && imageUrl && !imageUrl.startsWith("data:")) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const fileName = `${(donor.name || "donor").replace(/\s+/g, "_")}.jpg`;
        const file = new File([blob], fileName, {
          type: blob.type || "image/jpeg",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: donor.name,
            text: `${shareText}\n${shareUrl}`,
            files: [file],
          });
          return;
        }
      } catch (err) {
        // CORS ব্যর্থ হওয়া বা ফাইল বানাতে সমস্যা হলে নিচের সাধারণ শেয়ারে চলে যাবে
        console.warn(
          "Image file share failed, falling back to link-only:",
          err,
        );
      }
    }

    // ধাপ ২: শুধু title/text/url দিয়ে সাধারণ native share (আগের মতোই)
    if (canNativeShare) {
      try {
        await navigator.share({
          title: donor.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Native share failed:", err);
        }
      }
      return;
    }

    // ধাপ ৩: native share একদমই সাপোর্ট না করলে popover মেনু খোলা (ডেস্কটপে)
    setOpen((prev) => !prev);
  };

  const handlePlatformClick = async (platform) => {
    const shareUrl = buildShareUrl();
    const shareText = buildShareText();

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
    setOpen(false);
  };

  const shareUrl = buildShareUrl();

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Share this donor"
        onClick={handleShareClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-zinc-600 shadow-sm transition hover:bg-gray-50 active:scale-95"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={ref}
          className="absolute bottom-full right-0 z-50 mb-2 w-60 rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">
              Share this donor
            </span>
            <button
              onClick={() => setOpen(false)}
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
                  onClick={() => handlePlatformClick(platform)}
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
  );
}
