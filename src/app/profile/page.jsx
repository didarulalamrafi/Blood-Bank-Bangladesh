"use client";

/**
 * ==============================================================
 * Profile Page (/profile)
 * ==============================================================
 * তিনটা ট্যাব: অ্যাকাউন্ট তথ্য (name/phone/avatar), ডোনার তথ্য
 * (blood group/location/blood bank/bio), আর দানের ইতিহাস
 * (list + নতুন এন্ট্রি যোগ করার ফর্ম)।
 *
 * Backend endpoints ধরে নেওয়া হয়েছে:
 *  GET   /api/users/:id                -> { user, donor, donations }
 *  PATCH /api/users/:id                -> update name/phone/image
 *  PATCH /api/users/:id/donor-profile  -> update donor fields (আগে থেকেই আছে)
 *  POST  /api/users/:id/donations      -> { date, location, notes } যোগ করে,
 *                                          donor.totalDonations +1 করে সার্ভার সাইডে
 * ==============================================================
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Droplet,
  User,
  MapPin,
  Calendar as CalendarIcon,
  Plus,
  Check,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const TABS = [
  { id: "account", label: "অ্যাকাউন্ট" },
  { id: "donor", label: "ডোনার তথ্য" },
  { id: "donations", label: "দানের ইতিহাস" },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [account, setAccount] = useState({ name: "", phone: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  const [donor, setDonor] = useState(null);
  const [savingDonor, setSavingDonor] = useState(false);

  const [district, setDistrict] = useState(null);
  const [upazila, setUpazila] = useState(null);
  const [union, setUnion] = useState(null);
  const [districtNames, setDistrictNames] = useState([]);
  const [upazilaNames, setUpazilaNames] = useState([]);
  const [unionNames, setUnionNames] = useState([]);

  const [donations, setDonations] = useState([]);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [newDonation, setNewDonation] = useState({
    date: "",
    location: "",
    notes: "",
  });
  const [savingDonation, setSavingDonation] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?next=/profile");
    }
  }, [sessionLoading, session, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(`/api/users/${session.user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setAccount({
          name: data.user?.name || "",
          phone: data.user?.phone || "",
        });
        setImagePreview(data.user?.image || null);
        if (data.donor) {
          setDonor(data.donor);
          setDistrict(data.donor.district || null);
          setUpazila(data.donor.upazila || null);
          setUnion(data.donor.union || null);
        }
        setDonations(data.donations || []);
      })
      .catch(() => setError("তথ্য লোড করা যায়নি।"))
      .finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setDistrictNames(data.districts || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!district) {
      setUpazilaNames([]);
      return;
    }
    fetch(`/api/locations?district=${encodeURIComponent(district)}`)
      .then((res) => res.json())
      .then((data) => setUpazilaNames(data.upazilas || []))
      .catch(() => {});
  }, [district]);

  useEffect(() => {
    if (!district || !upazila) {
      setUnionNames([]);
      return;
    }
    fetch(
      `/api/locations?district=${encodeURIComponent(district)}&upazila=${encodeURIComponent(upazila)}`,
    )
      .then((res) => res.json())
      .then((data) => setUnionNames(data.unions || []))
      .catch(() => {});
  }, [district, upazila]);

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("সঠিক ছবি ফাইল নির্বাচন করুন।");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("ছবির সাইজ ২ মেগাবাইটের কম হতে হবে।");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSavingAccount(true);
    try {
      const body = { name: account.name, phone: account.phone };
      if (imageData) body.image = imageData;

      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      flashSuccess("অ্যাকাউন্ট তথ্য আপডেট হয়েছে।");
    } catch {
      setError("সেভ করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setSavingAccount(false);
    }
  };

  const saveDonor = async (e) => {
    e.preventDefault();
    setError("");

    const upazilaValue = upazila;
    const unionValue = union;
    if (!district || !upazilaValue || !unionValue) {
      setError("জেলা, উপজেলা এবং ইউনিয়ন/এলাকা নির্বাচন করুন।");
      return;
    }

    setSavingDonor(true);
    try {
      const body = {
        ...donor,
        district,
        upazila: upazilaValue,
        union: unionValue,
        location: [district, upazilaValue, unionValue]
          .filter(Boolean)
          .join(", "),
      };
      const res = await fetch(`/api/users/${session.user.id}/donor-profile`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      flashSuccess("ডোনার তথ্য আপডেট হয়েছে।");
    } catch {
      setError("সেভ করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setSavingDonor(false);
    }
  };

  const addDonation = async (e) => {
    e.preventDefault();
    setError("");
    if (!newDonation.date || !newDonation.location) {
      setError("তারিখ এবং লোকেশন দিন।");
      return;
    }
    setSavingDonation(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}/donations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newDonation),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setDonations((prev) => [created, ...prev]);
      setDonor((prev) =>
        prev
          ? {
              ...prev,
              totalDonations: (prev.totalDonations || 0) + 1,
              lastDonationDate: newDonation.date,
            }
          : prev,
      );
      setNewDonation({ date: "", location: "", notes: "" });
      setShowAddDonation(false);
      flashSuccess("দানের তথ্য যোগ হয়েছে।");
    } catch {
      setError("যোগ করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setSavingDonation(false);
    }
  };

  if (sessionLoading || !session?.user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-400">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 py-6 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          প্রোফাইল
        </h1>
        <p className="mb-5 text-sm text-zinc-500">
          আপনার অ্যাকাউন্ট, ডোনার তথ্য এবং দানের ইতিহাস পরিচালনা করুন।
        </p>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                activeTab === t.id
                  ? "bg-red-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
            <Check className="h-4 w-4" />
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            লোড হচ্ছে...
          </div>
        ) : (
          <>
            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <form
                onSubmit={saveAccount}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-5 flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-6 w-6 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="avatarInput"
                      className="inline-block cursor-pointer rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      ছবি পরিবর্তন করুন
                    </label>
                    <input
                      id="avatarInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="mt-1 text-xs text-zinc-400">
                      সর্বোচ্চ ২ মেগাবাইট
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    নাম
                  </label>
                  <input
                    type="text"
                    value={account.name}
                    onChange={(e) =>
                      setAccount((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    value={session.user.email}
                    disabled
                    className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <div className="mb-5">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    ফোন নম্বর
                  </label>
                  <input
                    type="tel"
                    value={account.phone}
                    onChange={(e) =>
                      setAccount((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="01XXXXXXXXX"
                    className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingAccount}
                  className="h-10 w-full rounded-md bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {savingAccount ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </button>
              </form>
            )}

            {/* DONOR TAB */}
            {activeTab === "donor" && (
              <form
                onSubmit={saveDonor}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {!donor ? (
                  <div className="text-center">
                    <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                      <Droplet
                        className="h-6 w-6 text-red-600"
                        fill="currentColor"
                      />
                    </div>
                    <p className="text-sm text-zinc-500">
                      আপনি এখনো ডোনার প্রোফাইল তৈরি করেননি।
                    </p>
                    <a
                      href="/donor/add"
                      className="mt-3 inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      ডোনার প্রোফাইল তৈরি করুন
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="mb-1 block text-xs font-medium text-zinc-500">
                        রক্তের গ্রুপ
                      </label>
                      <select
                        value={donor.bloodGroup || ""}
                        onChange={(e) =>
                          setDonor((f) => ({
                            ...f,
                            bloodGroup: e.target.value,
                          }))
                        }
                        required
                        className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <option value="">নির্বাচন করুন</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          জেলা
                        </label>
                        <select
                          value={district || ""}
                          onChange={(e) => {
                            setDistrict(e.target.value || null);
                            setUpazila(null);
                            setUnion(null);
                          }}
                          required
                          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <option value="">নির্বাচন করুন</option>
                          {districtNames.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          উপজেলা
                        </label>
                        <select
                          value={upazila || ""}
                          onChange={(e) => {
                            setUpazila(e.target.value || null);
                            setUnion(null);
                          }}
                          disabled={!district}
                          required
                          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <option value="">নির্বাচন করুন</option>
                          {upazilaNames.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          ইউনিয়ন/এলাকা
                        </label>
                        <select
                          value={union || ""}
                          onChange={(e) => setUnion(e.target.value || null)}
                          disabled={!upazila}
                          required
                          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <option value="">নির্বাচন করুন</option>
                          {unionNames.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1 block text-xs font-medium text-zinc-500">
                        ব্লাড ব্যাংক
                      </label>
                      <input
                        type="text"
                        value={donor.bloodBankName || ""}
                        onChange={(e) =>
                          setDonor((f) => ({
                            ...f,
                            bloodBankName: e.target.value,
                          }))
                        }
                        placeholder="ঐচ্ছিক"
                        className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="mb-1 block text-xs font-medium text-zinc-500">
                        বায়ো
                      </label>
                      <textarea
                        value={donor.bio || ""}
                        onChange={(e) =>
                          setDonor((f) => ({ ...f, bio: e.target.value }))
                        }
                        rows={3}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingDonor}
                      className="h-10 w-full rounded-md bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {savingDonor ? "সেভ হচ্ছে..." : "সেভ করুন"}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* DONATIONS TAB */}
            {activeTab === "donations" && (
              <div
                id="donations"
                className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    দানের ইতিহাস ({donations.length})
                  </h3>
                  <button
                    onClick={() => setShowAddDonation((v) => !v)}
                    className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    নতুন যোগ করুন
                  </button>
                </div>

                {showAddDonation && (
                  <form
                    onSubmit={addDonation}
                    className="border-b border-zinc-100 p-4 dark:border-zinc-800"
                  >
                    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          তারিখ
                        </label>
                        <input
                          type="date"
                          value={newDonation.date}
                          onChange={(e) =>
                            setNewDonation((f) => ({
                              ...f,
                              date: e.target.value,
                            }))
                          }
                          required
                          className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-500">
                          লোকেশন
                        </label>
                        <input
                          type="text"
                          value={newDonation.location}
                          onChange={(e) =>
                            setNewDonation((f) => ({
                              ...f,
                              location: e.target.value,
                            }))
                          }
                          placeholder="যেমনঃ চট্টগ্রাম মেডিকেল"
                          required
                          className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="mb-1 block text-xs font-medium text-zinc-500">
                        নোট (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={newDonation.notes}
                        onChange={(e) =>
                          setNewDonation((f) => ({
                            ...f,
                            notes: e.target.value,
                          }))
                        }
                        className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingDonation}
                      className="h-9 w-full rounded-md bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {savingDonation ? "যোগ হচ্ছে..." : "যোগ করুন"}
                    </button>
                  </form>
                )}

                {donations.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-zinc-400">
                    এখনো কোনো দানের তথ্য নেই।
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {donations.map((d, i) => (
                      <li
                        key={d.id || i}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                          <Droplet
                            className="h-4 w-4 text-red-600"
                            fill="currentColor"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {d.location}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-zinc-500">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(d.date)}
                          </p>
                          {d.notes && (
                            <p className="mt-0.5 text-xs text-zinc-400">
                              {d.notes}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
