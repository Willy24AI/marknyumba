import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updatePropertyAction } from "@/app/dashboard/actions";
import { PropertyFormFields } from "@/components/property-form-fields";
import { getPropertyById } from "@/lib/data/properties";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Edit listing | Mark Nyumba", robots: { index: false, follow: false } };
}

export default async function EditListingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/dashboard");

  const { data: property, error } = await getPropertyById(supabase, id, user.id);
  if (error || !property || property.owner_id !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        ← Dashboard
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Edit listing
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Update details for: {property.title}</p>

      {q.error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {decodeURIComponent(q.error)}
        </p>
      )}

      <form action={updatePropertyAction} className="mt-8 space-y-6">
        <input type="hidden" name="property_id" value={property.id} />
        <PropertyFormFields defaults={property} />

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto sm:px-10"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
