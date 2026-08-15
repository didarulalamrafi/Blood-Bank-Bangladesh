"use client";

/**
 * ==============================================================
 * Admin Dashboard Page — Donors + Reviews (আপডেটেড ভার্সন)
 * ==============================================================
 * এই আপডেটে যা নতুন যোগ হয়েছে:
 *
 * ১. ✅ NEW: Reviews ম্যানেজমেন্ট ট্যাব — admin এখন রিভিউ Edit ও Delete
 *    করতে পারবে (Donors ট্যাবের পাশে আলাদা ট্যাব হিসেবে)
 * ২. ✅ NEW: Donor দেখানো হচ্ছে Upazila/Thana অনুযায়ী গ্রুপ করে (accordion
 *    সেকশন) — আপনার নতুন location system এ location স্ট্রিং
 *    "Upazila, District" ফরম্যাটে সেভ হয়, তাই প্রথম অংশ (কমার আগে)
 *    কে Upazila/Thana হিসেবে ধরে গ্রুপ করা হয়েছে
 * ৩. ✅ NEW: টেবিলের বদলে card-grid layout — মোবাইলে horizontal scroll
 *    করতে হবে না, ছোট স্ক্রিনে ১ কলাম, ট্যাবলেটে ২, ডেস্কটপে ৩ কলাম
 * ৪. ✅ NEW: লোকেশন ফিল্টার এখন Upazila অনুযায়ী কাজ করে
 * ৫. হেডার, ট্যাব, সার্চ-বার — সবকিছু মোবাইলে wrap/stack হয়ে সুন্দরভাবে
 *    বসে
 *
 * ⚠️ ব্যাকএন্ডে (server.js) Reviews Edit করার জন্য নতুন
 *    PUT /admin/reviews/:id route যোগ করতে হবে (আলাদাভাবে দেওয়া হলো)
 * ==============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

// ✅ NEW: location স্ট্রিং ("Upazila, District") থেকে Upazila/Thana অংশটা বের করা
function getUpazila(locationStr) {
  if (!locationStr) return "লোকেশন নেই";
  const first = String(locationStr).split(",")[0]?.trim();
  return first || "লোকেশন নেই";
}

function isAvailable(donor) {
  if (!donor.date) return true;
  return Date.now() - new Date(donor.date).getTime() >= NINETY_DAYS_MS;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // ✅ NEW: Donors / Reviews ট্যাব সুইচ করার state
  const [activeTab, setActiveTab] = useState("donors"); // "donors" | "reviews"

  // ---------------- DONOR STATE ----------------
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [editingDonor, setEditingDonor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingDonor, setDeletingDonor] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ NEW: প্রতিটা Upazila গ্রুপ collapse/expand করার state
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // ---------------- REVIEW STATE (✅ NEW) ----------------
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [editingReview, setEditingReview] = useState(null);
  const [reviewEditForm, setReviewEditForm] = useState({});
  const [savingReviewEdit, setSavingReviewEdit] = useState(false);

  const [deletingReview, setDeletingReview] = useState(null);
  const [deletingReviewBusy, setDeletingReviewBusy] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---------------- Auth গার্ড ----------------
  useEffect(() => {
    if (sessionLoading) return;
    if (!session?.user) {
      router.push("/admin/login");
      return;
    }
    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchDonors();
  }, [session, sessionLoading]);

  // ✅ NEW: Reviews ট্যাবে প্রথমবার ঢুকলেই ডেটা লোড হবে (lazy load)
  useEffect(() => {
    if (
      activeTab === "reviews" &&
      !reviewsLoaded &&
      session?.user?.role === "admin"
    ) {
      fetchReviews();
    }
  }, [activeTab, session]);

  const fetchDonors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/donors`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Donor তথ্য লোড করা যায়নি");
      const data = await res.json();
      setDonors(Array.isArray(data) ? data : data.donors || []);
    } catch (err) {
      setError(err.message || "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: রিভিউ লোড করা (admin route এর মতোই cookie সহ, যদিও এই route
  // পাবলিক — consistency এর জন্য credentials: include রাখা হলো)
  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("রিভিউ লোড করা যায়নি");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
      setReviewsLoaded(true);
    } catch (err) {
      setReviewsError(err.message || "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setReviewsLoading(false);
    }
  };

  // ---------------- STATS ----------------
  const stats = useMemo(() => {
    const total = donors.length;
    const available = donors.filter(isAvailable).length;

    // ✅ NEW: এখন lokation counts Upazila অনুযায়ী গণনা হয়
    const locationCounts = {};
    donors.forEach((d) => {
      const upz = getUpazila(d.location);
      locationCounts[upz] = (locationCounts[upz] || 0) + 1;
    });

    return { total, available, unavailable: total - available, locationCounts };
  }, [donors]);

  const uniqueLocations = useMemo(
    () =>
      Object.keys(stats.locationCounts).sort((a, b) =>
        a.localeCompare(b, "bn"),
      ),
    [stats.locationCounts],
  );

  // ---------------- সার্চ + ফিল্টার ----------------
  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        d.name?.toLowerCase().includes(term) ||
        d.mobile?.toLowerCase().includes(term) ||
        d.mobile2?.toLowerCase().includes(term) ||
        d.email?.toLowerCase().includes(term) ||
        d.BloodGroup?.toLowerCase().includes(term) ||
        d.location?.toLowerCase().includes(term);

      // ✅ NEW: এখন location filter পুরো location string না, শুধু Upazila অংশ দিয়ে মেলানো হয়
      const matchesLocation =
        locationFilter === "all" || getUpazila(d.location) === locationFilter;

      const availNow = isAvailable(d);
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && availNow) ||
        (availabilityFilter === "unavailable" && !availNow);

      return matchesSearch && matchesLocation && matchesAvailability;
    });
  }, [donors, searchTerm, locationFilter, availabilityFilter]);

  // ✅ NEW: ফিল্টার হওয়া ডোনারদের Upazila অনুযায়ী গ্রুপ করা
  const groupedDonors = useMemo(() => {
    const groups = {};
    filteredDonors.forEach((d) => {
      const upz = getUpazila(d.location);
      if (!groups[upz]) groups[upz] = [];
      groups[upz].push(d);
    });
    return Object.entries(groups).sort((a, b) =>
      a[0].localeCompare(b[0], "bn"),
    );
  }, [filteredDonors]);

  const toggleGroup = (upz) => {
    setCollapsedGroups((prev) => ({ ...prev, [upz]: !prev[upz] }));
  };

  // ---------------- DONOR EDIT ----------------
  const openEditModal = (donor) => {
    setEditingDonor(donor);
    setEditForm({
      name: donor.name || "",
      email: donor.email || "",
      mobile: donor.mobile || "",
      mobile2: donor.mobile2 || "",
      BloodGroup: donor.BloodGroup || "",
      location: donor.location || "",
      bio: donor.bio || "",
      date: donor.date ? String(donor.date).slice(0, 10) : "",
    });
  };

  const closeEditModal = () => {
    setEditingDonor(null);
    setEditForm({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingDonor) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/admin/donors/${editingDonor._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "তথ্য আপডেট করা যায়নি");

      setDonors((prev) =>
        prev.map((d) =>
          d._id === editingDonor._id ? { ...d, ...editForm } : d,
        ),
      );
      showToast("Donor তথ্য সফলভাবে আপডেট হয়েছে", "success");
      closeEditModal();
    } catch (err) {
      showToast(err.message || "আপডেট করতে সমস্যা হয়েছে", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // ---------------- DONOR DELETE ----------------
  const confirmDelete = async () => {
    if (!deletingDonor) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/admin/donors/${deletingDonor._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Donor ডিলিট করা যায়নি");

      setDonors((prev) => prev.filter((d) => d._id !== deletingDonor._id));
      showToast("Donor সফলভাবে ডিলিট হয়েছে", "success");
      setDeletingDonor(null);
    } catch (err) {
      showToast(err.message || "ডিলিট করতে সমস্যা হয়েছে", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ---------------- REVIEW EDIT (✅ NEW) ----------------
  const openReviewEditModal = (review) => {
    setEditingReview(review);
    setReviewEditForm({
      name: review.name || "",
      address: review.address || "",
      review: review.review || "",
      rating: review.rating || 5,
    });
  };

  const closeReviewEditModal = () => {
    setEditingReview(null);
    setReviewEditForm({});
  };

  const handleReviewEditChange = (e) => {
    const { name, value } = e.target;
    setReviewEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveReviewEdit = async () => {
    if (!editingReview) return;
    setSavingReviewEdit(true);
    try {
      const res = await fetch(`${API_URL}/admin/reviews/${editingReview._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewEditForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "রিভিউ আপডেট করা যায়নি");

      setReviews((prev) =>
        prev.map((r) =>
          r._id === editingReview._id ? { ...r, ...reviewEditForm } : r,
        ),
      );
      showToast("রিভিউ সফলভাবে আপডেট হয়েছে", "success");
      closeReviewEditModal();
    } catch (err) {
      showToast(err.message || "আপডেট করতে সমস্যা হয়েছে", "error");
    } finally {
      setSavingReviewEdit(false);
    }
  };

  // ---------------- REVIEW DELETE (✅ NEW) ----------------
  const confirmDeleteReview = async () => {
    if (!deletingReview) return;
    setDeletingReviewBusy(true);
    try {
      const res = await fetch(
        `${API_URL}/admin/reviews/${deletingReview._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "রিভিউ ডিলিট করা যায়নি");

      setReviews((prev) => prev.filter((r) => r._id !== deletingReview._id));
      showToast("রিভিউ সফলভাবে ডিলিট হয়েছে", "success");
      setDeletingReview(null);
    } catch (err) {
      showToast(err.message || "ডিলিট করতে সমস্যা হয়েছে", "error");
    } finally {
      setDeletingReviewBusy(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  if (sessionLoading) {
    return <p className="p-10 text-center text-zinc-500">লোড হচ্ছে...</p>;
  }

  // ================= UI অংশ =================
  return (
    <div className="min-h-screen bg-zinc-50 p-3 sm:p-6 md:p-8">
      {/* ---------- হেডার (✅ মোবাইলে wrap হয়ে সুন্দরভাবে বসে) ---------- */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-zinc-800 sm:text-2xl">
          Admin Dashboard
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={activeTab === "donors" ? fetchDonors : fetchReviews}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 sm:px-4 sm:text-sm"
          >
            🔄 রিফ্রেশ
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-900 sm:px-4 sm:text-sm"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* ---------- ✅ NEW: ট্যাব সুইচার ---------- */}
      <div className="mb-6 flex w-full gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 sm:w-fit">
        <button
          onClick={() => setActiveTab("donors")}
          className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
            activeTab === "donors"
              ? "bg-white text-red-600 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          🩸 ডোনার ({donors.length})
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
            activeTab === "reviews"
              ? "bg-white text-red-600 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          ⭐ রিভিউ {reviewsLoaded ? `(${reviews.length})` : ""}
        </button>
      </div>

      {/* =========================================================
          DONORS ট্যাব
      ========================================================= */}
      {activeTab === "donors" && (
        <>
          {/* ---------- STAT কার্ডগুলো ---------- */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatCard
              label="মোট Donor"
              value={stats.total}
              color="bg-red-600"
            />
            <StatCard
              label="Available Donor (৯০+ দিন)"
              value={stats.available}
              color="bg-green-600"
            />
            <StatCard
              label="সম্প্রতি Donate করেছেন"
              value={stats.unavailable}
              color="bg-amber-500"
            />
          </div>

          {/* ---------- Upazila summary ---------- */}
          <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-500">
              Upazila/Thana অনুযায়ী Donor সংখ্যা
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.locationCounts).map(([loc, count]) => (
                <button
                  key={loc}
                  onClick={() =>
                    setLocationFilter((prev) => (prev === loc ? "all" : loc))
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    locationFilter === loc
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  📍 {loc}: {count}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- সার্চ + ফিল্টার বার ---------- */}
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="নাম, মোবাইল, ইমেইল, ব্লাড গ্রুপ বা লোকেশন দিয়ে সার্চ করুন..."
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 pl-10 text-sm outline-none focus:border-red-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                🔍
              </span>
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm md:w-auto"
            >
              <option value="all">সব Upazila/Thana</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm md:w-auto"
            >
              <option value="all">সব Donor</option>
              <option value="available">শুধু Available</option>
              <option value="unavailable">শুধু Unavailable</option>
            </select>
          </div>

          {loading && (
            <p className="py-10 text-center text-zinc-500">লোড হচ্ছে...</p>
          )}
          {error && !loading && (
            <p className="py-10 text-center text-red-600">{error}</p>
          )}

          {/* ---------- ✅ NEW: Upazila অনুযায়ী গ্রুপ করা Donor কার্ড ---------- */}
          {!loading && !error && (
            <div>
              {groupedDonors.length === 0 && (
                <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center text-zinc-400">
                  কোনো Donor পাওয়া যায়নি
                </div>
              )}

              {groupedDonors.map(([upazila, list]) => {
                const isOpen = searchTerm.trim()
                  ? true
                  : !collapsedGroups[upazila];
                return (
                  <div
                    key={upazila}
                    className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-white"
                  >
                    <button
                      onClick={() => toggleGroup(upazila)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-zinc-50"
                    >
                      <span className="flex flex-wrap items-center gap-2 font-semibold text-zinc-800">
                        📍 {upazila}
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          {list.length} জন
                        </span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 shrink-0 text-zinc-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="grid grid-cols-1 gap-4 border-t border-zinc-100 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        {list.map((donor) => (
                          <DonorCard
                            key={donor._id}
                            donor={donor}
                            available={isAvailable(donor)}
                            onEdit={openEditModal}
                            onDelete={setDeletingDonor}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* =========================================================
          ✅ NEW: REVIEWS ট্যাব
      ========================================================= */}
      {activeTab === "reviews" && (
        <>
          {reviewsLoading && (
            <p className="py-10 text-center text-zinc-500">লোড হচ্ছে...</p>
          )}
          {reviewsError && !reviewsLoading && (
            <p className="py-10 text-center text-red-600">{reviewsError}</p>
          )}

          {!reviewsLoading && !reviewsError && (
            <>
              {reviews.length === 0 ? (
                <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center text-zinc-400">
                  কোনো রিভিউ পাওয়া যায়নি
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      onEdit={openReviewEditModal}
                      onDelete={setDeletingReview}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ---------- DONOR EDIT MODAL ---------- */}
      {editingDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-zinc-800">
              Donor তথ্য এডিট করুন
            </h2>

            <div className="space-y-3">
              <FormField label="নাম">
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="input-field"
                />
              </FormField>

              <FormField label="ইমেইল">
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  className="input-field"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="মোবাইল">
                  <input
                    name="mobile"
                    value={editForm.mobile}
                    onChange={handleEditFormChange}
                    className="input-field"
                  />
                </FormField>
                <FormField label="মোবাইল ২ (ঐচ্ছিক)">
                  <input
                    name="mobile2"
                    value={editForm.mobile2}
                    onChange={handleEditFormChange}
                    className="input-field"
                  />
                </FormField>
              </div>

              <FormField label="ব্লাড গ্রুপ">
                <select
                  name="BloodGroup"
                  value={editForm.BloodGroup}
                  onChange={handleEditFormChange}
                  className="input-field"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              {/* ✅ NEW নোট: এই ইনপুটটা আপনার আসল location form (District +
                  Upazila select) দিয়ে replace করতে পারেন — আপাতত raw string
                  হিসেবে এডিট করার সুযোগ রাখা হলো */}
              <FormField label="লোকেশন (Upazila, District)">
                <input
                  name="location"
                  value={editForm.location}
                  onChange={handleEditFormChange}
                  placeholder="যেমন: পটিয়া, চট্টগ্রাম"
                  className="input-field"
                />
              </FormField>

              <FormField label="Bio">
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditFormChange}
                  rows={2}
                  className="input-field"
                />
              </FormField>

              <FormField label="শেষ Donation তারিখ">
                <input
                  type="date"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditFormChange}
                  className="input-field"
                />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                বাতিল
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {savingEdit ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DONOR DELETE CONFIRM MODAL ---------- */}
      {deletingDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <p className="mb-2 text-lg font-semibold text-zinc-800">
              আপনি কি নিশ্চিত?
            </p>
            <p className="mb-6 text-sm text-zinc-500">
              <strong>{deletingDonor.name}</strong> কে ডিলিট করলে এই তথ্য আর
              ফিরিয়ে আনা যাবে না।
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingDonor(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "ডিলিট হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ✅ NEW: REVIEW EDIT MODAL ---------- */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-zinc-800">
              রিভিউ এডিট করুন
            </h2>

            <div className="space-y-3">
              <FormField label="নাম">
                <input
                  name="name"
                  value={reviewEditForm.name}
                  onChange={handleReviewEditChange}
                  className="input-field"
                />
              </FormField>

              <FormField label="ঠিকানা / এলাকা">
                <input
                  name="address"
                  value={reviewEditForm.address}
                  onChange={handleReviewEditChange}
                  className="input-field"
                />
              </FormField>

              <FormField label="রেটিং">
                <StarSelector
                  value={reviewEditForm.rating}
                  onChange={(rating) =>
                    setReviewEditForm((prev) => ({ ...prev, rating }))
                  }
                />
              </FormField>

              <FormField label="রিভিউ">
                <textarea
                  name="review"
                  value={reviewEditForm.review}
                  onChange={handleReviewEditChange}
                  rows={4}
                  className="input-field"
                />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeReviewEditModal}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                বাতিল
              </button>
              <button
                onClick={saveReviewEdit}
                disabled={savingReviewEdit}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {savingReviewEdit ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ✅ NEW: REVIEW DELETE CONFIRM MODAL ---------- */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <p className="mb-2 text-lg font-semibold text-zinc-800">
              আপনি কি নিশ্চিত?
            </p>
            <p className="mb-6 text-sm text-zinc-500">
              <strong>{deletingReview.name}</strong> এর রিভিউটা ডিলিট করলে এটা
              আর ফিরিয়ে আনা যাবে না।
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingReview(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={deletingReviewBusy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingReviewBusy ? "ডিলিট হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg sm:left-auto sm:right-6 sm:translate-x-0 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ==================== ছোট রিইউজেবল কম্পোনেন্টগুলো ====================

function StatCard({ label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div
        className={`h-12 w-12 shrink-0 rounded-full ${color} flex items-center justify-center text-lg font-bold text-white`}
      >
        {value}
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-xl font-bold text-zinc-800">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

// ✅ NEW: রিভিউ এডিট মোডালে রেটিং সিলেক্ট করার জন্য স্টার সিলেক্টর
function StarSelector({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ✅ NEW: ডোনার টেবিলের বদলে — মোবাইল-ফ্রেন্ডলি কার্ড
function DonorCard({ donor, available, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
          {donor.image && (
            <Image
              src={donor.image}
              alt={donor.name}
              fill
              className="object-cover"
              unoptimized={donor.image.startsWith("data:")}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-800">{donor.name}</p>
          <span className="mt-0.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            {donor.BloodGroup}
          </span>
        </div>
        {available ? (
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            Available
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Unavailable
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm text-zinc-600">
        <p className="truncate">
          📞 {donor.mobile}
          {donor.mobile2 && ` / ${donor.mobile2}`}
        </p>
        {donor.email && <p className="truncate">✉️ {donor.email}</p>}
        <p className="truncate">📍 {donor.location || "-"}</p>
        <p>
          🩸 শেষ Donation:{" "}
          {donor.date
            ? new Date(donor.date).toLocaleDateString("bn-BD")
            : "কখনো করেনি"}
        </p>
      </div>

      <div className="mt-auto flex justify-end gap-2 pt-1">
        <button
          onClick={() => onEdit(donor)}
          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(donor)}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

// ✅ NEW: Admin panel এ রিভিউ দেখানোর কার্ড
function ReviewCard({ review, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-800">{review.name}</p>
          <p className="truncate text-xs text-zinc-500">📍 {review.address}</p>
        </div>
        {review.date && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
            {review.date}
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= review.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-300"
            }`}
          />
        ))}
      </div>

      <p className="line-clamp-4 text-sm text-zinc-600">"{review.review}"</p>

      <div className="mt-auto flex justify-end gap-2 pt-1">
        <button
          onClick={() => onEdit(review)}
          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(review)}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

/**
 * নোট: .input-field ক্লাসটা globals.css এ যোগ করুন (আগেও বলা হয়েছিল):
 * .input-field {
 *   @apply w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500;
 * }
 */
