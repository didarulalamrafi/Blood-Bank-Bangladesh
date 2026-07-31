import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-zinc-900 text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {/* ব্র্যান্ড / পরিচিতি */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-red-500"
              >
                <path
                  d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0c0-4.5-7-13-7-13z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-lg font-bold text-white">
                Blood Bank of Bangladesh
              </span>
            </div>
            <Link href={"https://www.facebook.com/DidarulAlamRafi1"}>
              <h2>
                Create by <strong>Didarul Alam Rafi</strong>
              </h2>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">
              Connecting donors and recipients across Bangladesh. One
              registration can help save a life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/" className="transition hover:text-red-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/all" className="transition hover:text-red-400">
                  All Donors
                </Link>
              </li>
              <li>
                <Link href="/add" className="transition hover:text-red-400">
                  Add Donor
                </Link>
              </li>
              <li>
                <Link
                  href="/favourite"
                  className="transition hover:text-red-400"
                >
                  Favourite
                </Link>
              </li>
            </ul>
          </div>

          {/* যোগাযোগ */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              Contact
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-zinc-400">
              <li>Chattogram, Bangladesh</li>
              <li
                href="mailto:didarulalamw@gmail.com"
                className="transition hover:text-red-400"
              >
                didarulalamw@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500 sm:mt-10">
          © {new Date().getFullYear()} Blood Bank of Bangladesh. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
