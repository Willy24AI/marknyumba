import type { PropertyRow } from "@/types/property";
import { PropertyCard } from "@/components/property-card";

type Props = {
  properties: PropertyRow[];
  emptyMessage?: string;
  viewerUserId?: string | null;
  favoriteIds?: Set<string>;
};

export function ListingsGrid({ properties, emptyMessage, viewerUserId, favoriteIds }: Props) {
  if (properties.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 sm:py-16 sm:text-base">
        {emptyMessage ?? "No listings match your filters yet."}
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {properties.map((p) => (
        <li key={p.id} className="h-full">
          <PropertyCard
            property={p}
            viewerUserId={viewerUserId}
            favoriteIds={favoriteIds}
          />
        </li>
      ))}
    </ul>
  );
}
