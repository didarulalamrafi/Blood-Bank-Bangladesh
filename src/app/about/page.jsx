/**
 * ==============================================================
 * About Us Page — app/about/page.jsx এ বসান
 * ==============================================================
 * ডিজাইন আপনার DonorSearch/Admin পেজের সাথে মিলিয়ে করা হয়েছে:
 * rounded-2xl card, border-zinc-200, red-600 accent, Droplet আইকন।
 *
 * ⚠️ নিচের "রক্তদাতা হিসেবে নিবন্ধন করুন" বাটনের href="/#register"
 * — আপনার আসল ডোনার-রেজিস্ট্রেশন ফর্মের route/anchor অনুযায়ী এটা
 * বদলে দিন।
 * ==============================================================
 */

import Link from "next/link";
import { Droplet, HeartHandshake, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-black sm:py-16">
      <div className="mx-auto max-w-3xl">
        {/* ---------- হেডার ---------- */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
            <Droplet className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            আমাদের সম্পর্কে
          </h1>
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">
            একটা মানবিক উদ্যোগ, একটা বিশ্বাস থেকে শুরু
          </p>
        </div>

        {/* ---------- প্রতিষ্ঠাতার বার্তা ---------- */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
            প্রতিষ্ঠাতার বার্তা
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
            <p>
              আমি <strong className="text-black">দিদারুল আলম রাফি</strong>। আমি
              বিশ্বাস করি, প্রতিটি মানুষের একটা দায়িত্ব আছে — তার পরিবার, সমাজ,
              দেশ এবং জাতির জন্য ভালো কিছু করার। সেই দায়িত্ববোধ থেকেই এই
              ওয়েবসাইটটা তৈরি করা।
            </p>
            <p>
              আমাদের চারপাশে প্রতিদিন অসংখ্য মানুষ রক্তের অভাবে কষ্ট পান —
              দুর্ঘটনায়, অস্ত্রোপচারে, থ্যালাসেমিয়া বা প্রসবকালীন জটিলতায়।
              সঠিক সময়ে সঠিক রক্তদাতা খুঁজে পাওয়াটাই অনেক সময় জীবন-মৃত্যুর
              পার্থক্য গড়ে দেয়। এই Platform-টা তৈরি করা হয়েছে ঠিক সেই
              দূরত্বটা কমিয়ে আনার জন্য — যাতে একজন রক্তদাতা আর একজন
              প্রয়োজনগ্রস্ত মানুষ সহজে, দ্রুত একে অপরকে খুঁজে পেতে পারেন।
            </p>
            <p>
              এটা কোনো ব্যবসায়িক উদ্যোগ নয় — এটা একটা বিশ্বাসের জায়গা থেকে
              করা কাজ। যতদিন এই ওয়েবসাইট চালু থাকবে, লক্ষ্য থাকবে — একজন মানুষও
              যেন রক্ত না পাওয়ার কারণে তার জীবন না হারান।
            </p>
          </div>
        </div>

        {/* ---------- কেন রক্ত দিবেন — মূল বার্তা, highlighted ---------- */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 text-center shadow-sm sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative space-y-3">
            <p className="text-lg font-semibold leading-relaxed text-white sm:text-xl">
              আপনার এক ব্যাগ রক্তদানে যদি কারো জীবন বেঁচে যায়, কেন আপনি রক্ত
              দিবেন না?
            </p>
            <p className="text-lg font-semibold leading-relaxed text-white sm:text-xl">
              আপনার একজন রক্তদাতা ব্যবস্থা করে দেওয়ার ফলে যদি কারো জীবন বেঁচে
              যায়, কেন আপনি রক্তদাতার দিবেন না?
            </p>
            <p className="pt-2 text-sm text-red-100">
              রক্তদান কোনো বড় ত্যাগ নয় — কিন্তু যার জীবন বাঁচে, তার কাছে এটাই
              সবচেয়ে বড় উপহার।
            </p>
          </div>
        </div>

        {/* ---------- আমাদের লক্ষ্য — ৩টা কার্ড ---------- */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ValueCard
            icon={<HeartHandshake className="h-5 w-5 text-red-600" />}
            title="দ্রুত সংযোগ"
            description="প্রয়োজনের মুহূর্তে রক্তদাতা ও রোগীর মধ্যে সবচেয়ে দ্রুত সেতুবন্ধন তৈরি করা।"
          />
          <ValueCard
            icon={<Users className="h-5 w-5 text-red-600" />}
            title="একটা কমিউনিটি"
            description="যারা বিনিময়ে কিছু না চেয়ে অন্যের জীবন বাঁচাতে এগিয়ে আসেন, তাদের এক জায়গায় আনা।"
          />
          <ValueCard
            icon={<ShieldCheck className="h-5 w-5 text-red-600" />}
            title="বিশ্বস্ততা"
            description="প্রতিটা তথ্য যাচাই করে রাখার চেষ্টা, যাতে মানুষ নির্ভয়ে এই প্ল্যাটফর্মে আস্থা রাখতে পারেন।"
          />
        </div>

        {/* ---------- CTA ---------- */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/add"
            className="w-full rounded-full bg-red-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-red-700 sm:w-auto"
          >
            রক্তদাতা হিসেবে নিবন্ধন করুন
          </Link>
          <Link
            href="/all"
            className="w-full rounded-full border border-zinc-300 px-6 py-3 text-center font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 sm:w-auto"
          >
            সব ডোনার দেখুন
          </Link>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, description }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
