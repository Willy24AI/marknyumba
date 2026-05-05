import type { Metadata } from "next";
import Link from "next/link";
import { updateSellerProfileAction } from "@/app/dashboard/actions";
import { DashboardListingCard } from "@/components/dashboard-listing-card";
import { listPropertiesByOwner } from "@/lib/data/properties";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Mark Nyumba",
  description: "Manage your property listings.",
};

type PageProps = {
  searchParams: Promise<{ error?: string; sellerProfile?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const q = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: mine, error: listError }, { data: profile }] = await Promise.all([
    listPropertiesByOwner(supabase, user.id),
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url, seller_business_name, seller_bio, seller_location")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const sellerProfile = profile as {
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    seller_business_name?: string | null;
    seller_bio?: string | null;
    seller_location?: string | null;
  } | null;

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
            className="inline-flex rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
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

      {q.error && (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {q.error}
        </p>
      )}
      {q.sellerProfile && (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          Seller profile updated.
        </p>
      )}

      <section className="mt-10 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Seller profile</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              This appears on your public seller page with your listings, ratings, and buyer trust signals.
            </p>
          </div>
          <Link
            href={`/sellers/${user.id}`}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            View public profile
          </Link>
        </div>

        <form action={updateSellerProfileAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="seller_business_name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Business or display name
            </label>
            <input
              id="seller_business_name"
              name="seller_business_name"
              defaultValue={sellerProfile?.seller_business_name ?? ""}
              placeholder="Mark Nyumba Realty"
              className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contact name
            </label>
            <input
              id="full_name"
              name="full_name"
              defaultValue={sellerProfile?.full_name ?? ""}
              className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={sellerProfile?.phone ?? ""}
              placeholder="+256..."
              className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label htmlFor="seller_location" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Location
            </label>
            <input
              id="seller_location"
              name="seller_location"
              defaultValue={sellerProfile?.seller_location ?? ""}
              placeholder="Kampala, Uganda"
              className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="avatar_url" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Profile picture URL
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              defaultValue={sellerProfile?.avatar_url ?? ""}
              placeholder="https://..."
              className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="seller_bio" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              About seller
            </label>
            <textarea
              id="seller_bio"
              name="seller_bio"
              rows={4}
              maxLength={1000}
              defaultValue={sellerProfile?.seller_bio ?? ""}
              placeholder="Share your property focus, service area, experience, or business details."
              className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="min-h-11 rounded-2xl bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Save seller profile
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Your listings</h2>
        {listError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {listError}
          </p>
        ) : mine.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-zinc-200 py-12 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            You have not listed anything yet.{" "}
            <Link href="/dashboard/listings/new" className="font-medium text-brand-700 hover:underline dark:text-brand-400">
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
