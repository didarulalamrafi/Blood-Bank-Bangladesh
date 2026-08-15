"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Send } from "lucide-react";

// ✅ NEW: ব্যাকএন্ড (server.js) এর URL।
// আপনার Express backend যদি আলাদা সার্ভারে (যেমন Render/Railway) হোস্ট করা
// থাকে, তাহলে .env.local এ এটা সেট করুন:
//   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
// সেট না করলে relative path ("/api/reviews") ব্যবহার হবে — যেটা কাজ করবে
// শুধু যদি frontend আর backend একই origin এ থাকে অথবা Next.js rewrites
// দিয়ে proxy করা থাকে।
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ReviewComponent() {
  // ✅ রিভিউ ডেটা স্টোর করার জন্য state
  const [reviews, setReviews] = useState([]);

  // ✅ ফর্মের ইনপুট ভ্যালু স্টোর করার জন্য state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    review: "",
    rating: 5,
  });

  // ✅ লোডিং এবং সাকসেস মেসেজের জন্য state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ✅ পেজ লোড হওয়ার সময় MongoDB থেকে রিভিউ লোড করুন
  useEffect(() => {
    loadReviews();
  }, []);

  // ✅ রিভিউ লোড করার ফাংশন — MongoDB থেকে, ব্যর্থ হলে localStorage fallback
  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        localStorage.setItem("bloodDonorReviews", JSON.stringify(data));
      } else {
        // ✅ API কাজ না করলে localStorage থেকে লোড করুন
        const savedReviews = localStorage.getItem("bloodDonorReviews");
        if (savedReviews) {
          setReviews(JSON.parse(savedReviews));
        }
      }
    } catch (error) {
      console.error("রিভিউ লোড করতে সমস্যা হয়েছে:", error);
      // ✅ ফলব্যাক - localStorage থেকে লোড করুন
      const savedReviews = localStorage.getItem("bloodDonorReviews");
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ইনপুট ফিল্ড পরিবর্তনের সময় state আপডেট করুন
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubmitError("");
  };

  // ✅ রেটিং পরিবর্তনের জন্য হ্যান্ডলার
  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  // ✅ ফর্ম সাবমিট করার সময় — MongoDB তে সেভ করা হবে
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ ভ্যালিডেশন চেক করুন
    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.review.trim()
    ) {
      setSubmitError("দয়া করে সব ফিল্ড পূরণ করুন");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    // ✅ নতুন রিভিউ অবজেক্ট তৈরি করুন
    const newReview = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      review: formData.review.trim(),
      rating: formData.rating,
    };

    try {
      // ✅ MongoDB এ পাঠানো হচ্ছে
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "রিভিউ সেভ করা যায়নি");
      }

      const savedReview = await res.json();

      // ✅ ফ্রন্টএন্ড স্টেটে যোগ করুন (সার্ভার থেকে ফেরত আসা _id সহ)
      const updatedReviews = [savedReview, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem("bloodDonorReviews", JSON.stringify(updatedReviews));

      // ✅ ফর্ম রিসেট করুন
      setFormData({
        name: "",
        address: "",
        review: "",
        rating: 5,
      });

      // ✅ সাকসেস মেসেজ দেখান
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("রিভিউ পাঠাতে ত্রুটি:", error);
      // ✅ MongoDB তে সেভ না হলে ব্যবহারকারীকে জানানো হচ্ছে, চুপচাপ
      // localStorage এ রেখে দেওয়া হচ্ছে না — যাতে ডেটা হারিয়ে গেছে
      // ভেবে বিভ্রান্ত না হয়
      setSubmitError(
        error.message || "রিভিউ সেভ করা যায়নি, একটু পর আবার চেষ্টা করুন",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ হরিজন্টাল স্ক্রল এর জন্য বাম বাটন
  const scrollLeft = () => {
    const container = document.getElementById("reviewsScroll");
    if (container) {
      container.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  // ✅ হরিজন্টাল স্ক্রল এর জন্য ডান বাটন
  const scrollRight = () => {
    const container = document.getElementById("reviewsScroll");
    if (container) {
      container.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // ✅ স্টার রেটিং রেন্ডার করার ফাংশন
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        {/* ✅ শিরোনাম সেকশন */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent mb-3">
            রক্ত দাতাদের মতামত
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            আমাদের রক্ত দাতাদের অভিজ্ঞতা এবং মতামত শুনুন
          </p>
        </div>

        {/* ✅ রিভিউ সেকশন - উপরে রাখা */}
        <div className="mb-12">
          {isLoading ? (
            <div className="flex items-center justify-center bg-white dark:bg-zinc-900 rounded-xl p-12 border border-red-100 dark:border-red-900/30 shadow-sm">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                রিভিউ লোড হচ্ছে...
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl p-12 border border-red-100 dark:border-red-900/30 shadow-sm">
              <div className="text-center">
                <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-2">
                  এখনো কোনো রিভিউ নেই
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  নিচের ফর্ম থেকে প্রথম রিভিউ যুক্ত করুন
                </p>
              </div>
            </div>
          ) : (
            <div className="relative group">
              {/* ✅ বাম স্ক্রল বাটন */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 hidden lg:block"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* ✅ রিভিউ স্ক্রল কন্টেইনার */}
              <div
                id="reviewsScroll"
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
                style={{ scrollBehavior: "smooth", scrollbarWidth: "thin" }}
              >
                {reviews.map((review) => (
                  <div
                    key={review._id || review.id}
                    className="flex-shrink-0 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-xl p-6 border border-red-100 dark:border-red-900/30 transition snap-center"
                  >
                    {/* ✅ রিভিউ হেডার */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base line-clamp-1">
                          {review.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                          📍{" "}
                          <span className="line-clamp-1">{review.address}</span>
                        </p>
                      </div>
                      {review.date && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-semibold whitespace-nowrap ml-2">
                          {review.date}
                        </span>
                      )}
                    </div>

                    {/* ✅ রেটিং স্টার ডিসপ্লে */}
                    <div className="mb-4">{renderStars(review.rating)}</div>

                    {/* ✅ রিভিউ টেক্সট */}
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed line-clamp-4 mb-4">
                      "{review.review}"
                    </p>

                    {/* ✅ আন্ডারলাইন ডেকোরেশন */}
                    <div className="pt-4 border-t border-red-100 dark:border-red-900/30">
                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                        ❤️ রক্ত দান করুন, জীবন বাঁচান
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ ডান স্ক্রল বাটন */}
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 hidden lg:block"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* ✅ রিভিউ কাউন্ট ইনফরমেশন */}
          {reviews.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                মোট{" "}
                <span className="font-bold text-red-600">{reviews.length}</span>{" "}
                টি রিভিউ
              </p>
            </div>
          )}
        </div>

        {/* ✅ রিভিউ ফর্ম সেকশন - নিচে রাখা */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl px-6 py-12 sm:px-8 sm:py-14">
          {/* ✅ subtle background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
              আপনার অভিজ্ঞতা শেয়ার করুন
            </h3>
            <p className="text-red-100 text-center text-sm mb-8">
              আপনার মতামত আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ এবং অন্যদের
              অনুপ্রাণিত করে
            </p>

            {/* ✅ সাকসেস মেসেজ দেখান */}
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-100/20 border border-green-300/50 text-green-100 rounded-lg text-sm font-medium animate-pulse">
                ✅ রিভিউ সফলভাবে যুক্ত হয়েছে! আপনার অবদানের জন্য ধন্যবাদ।
              </div>
            )}

            {/* ✅ এরর মেসেজ দেখান */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-100/20 border border-red-300/50 text-red-100 rounded-lg text-sm font-medium">
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* ✅ নাম ইনপুট ফিল্ড */}
                <div>
                  <label className="block text-sm font-semibold text-red-50 mb-2">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="সম্পূর্ণ নাম"
                    className="w-full px-4 py-3 border border-red-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-sm text-white placeholder-red-100/50 text-sm"
                  />
                </div>

                {/* ✅ ঠিকানা ইনপুট ফিল্ড */}
                <div>
                  <label className="block text-sm font-semibold text-red-50 mb-2">
                    ঠিকানা / এলাকা *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="আপনার এলাকা"
                    className="w-full px-4 py-3 border border-red-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-sm text-white placeholder-red-100/50 text-sm"
                  />
                </div>
              </div>

              {/* ✅ রেটিং সিলেক্টর */}
              <div>
                <label className="block text-sm font-semibold text-red-50 mb-3">
                  আমাদের সেবা মূল্যায়ন করুন
                </label>
                <div className="flex gap-2 bg-white/10 w-fit px-4 py-3 rounded-lg backdrop-blur-sm border border-red-200/30">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 cursor-pointer ${
                          star <= formData.rating
                            ? "fill-yellow-300 text-yellow-300"
                            : "text-white/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ রিভিউ টেক্সট এরিয়া */}
              <div>
                <label className="block text-sm font-semibold text-red-50 mb-2">
                  আপনার অভিজ্ঞতা বর্ণনা করুন *
                </label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  placeholder="আপনার অভিজ্ঞতা এবং পরামর্শ লিখুন..."
                  rows="5"
                  className="w-full px-4 py-3 border border-red-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-sm text-white placeholder-red-100/50 text-sm resize-none"
                />
              </div>

              {/* ✅ সাবমিট বাটন */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-red-50 disabled:bg-gray-400 text-red-600 font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "পাঠাচ্ছি..." : "আপনার রিভিউ পাঠান"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
