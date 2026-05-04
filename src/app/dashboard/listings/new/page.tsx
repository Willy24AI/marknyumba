import type { Metadata } from "next";
import Link from "next/link";
import { createProperty } from "@/app/dashboard/actions";
import { PropertyFormFields } from "@/components/property-form-fields";

export const metadata: Metadata = {
  title: "List a property | Mark Nyumba",
  description: "Add a new property for sale or rent.",
};

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;

  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        ← Dashboard
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        List a property
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Fields mirror what buyers and tenants expect on major portals: type, price, location, and size.
      </p>

      {q.error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {q.error === "validation" ? "Please fill in title, region, town, and a valid price." : decodeURIComponent(q.error)}
        </p>
      )}

      <form action={createProperty} className="mt-8 space-y-6">
        <PropertyFormFields />

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto sm:px-10"
        >
          Publish listing
        </button>
      </form>
    </div>
  );
}
