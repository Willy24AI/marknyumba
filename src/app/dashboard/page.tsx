import type { Metadata } from "next";
import Link from "next/link";
import { DashboardListingCard } from "@/components/dashboard-listing-card";
import { listPropertiesByOwner } from "@/lib/data/properties";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Mark Nyumba",
  description: "Manage your property listings.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: mine, error: listError } = await listPropertiesByOwner(supabase, user.id);

  return (
    <div className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">Signed in as {user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/favorites"
            className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Saved
          </Link>
          <Link
            href="/messages"
            className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Messages
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            New listing
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Your listings</h2>
        {listError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {listError}
          </p>
        ) : mine.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-zinc-200 py-12 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            You have not listed anything yet.{" "}
            <Link href="/dashboard/listings/new" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Add a property
            </Link>
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {mine.map((p) => (
              <li key={p.id}>
                <DashboardListingCard property={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
