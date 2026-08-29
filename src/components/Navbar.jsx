"use client";

/**
 * ==============================================================
 * Navbar — Mobile-First Smart Navigation
 * ==============================================================
 * নতুন ডিজাইনের চিন্তা:
 * বেশিরভাগ ইউজার মোবাইলে ব্যবহার করে, তাই hamburger + dropdown
 * (এক্সট্রা ট্যাপ) বাদ দিয়ে দেওয়া হলো। এর বদলে:
 *
 * ১. 📱 MOBILE (< sm): নিচে একটা floating "bottom tab bar" —
 *    Home, Donors, Favourite, About — সবগুলো সবসময় এক ট্যাপ
 *    দূরত্বে, ঠিক Instagram/WhatsApp এর মতো। Add Donor বাটন
 *    top bar-এ ছোট circle icon হিসেবে থাকে (primary action
 *    সবসময় থাম্বের কাছে)।
 * ২. 🖥️ DESKTOP (sm+): আগের মতোই clean top row — Donors/About
 *    inline links + Favourite icon + full "Add Donor" বাটন।
 *    Bottom bar desktop এ hidden থাকে।
 * ৩. ✨ Active route হলে icon fill + label bold + রঙ red-600,
 *    সাথে ছোট animated indicator — কোনো hamburger/menu state
 *    ম্যানেজ করার দরকার নেই, তাই কোড অনেক সহজ ও bug-free।
 * ৪. Safe-area padding (env(safe-area-inset-bottom)) দেওয়া আছে
 *    যাতে iPhone-এর হোম ইন্ডিকেটরের সাথে বাটন না ঢাকা পড়ে।
 *
 * ⚠️ ব্যবহারের নোট: বটম বার fixed, তাই page-এর মূল কন্টেইনারে
 * নিচে extra padding দিতে হবে মোবাইলে যাতে কন্টেন্ট বার-এর
 * নিচে চাপা না পড়ে, যেমন: <main className="pb-20 sm:pb-0">
 * ==============================================================
 */

import { usePathname } from "next/navigation";
import { Link, Button } from "@heroui/react";
import { Droplet, Heart, Plus, Home, Users, Info } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/all", label: "Donors", icon: Users },
  { href: "/favourite", label: "Favourite", icon: Heart },
  { href: "/about", label: "About", icon: Info },
];

// ডেস্কটপে top row-তে দেখানোর জন্য (Home/Favourite আলাদাভাবে হ্যান্ডেল হয়)
const DESKTOP_NAV_LINKS = [
  { href: "/all", label: "Donors" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isFavouriteActive = pathname === "/favourite";

  return (
    <>
      {/* ================= TOP BAR ================= */}
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

          {/* ---------- ডেস্কটপে (sm+) Donor/About row ---------- */}
          <ul className="hidden items-center gap-1 sm:flex sm:gap-2">
            {DESKTOP_NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-3 py-2 text-lg font-medium transition-colors ${
                      active
                        ? "text-red-600"
                        : "text-zinc-600 hover:text-red-600"
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
            {/* Favourite — শুধু ডেস্কটপে, মোবাইলে এটা bottom bar-এ আছে */}
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

            {/* Add Donor — মোবাইলে compact circle icon, ডেস্কটপে full label বাটন */}
            <Link href="/add" aria-label="Add Donor">
              <Button
                isIconOnly
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 sm:hidden"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button className="hidden gap-1.5 rounded-full bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 sm:flex">
                <Plus className="h-4 w-4 shrink-0" />
                <span>Add Donor</span>
              </Button>
            </Link>
          </div>
        </header>
      </nav>

      {/* ================= MOBILE BOTTOM TAB BAR ================= */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-background/85 backdrop-blur-lg sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-6xl items-stretch justify-around">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="flex flex-col items-center gap-0.5 py-2.5 text-center"
                >
                  <span
                    className={`flex h-8 w-10 items-center justify-center rounded-full transition-colors ${
                      active ? "bg-red-50 text-red-600" : "text-zinc-500"
                    }`}
                  >
                    <Icon
                      className="h-5 w-5"
                      fill={
                        active && href === "/favourite"
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </span>
                  <span
                    className={`text-[11px] leading-none ${
                      active ? "font-semibold text-red-600" : "text-zinc-500"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
