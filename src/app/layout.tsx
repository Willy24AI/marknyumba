import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mark Nyumba | Uganda property - sale, rent & land",
    template: "%s | Mark Nyumba",
  },
  description:
    "Discover houses, apartments, land, and commercial property for sale and rent in Uganda. List your property with a free account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <SiteHeader />
        {children}
        <footer className="mt-auto border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
            <div className="max-w-sm">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-sm font-bold text-white">
                  MN
                </span>
                Mark Nyumba
              </Link>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                A Ugandan property marketplace for homes, rentals, land, and commercial spaces.
                Built for clear discovery, direct seller contact, and trustworthy listing journeys.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Explore</p>
              <nav className="mt-4 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Link href="/listings?listing_type=sale" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  Homes for sale
                </Link>
                <Link href="/listings?listing_type=rent" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  Rentals
                </Link>
                <Link href="/listings?property_category=land" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  Land
                </Link>
              </nav>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Account</p>
              <nav className="mt-4 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Link href="/auth/login" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  Sign in
                </Link>
                <Link href="/favorites" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  Saved listings
                </Link>
                <Link href="/messages" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  Messages
                </Link>
              </nav>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">For Sellers</p>
              <nav className="mt-4 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Link href="/dashboard/listings/new" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  List property
                </Link>
                <Link href="/dashboard" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  Dashboard
                </Link>
                <Link href="/api/health" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  System status
                </Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>(c) {new Date().getFullYear()} Mark Nyumba. Built for Uganda.</p>
              <p>Sale, rent, land, and commercial property in one place.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
