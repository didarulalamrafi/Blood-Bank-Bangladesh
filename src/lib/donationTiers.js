// Donation-count based badge tiers. Adjust thresholds/labels here if needed.
// Shared between DonorCard.js (all-donors grid) and the donor details page,
// so both places always show the same badge for the same donor.
export const DONATION_TIERS = [
  {
    min: 20,
    label: "Diamond",
    className: "bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600",
  },
  {
    min: 15,
    label: "Platinum",
    className: "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500",
  },
  {
    min: 10,
    label: "Gold",
    className: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600",
  },
  {
    min: 5,
    label: "Silver",
    className: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
  },
];

export function getDonationTier(count) {
  return DONATION_TIERS.find((tier) => count >= tier.min) || null;
}
