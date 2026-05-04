import Link from "next/link";
import { deletePropertyAction } from "@/app/dashboard/actions";
import type { PropertyRow } from "@/types/property";
import { categoryLabel, formatPrice, listingLabel, listingStatusLabel, rentPeriodLabel } from "@/lib/format";
import { regionLabel } from "@/lib/locations/uganda";

export function DashboardListingCard({ property }: { property: PropertyRow }) {
  const image =
    property.image_urls?.[0] ??
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row">
      <Link
        href={`/listings/${property.id}`}
        className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-48 dark:bg-zinc-800"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
            {listingLabel(property.listing_type)}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {categoryLabel(property.property_category)}
          </span>
          {!property.is_published && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
              Unpublished
            </span>
          )}
          {property.listing_status !== "available" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
              {listingStatusLabel(property.listing_status)}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{property.title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatPrice(Number(property.price), property.currency)}
          {property.listing_type === "rent" && ` / ${rentPeriodLabel(property.rent_period)}`} -{" "}
          {[property.district, property.city, regionLabel(property.region)].filter(Boolean).join(" - ")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={`/listings/${property.id}`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            View live
          </Link>
          <Link
            href={`/dashboard/listings/${property.id}/edit`}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Edit
          </Link>
          <form action={deletePropertyAction}>
            <input type="hidden" name="id" value={property.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
