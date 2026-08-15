/**
 * ==============================================================
 * AboutTeaser — Home page-এ ফুটারের ঠিক আগে বসানোর জন্য (optional)
 * ==============================================================
 * পুরো About লেখা এখানে না দিয়ে ছোট একটা টিজার কার্ড — মানুষ
 * আগ্রহী হলে "/about" এ গিয়ে পুরোটা পড়বে। হোম পেজ হালকা রাখার
 * জন্য এই approach টা রাখা হলো।
 * ==============================================================
 */

import Link from "next/link";
import { Droplet, ArrowRight } from "lucide-react";

export function AboutTeaser() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <Droplet className="h-6 w-6 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            আপনার এক ব্যাগ রক্তদানে যদি কারো জীবন বেঁচে যায়...
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            কেন এই ওয়েবসাইটটা তৈরি করা হলো, আমাদের গল্প জানুন।
          </p>
        </div>
        <Link
          href="/about"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          আরও জানুন
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
