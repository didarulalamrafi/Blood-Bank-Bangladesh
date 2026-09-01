"use client";

/**
 * ==============================================================
 * SmartNavbar — Scroll-Hide Top Bar + Search-FAB Bottom Bar + Dark Mode
 * ==============================================================
 * এই আপডেটে যা বদলেছে:
 * ০. 🔐 ABOUT → LOGIN/DASHBOARD: "About" ট্যাবের জায়গায় এখন
 *    session-aware লিংক বসেছে — লগইন করা না থাকলে "Login"
 *    (LogIn আইকন, href="/login"), লগইন করা থাকলে "Dashboard"
 *    (LayoutDashboard আইকন, href="/dashboard")। এটা মোবাইল বটম
 *    বার, মোবাইল টপ বারের আইকন, আর ডেস্কটপ nav — তিন জায়গাতেই
 *    প্রযোজ্য। useSession() দিয়ে session state পড়া হয়েছে।
 * ১. 🧱 Z-INDEX FIX: বটম বার, ভিতরের nav, আর Search FAB — সবগুলোর
 *    z-index অনেক উঁচু (999999 / 1000000) করে দেওয়া হয়েছে, যাতে
 *    কোনো থার্ড-পার্টি চ্যাট/সাপোর্ট widget bubble এর উপরে বসে
 *    ঢেকে দিতে না পারে।
 * ২. 🎨 MODERN UI POলিশ:
 *    - বটম বারে subtle gradient + finer border + softer shadow
 *    - Active ট্যাবের নিচে ছোট্ট গ্লোয়িং indicator dot
 *    - আইকনে micro-scale/translate animation on active state
 *    - Search FAB-এ layered shadow + subtle press animation +
 *      active অবস্থায় halo ring
 *    - Dark mode টগলে smoother spring-like transition
 *    - Top bar-এর logo pulse animation আরেকটু রিফাইন করা
 * ৩. ⚙️ ফাংশনালিটি অপরিবর্তিত: scroll-hide top bar, dark mode
 *    persist, route-based active state — সব আগের মতোই কাজ করবে।
 * ==============================================================
 */

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Link, Button } from "@heroui/react";
import {
  Droplet,
  Heart,
  Plus,
  Home,
  Users,
  LogIn,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const FAB_HREF = "/add"; // ← মাঝের raised FAB এখন Add-এ পয়েন্ট করে

// বটম বার — বাম দুইটা স্থির, ডান দুইটার একটা স্থির (Favourite) আর
// একটা session-aware (Login/Dashboard) — তাই RIGHT_ITEMS আর মডিউল
// স্কোপে static থাকছে না, কম্পোনেন্টের ভেতরে বানানো হচ্ছে।
const LEFT_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/all", label: "Donor", icon: Users },
];

// ---------- Dark mode হুক: html.dark ক্লাস টগল + localStorage-এ persist ----------
function getInitialIsDark() {
  if (typeof window === "undefined") return false; // SSR guard
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return stored ? stored === "dark" : prefersDark;
}

function useDarkMode() {
  // ✅ lazy initializer — এই ফাংশনটা render-এর সময় একবারই চলে,
  // effect-এর ভেতরে setState কল করার দরকার পড়ে না
  const [isDark, setIsDark] = useState(getInitialIsDark);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // effect-এর কাজ এখন শুধু বাইরের সিস্টেম (DOM) sync করা —
    // React state আপডেট করা না
    document.documentElement.classList.toggle("dark", isDark);
    setMounted(true);
  }, [isDark]);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return { isDark, toggle, mounted };
}

export default function SmartNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // লগইন থাকলে Dashboard, না থাকলে Login — href/label/icon সব একসাথে ঠিক হচ্ছে
  const authTab = session?.user
    ? { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
    : { href: "/login", label: "Login", icon: LogIn };

  const RIGHT_ITEMS = [
    { href: "/favourite", label: "Favourite", icon: Heart },
    authTab,
  ];

  const isFavouriteActive = pathname === "/favourite";
  const isAuthTabActive = pathname === authTab.href;
  const isFabActive = pathname === FAB_HREF;
  const { isDark, toggle, mounted } = useDarkMode();

  // ---------- স্ক্রল করলে টপ বার hide/show ----------
  const [hideTopBar, setHideTopBar] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrolledDown = currentY > lastScrollY.current;
      const pastThreshold = currentY > 72;

      setHideTopBar(scrolledDown && pastThreshold);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ডেস্কটপ top row — Donors স্থির, দ্বিতীয়টা session-aware
  const desktopNavLinks = [
    { href: "/all", label: "Donors" },
    { href: authTab.href, label: authTab.label },
  ];

  const renderTabItem = ({ href, label, icon: Icon }) => {
    const active = href === "/" ? pathname === "/" : pathname === href;
    return (
      <li key={href} className="flex justify-center">
        <Link
          href={href}
          className="group relative flex flex-col items-center gap-1 py-2 text-center"
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
              active
                ? "-translate-y-0.5 bg-red-50 dark:bg-red-950/40"
                : "translate-y-0 bg-transparent"
            }`}
          >
            <Icon
              className={`h-5 w-5 transition-all duration-300 ${
                active
                  ? "scale-105 text-red-600"
                  : "scale-100 text-zinc-400 group-active:scale-90"
              }`}
              fill={active && href === "/favourite" ? "currentColor" : "none"}
            />
          </span>
          <span
            className={`text-[10.5px] leading-none transition-colors duration-300 ${
              active ? "font-semibold text-red-600" : "text-zinc-400"
            }`}
          >
            {label}
          </span>
          {/* active indicator dot */}
          <span
            className={`absolute -bottom-0.5 h-1 w-1 rounded-full bg-red-600 transition-opacity duration-300 ${
              active ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* ================= TOP BAR (স্ক্রলে hide/show) ================= */}
      <nav
        className={`sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg transition-transform duration-300 ease-in-out ${
          hideTopBar ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <header className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
          {/* ---------- Logo ---------- */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-sm shadow-red-600/30">
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

          {/* ---------- ডেস্কটপে (sm+) Donor/Login-Dashboard row ---------- */}
          <ul className="hidden items-center gap-1 sm:flex sm:gap-2">
            {desktopNavLinks.map((link) => {
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
            {/* 🔐 Login/Dashboard — শুধু মোবাইলে (bottom bar-এ জায়গা নেই বলে এখানে) */}
            <Link
              href={authTab.href}
              aria-label={authTab.label}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors sm:hidden ${
                isAuthTabActive
                  ? "text-red-600"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
              }`}
            >
              <authTab.icon className="h-5 w-5" />
            </Link>

            {/* 🌗 Dark / Light টগল — সবসময় visible (মোবাইল + ডেস্কটপ) */}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-red-600 active:scale-90 dark:hover:bg-zinc-800"
            >
              {mounted && (
                <>
                  <Sun
                    className={`absolute h-5 w-5 transition-all duration-500 ease-out ${
                      isDark
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                    }`}
                  />
                  <Moon
                    className={`absolute h-5 w-5 transition-all duration-500 ease-out ${
                      isDark
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                    }`}
                  />
                </>
              )}
            </button>

            {/* Favourite — শুধু ডেস্কটপে, মোবাইলে bottom bar-এ আছে */}
            <Link
              href="/favourite"
              aria-label="Favourite"
              className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors sm:flex ${
                isFavouriteActive
                  ? "text-red-600"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
              }`}
            >
              <Heart
                className="h-5 w-5"
                fill={isFavouriteActive ? "currentColor" : "none"}
              />
            </Link>

            {/* Add Donor — মোবাইলে bottom bar-এ চলে গেছে, এইটা শুধু ডেস্কটপে */}
            <Link href="/add" className="hidden sm:block">
              <Button className="gap-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-700 px-4 text-sm font-semibold text-white shadow-sm shadow-red-600/30 transition-transform hover:from-red-700 hover:to-red-800 active:scale-95">
                <Plus className="h-4 w-4 shrink-0" />
                <span>Add Donor</span>
              </Button>
            </Link>
          </div>
        </header>
      </nav>

      {/* ================= MOBILE FULL-WIDTH BOTTOM BAR ================= */}
      {/* z-[999999] ইচ্ছাকৃতভাবে খুব উঁচু রাখা হলো — যেকোনো থার্ড-পার্টি
          চ্যাট/সাপোর্ট widget bubble (Tawk.to, Crisp, Messenger ইত্যাদি)
          এর z-index এর চেয়েও বেশি, যাতে সেটা আমাদের bottom bar-কে
          কোনোভাবেই ঢেকে দিতে না পারে। */}
      <div
        className="fixed inset-x-0 bottom-0 z-[999999] sm:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="relative">
          {/* ৫-কলাম grid: Home | Donor | (Add FAB-এর জন্য ফাঁকা) | Favourite | Login/Dashboard
              — grid ব্যবহার করায় প্রতিটা কলামের width টেক্সটের length
              নির্বিশেষে ঠিক সমান থাকে, তাই "Home" কিনারায় চেপে যাওয়া
              বা এক পাশে বেশি গ্যাপ হওয়ার সমস্যা হয় না। */}
          <ul className="relative z-[999999] grid h-16 grid-cols-[1fr_1fr_4rem_1fr_1fr] items-center border-t border-separator bg-background/95 px-3 shadow-[0_-8px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:px-5">
            {renderTabItem(LEFT_ITEMS[0])}
            {renderTabItem(LEFT_ITEMS[1])}
            <li aria-hidden="true" />
            {renderTabItem(RIGHT_ITEMS[0])}
            {renderTabItem(RIGHT_ITEMS[1])}
          </ul>

          {/* ---------- Raised Center FAB: Add ---------- */}
          <Link
            href={FAB_HREF}
            aria-label="Add Donor"
            className={`absolute left-1/2 top-0 z-[1000000] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(220,38,38,0.45)] ring-4 ring-background transition-all duration-300 active:scale-90 ${
              isFabActive
                ? "scale-105 bg-red-700 ring-red-100 dark:ring-red-950/40"
                : "scale-100 bg-gradient-to-br from-red-500 to-red-700"
            }`}
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </>
  );
}
