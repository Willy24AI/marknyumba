import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  deleteAdminConversationAction,
  deleteAdminListingAction,
  updateAdminListingAction,
  updateUserRoleAction,
} from "@/app/admin/actions";
import { listAdminConversations } from "@/lib/data/messages";
import { categoryLabel, formatPrice, listingStatusLabel } from "@/lib/format";
import { getAdminUser, listAdminProfiles, listAdminProperties } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin | Mark Nyumba",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function AdminPage({ searchParams }: PageProps) {
  const q = await searchParams;
  const supabase = await createClient();
  const { user, isAdmin } = await getAdminUser(supabase);
  if (!user) redirect("/auth/login?next=/admin");
  if (!isAdmin) notFound();

  const [
    { data: properties, error: propertyError },
    { data: profiles, error: profileError },
    { data: conversations, error: conversationError },
  ] = await Promise.all([
    listAdminProperties(supabase),
    listAdminProfiles(supabase),
    listAdminConversations(supabase),
  ]);

  const publishedCount = properties.filter((p) => p.is_published).length;
  const unpublishedCount = properties.length - publishedCount;
  const adminCount = profiles.filter((p) => p.role === "admin").length;

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Site control
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Signed in as {user.email}</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Seller dashboard
        </Link>
      </div>

      {q.error && (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {q.error}
        </p>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Listings", value: properties.length },
          { label: "Published", value: publishedCount },
          { label: "Unpublished", value: unpublishedCount },
          { label: "Conversations", value: conversations.length },
          { label: "Admins", value: adminCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Listings</h2>
          <Link href="/dashboard/listings/new" className="text-sm font-semibold text-emerald-700 hover:underline">
            Add listing
          </Link>
        </div>
        {propertyError ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {propertyError}
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {properties.map((property) => (
                <li key={property.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {categoryLabel(property.property_category)}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {listingStatusLabel(property.listing_status)}
                      </span>
                      {!property.is_published && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                          Hidden
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/listings/${property.id}`}
                      className="mt-2 block truncate font-semibold text-zinc-950 hover:text-emerald-700 dark:text-zinc-50"
                    >
                      {property.title}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatPrice(Number(property.price), property.currency)} - {property.city}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                    <form action={updateAdminListingAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={property.id} />
                      <select
                        name="listing_status"
                        defaultValue={property.listing_status}
                        className="min-h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                      >
                        <option value="available">Available</option>
                        <option value="under_offer">Under offer</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </select>
                      <label className="flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-700">
                        <input type="checkbox" name="is_published" defaultChecked={property.is_published} />
                        Published
                      </label>
                      <button
                        type="submit"
                        className="min-h-10 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                      >
                        Save
                      </button>
                    </form>
                    <form action={deleteAdminListingAction}>
                      <input type="hidden" name="id" value={property.id} />
                      <button
                        type="submit"
                        className="min-h-10 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
              {properties.length === 0 && (
                <li className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No listings yet.</li>
              )}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Conversations</h2>
        {conversationError ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {conversationError}
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {conversations.slice(0, 8).map((conversation) => {
                const property = Array.isArray(conversation.properties)
                  ? conversation.properties[0]
                  : conversation.properties;

                return (
                  <li key={conversation.id} className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <Link
                        href={`/messages/${conversation.id}`}
                        className="block truncate font-semibold text-zinc-950 hover:text-emerald-700 dark:text-zinc-50"
                      >
                        {property?.title ?? "Conversation"}
                      </Link>
                      <p className="mt-1 text-sm text-zinc-500">
                        {property?.city ?? "Uganda"} - updated {new Date(conversation.updated_at).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Buyer {conversation.buyer_id} - Seller {conversation.seller_id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/messages/${conversation.id}`}
                        className="min-h-10 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
                      >
                        Open
                      </Link>
                      <form action={deleteAdminConversationAction}>
                        <input type="hidden" name="id" value={conversation.id} />
                        <button
                          type="submit"
                          className="min-h-10 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
              {conversations.length === 0 && (
                <li className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No conversations yet.</li>
              )}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Users</h2>
        {profileError ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {profileError}
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {profiles.map((profile) => (
                <li key={profile.id} className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-950 dark:text-zinc-50">
                      {profile.full_name || "Unnamed user"}
                    </p>
                    <p className="mt-1 truncate text-sm text-zinc-500">
                      {profile.email || "No email stored"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">{profile.id}</p>
                  </div>
                  <form action={updateUserRoleAction} className="flex gap-2">
                    <input type="hidden" name="id" value={profile.id} />
                    <select
                      name="role"
                      defaultValue={profile.role}
                      className="min-h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="min-h-10 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                    >
                      Update
                    </button>
                  </form>
                </li>
              ))}
              {profiles.length === 0 && (
                <li className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No users yet.</li>
              )}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
