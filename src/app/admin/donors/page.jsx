"use client";

/**
 * ==============================================================
 * Admin Donor Management Page — আপডেটেড ভার্সন
 * ==============================================================
 * বদল হয়েছে (আগের ভার্সনের তুলনায়):
 * ১. আপনার আসল database field অনুযায়ী বসানো হয়েছে:
 *    name, email, mobile, mobile2, BloodGroup, location, date, bio, image
 *    (আগে ধরে নেওয়া হয়েছিল bloodGroup/phone/lastDonationDate — এখন ঠিক করা হলো)
 * ২. localStorage token বাদ দিয়ে Better Auth এর secure cookie session
 *    ব্যবহার করা হয়েছে (useSession hook দিয়ে)
 * ৩. সব fetch এ credentials: "include" দেওয়া হয়েছে যাতে login cookie
 *    ব্যাকএন্ডে যায়
 * ৪. API URL এখন backend এর route অনুযায়ী /admin/donors
 * ==============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// ⚠️ এই পেজ যদি src/app/admin/donors/page.jsx (বা যেকোনো
// nested route) এ থাকে, "@/lib/auth-client" ব্যবহার করলে
// আর ফোল্ডারের গভীরতা নিয়ে চিন্তা করতে হবে না
import { useSession, signOut } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDonorsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession(); // ✅ NEW: cookie-based session check

  // ---------------- STATE গুলো ----------------
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

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---------------- Auth গার্ড: লগইন/admin না থাকলে বের করে দাও ----------------
  useEffect(() => {
    if (sessionLoading) return; // সেশন এখনো লোড হচ্ছে, অপেক্ষা করো

    if (!session?.user) {
      router.push("/admin/login"); // লগইন করা নেই
      return;
    }
    if (session.user.role !== "admin") {
      router.push("/"); // লগইন আছে কিন্তু admin না
      return;
    }
    fetchDonors();
  }, [session, sessionLoading]);

  const fetchDonors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/donors`, {
        credentials: "include", // ✅ NEW: login cookie সহ request পাঠানো
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

  // ---------------- STATS ক্যালকুলেশন ----------------
  const stats = useMemo(() => {
    const total = donors.length;
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

    // "date" ফিল্ডটাই শেষ donation এর তারিখ ধরা হয়েছে
    const available = donors.filter((d) => {
      if (!d.date) return true;
      const diff = Date.now() - new Date(d.date).getTime();
      return diff >= NINETY_DAYS_MS;
    }).length;

    const locationCounts = {};
    donors.forEach((d) => {
      const loc = d.location || "অজানা";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    return { total, available, unavailable: total - available, locationCounts };
  }, [donors]);

  const uniqueLocations = useMemo(
    () => Object.keys(stats.locationCounts).sort(),
    [stats.locationCounts],
  );

  const isAvailable = (donor) => {
    if (!donor.date) return true;
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
    return Date.now() - new Date(donor.date).getTime() >= NINETY_DAYS_MS;
  };

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

      const matchesLocation =
        locationFilter === "all" || d.location === locationFilter;

      const availNow = isAvailable(d);
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && availNow) ||
        (availabilityFilter === "unavailable" && !availNow);

      return matchesSearch && matchesLocation && matchesAvailability;
    });
  }, [donors, searchTerm, locationFilter, availabilityFilter]);

  // ---------------- EDIT ----------------
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
        credentials: "include", // ✅ NEW
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

  // ---------------- DELETE ----------------
  const confirmDelete = async () => {
    if (!deletingDonor) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/admin/donors/${deletingDonor._id}`, {
        method: "DELETE",
        credentials: "include", // ✅ NEW
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

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  // সেশন লোড হওয়ার সময় বা auth check চলাকালীন কিছু দেখানো
  if (sessionLoading) {
    return <p className="p-10 text-center text-zinc-500">লোড হচ্ছে...</p>;
  }

  // ================= UI অংশ =================
  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      {/* ---------- হেডার ---------- */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-800">Donor Management</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchDonors}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            🔄 রিফ্রেশ
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* ---------- STAT কার্ডগুলো ---------- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="মোট Donor" value={stats.total} color="bg-red-600" />
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

      {/* ---------- Location summary ---------- */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">
          লোকেশন অনুযায়ী Donor সংখ্যা
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.locationCounts).map(([loc, count]) => (
            <span
              key={loc}
              className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
            >
              {loc}: {count}
            </span>
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
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">সব লোকেশন</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
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

      {/* ---------- Donor টেবিল ---------- */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">ছবি</th>
                <th className="px-4 py-3">নাম</th>
                <th className="px-4 py-3">মোবাইল</th>
                <th className="px-4 py-3">ব্লাড গ্রুপ</th>
                <th className="px-4 py-3">লোকেশন</th>
                <th className="px-4 py-3">শেষ Donation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-zinc-400"
                  >
                    কোনো Donor পাওয়া যায়নি
                  </td>
                </tr>
              )}
              {filteredDonors.map((donor) => (
                <tr
                  key={donor._id}
                  className="border-t border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-100">
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
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {donor.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {donor.mobile}
                    {donor.mobile2 && (
                      <span className="block text-xs text-zinc-400">
                        {donor.mobile2}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {donor.BloodGroup}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {donor.location || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {donor.date
                      ? new Date(donor.date).toLocaleDateString("bn-BD")
                      : "কখনো করেনি"}
                  </td>
                  <td className="px-4 py-3">
                    {isAvailable(donor) ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Available
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(donor)}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeletingDonor(donor)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- EDIT MODAL ---------- */}
      {editingDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
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

              <FormField label="লোকেশন">
                <input
                  name="location"
                  value={editForm.location}
                  onChange={handleEditFormChange}
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

      {/* ---------- DELETE CONFIRM MODAL ---------- */}
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

      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
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
        className={`h-12 w-12 rounded-full ${color} flex items-center justify-center text-lg font-bold text-white`}
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

/**
 * নোট: .input-field ক্লাসটা globals.css এ যোগ করুন (আগের বার যেমন বলা হয়েছিল):
 * .input-field {
 *   @apply w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500;
 * }
 */
