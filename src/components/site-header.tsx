import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getProfileRole } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/listings?listing_type=sale", label: "Buy" },
  { href: "/listings?listing_type=rent", label: "Rent" },
  { href: "/listings?property_category=land", label: "Land" },
  { href: "/listings?property_category=commercial", label: "Commercial" },
];

export async function SiteHeader() {
  let user: User | null = null;
  let isAdmin = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      isAdmin = (await getProfileRole(supabase, user.id)) === "admin";
    }
  } catch {
    // Missing env in local setup
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:min-h-16 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-lg"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-xs font-bold text-white shadow-sm shadow-brand-900/20 sm:h-9 sm:w-9 sm:text-sm">
            MN
          </span>
          <span className="hidden sm:inline">Mark Nyumba</span>
        </Link>
        <nav className="hidden items-center rounded-full border border-zinc-200 bg-zinc-50 p-1 text-sm font-medium text-zinc-600 md:flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-zinc-950 hover:shadow-sm dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/listings"
            className="inline-flex rounded-full px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 lg:px-4"
          >
            Browse
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="hidden rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-900/15 transition hover:bg-brand-800 sm:inline-flex dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            List property
          </Link>
          {user ? (
            <>
              <Link
                href="/favorites"
                className="hidden rounded-full px-2.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 sm:inline-flex sm:text-sm dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                title="Saved listings"
              >
                Saved
              </Link>
              <Link
                href="/messages"
                className="hidden rounded-full px-2.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 sm:inline-flex sm:text-sm dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Messages
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Account</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:px-4"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
