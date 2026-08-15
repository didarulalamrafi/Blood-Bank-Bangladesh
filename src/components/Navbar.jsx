"use client";

/**
 * ==============================================================
 * Navbar — সব স্ক্রিনে একসাথে সব আইটেম দেখানো (No Mobile Menu)
 * ==============================================================
 * বদল হয়েছে (আগের ভার্সনের তুলনায়):
 * ১. Mobile hamburger menu সম্পূর্ণ বাদ দেওয়া হয়েছে — এখন ছোট
 *    স্ক্রিনেও সব link একসাথে, একই row-তে দেখা যাবে
 * ২. "Favourite" এর টেক্সটের বদলে Heart আইকন বসানো হয়েছে
 *    (মোবাইলে জায়গা বাঁচানোর জন্য এবং visually cleaner লাগার জন্য)
 * ৩. মোবাইলে জায়গা বাঁচাতে "Add Donor" বাটনের টেক্সট ছোট স্ক্রিনে
 *    hide করে শুধু "+" আইকন দেখানো হচ্ছে (sm breakpoint থেকে টেক্সট আসবে)
 * ৪. Active page বোঝাতে "All Blood" এর নিচে ছোট red bar,
 *    Favourite active হলে heart ভরাট (filled) হয়ে যাবে
 * ==============================================================
 */

import { usePathname } from "next/navigation";
import { Link, Button } from "@heroui/react";
import { Droplet, Heart, Plus } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isAllBloodActive = pathname === "/all";
  const isFavouriteActive = pathname === "/favourite";

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        {/* ---------- Logo ---------- */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-red-600">
            <Droplet className="h-4.5 w-4.5 text-white" fill="white" />
            {/* ছোট pulse ডট — "network live আছে" ইঙ্গিত দেয় */}
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-red-600">
            BBB
          </span>
        </Link>

        {/* ---------- Nav items: ডেস্কটপ ও মোবাইল সবখানে একসাথে ---------- */}
        <ul className="flex items-center gap-1 sm:gap-2">
          <li>
            <Link
              href="/all"
              className={`relative px-2.5 py-2 text-lg font-medium transition-colors sm:px-3 ${
                isAllBloodActive
                  ? "text-red-600"
                  : "text-zinc-600 hover:text-red-600"
              }`}
            >
              Donor
              <span
                className={`absolute inset-x-2.5 -bottom-[1px] h-0.5 rounded-full bg-red-600 transition-transform duration-200 sm:inset-x-3 ${
                  isAllBloodActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={`relative px-2.5 py-2 text-lg font-medium transition-colors sm:px-3 ${
                isAllBloodActive
                  ? "text-red-600"
                  : "text-zinc-600 hover:text-red-600"
              }`}
            >
              About
              <span
                className={`absolute inset-x-2.5 -bottom-[1px] h-0.5 rounded-full bg-red-600 transition-transform duration-200 sm:inset-x-3 ${
                  isAllBloodActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          </li>

          <li>
            {/* ✅ NEW: টেক্সটের বদলে শুধু Heart আইকন — active হলে ভরাট লাল */}
            <Link
              href="/favourite"
              aria-label="Favourite"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                isFavouriteActive
                  ? "text-red-600"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-red-600"
              }`}
            >
              <Heart
                className="h-5 w-5"
                fill={isFavouriteActive ? "currentColor" : "none"}
              />
            </Link>
          </li>

          <li>
            <Link href="/add">
              <Button className="gap-1.5 rounded-full bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 sm:px-4">
                <Plus className="h-4 w-4 shrink-0" />
                {/* ✅ NEW: মোবাইলেও এখন টেক্সট দেখাবে, hidden আর নেই */}
                <span>Add Donor</span>
              </Button>
            </Link>
          </li>
        </ul>
      </header>
    </nav>
  );
}
