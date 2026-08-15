"use client";

/**
 * ==============================================================
 * Navbar — কমপ্যাক্ট মোবাইল মেনু (About + Favourite), Donor বাইরে
 * ==============================================================
 * বদল হয়েছে (আগের ভার্সনের তুলনায়):
 * ১. ✅ NEW: "Donor" এখন মোবাইলেও Menu-এর বাইরে, সবসময় visible —
 *    আগে এটা mobile menu-এর ভেতরে ছিল, এখন বের করে আনা হলো
 * ২. ✅ NEW: Heart (Favourite) আইকন মোবাইলে এখন Menu-এর ভেতরে চলে
 *    গেছে (About এর সাথে) — ডেস্কটপে (sm+) আগের মতোই সবসময় visible
 * ৩. ✅ NEW: Mobile dropdown প্যানেল আর পুরো width জুড়ে থাকে না —
 *    এখন বাম পাশে (screen-এর left edge থেকে) একটা ছোট, প্রায়
 *    অর্ধেক-width কার্ড হিসেবে ভাসমান (floating) অবস্থায় দেখা যায়,
 *    rounded corner ও shadow সহ
 * ৪. রুট বদলালে মোবাইল মেনু নিজে থেকে বন্ধ হয়ে যায়; বাইরে ট্যাপ
 *    করলেও বন্ধ হয়ে যায় (transparent overlay দিয়ে)
 * ==============================================================
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Link, Button } from "@heroui/react";
import { Droplet, Heart, Plus, Menu, X } from "lucide-react";

// ডেস্কটপে (sm+) inline row-তে দেখানোর জন্য
const DESKTOP_NAV_LINKS = [
  { href: "/all", label: "Donor" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAllActive = pathname === "/all";
  const isAboutActive = pathname === "/about";
  const isFavouriteActive = pathname === "/favourite";

  // পেজ বদলালে মোবাইল মেনু অটো-বন্ধ হয়ে যাবে
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        {/* ---------- Logo ---------- */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-red-600">
            <Droplet className="h-4.5 w-4.5 text-white" fill="white" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-red-600">
            BBB
          </span>
        </Link>

        {/* ---------- ডেস্কটপে (sm+) Donor/About — আগের মতোই অপরিবর্তিত ---------- */}
        <ul className="hidden items-center gap-1 sm:flex sm:gap-2">
          {DESKTOP_NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-3 py-2 text-lg font-medium transition-colors ${
                    active ? "text-red-600" : "text-zinc-600 hover:text-red-600"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-red-600 transition-transform duration-200 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ---------- ডান পাশ ---------- */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* ✅ NEW: Donor — মোবাইলেও সবসময় visible, Menu এর বাইরে
              (ডেস্কটপে আগে থেকেই উপরের row-তে আছে, তাই এখানে শুধু মোবাইলে দেখাবে) */}
          <Link
            href="/all"
            className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:hidden ${
              isAllActive ? "text-red-600" : "text-zinc-600 hover:text-red-600"
            }`}
          >
            Donor
          </Link>

          {/* Favourite — ডেস্কটপে সবসময় visible, মোবাইলে এখন Menu-এর ভেতরে */}
          <Link
            href="/favourite"
            aria-label="Favourite"
            className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors sm:flex ${
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

          {/* Add Donor — সবসময় visible */}
          <Link href="/add">
            <Button className="gap-1.5 rounded-full bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 sm:px-4">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Add Donor</span>
            </Button>
          </Link>

          {/* ✅ NEW: মোবাইল-only Menu টগল — এখন শুধু About + Favourite থাকে */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors sm:hidden ${
              menuOpen
                ? "bg-red-50 text-red-600"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-red-600"
            }`}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* ---------- ✅ NEW: কমপ্যাক্ট, বাম পাশে অর্ধেক-width dropdown ---------- */}
      {menuOpen && (
        <>
          {/* মোবাইলে বাইরে ট্যাপ করলে মেনু বন্ধ হওয়ার জন্য একটা transparent overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 sm:hidden"
            aria-hidden="true"
          />
          <div className="absolute right-3 top-full z-50 w-1/2 max-w-[220px] overflow-hidden rounded-xl border border-separator bg-background shadow-lg sm:hidden">
            <ul className="flex flex-col gap-0.5 p-2">
              <li>
                <Link
                  href="/about"
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isAboutActive
                      ? "bg-red-50 text-red-600"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/favourite"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isFavouriteActive
                      ? "bg-red-50 text-red-600"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={isFavouriteActive ? "currentColor" : "none"}
                  />
                  Favourite
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </nav>
  );
}
