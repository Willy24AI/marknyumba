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
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex text-sm font-medium text-brand-700 hover:underline dark:text-brand-400"
      >
        ← Dashboard
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        List a property
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Choose the listing goal and property type first. The form will then show only the details that match that property.
      </p>

      {q.error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {q.error === "validation" ? "Please fill in title, region, town, and a valid price." : decodeURIComponent(q.error)}
        </p>
      )}

      <form
        action={createProperty}
        className="mt-8 space-y-6 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
      >
        <PropertyFormFields />

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 sm:w-auto sm:px-10"
        >
          Publish listing
        </button>
      </form>
    </div>
  );
}
