import type { Metadata } from "next";
import Link from "next/link";
import { ListingsGrid } from "@/components/listings-grid";
import { listFavoriteProperties } from "@/lib/data/favorites";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved listings | Mark Nyumba",
  description: "Properties you have saved.",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: properties, error } = await listFavoriteProperties(supabase, user.id);
  const favoriteIds = new Set(properties.map((p) => p.id));

  return (
    <div className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Saved listings</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Listings you have favorited while signed in.{" "}
          <Link href="/listings" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Browse more
          </Link>
        </p>
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      <ListingsGrid
        properties={properties}
        emptyMessage="You have not saved any listings yet. Tap the heart on a property card to add it here."
        viewerUserId={user.id}
        favoriteIds={favoriteIds}
      />
    </div>
  );
}
