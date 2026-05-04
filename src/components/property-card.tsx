import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import type { PropertyRow } from "@/types/property";
import { categoryLabel, formatPrice, listingLabel, listingStatusLabel, rentPeriodLabel } from "@/lib/format";
import { regionLabel } from "@/lib/locations/uganda";

type Props = {
  property: PropertyRow;
  /** When set, show save-to-favorites control on the card. */
  viewerUserId?: string | null;
  favoriteIds?: Set<string>;
};

export function PropertyCard({ property, viewerUserId, favoriteIds }: Props) {
  const image =
    property.image_urls?.[0] ??
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

  const signedIn = Boolean(viewerUserId);
  const initialFav = Boolean(viewerUserId && favoriteIds?.has(property.id));

  return (
    <div className="relative h-full">
      <Link
        href={`/listings/${property.id}`}
        className="group flex h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900 dark:hover:shadow-black/20 sm:flex-col sm:rounded-3xl"
      >
        <div className="relative aspect-square w-32 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800 sm:aspect-[4/3] sm:w-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent sm:h-24" />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
            <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-sm dark:bg-zinc-900/95 dark:text-emerald-400 sm:px-2.5 sm:py-1 sm:text-xs">
              {listingLabel(property.listing_type)}
            </span>
            {property.listing_status !== "available" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
                {listingStatusLabel(property.listing_status)}
              </span>
            )}
            <span className="hidden rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm sm:inline-flex">
              {categoryLabel(property.property_category)}
            </span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-3 sm:p-4">
          <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50 sm:text-xl">
            {formatPrice(Number(property.price), property.currency)}
            {property.listing_type === "rent" && (
              <span className="text-sm font-normal text-zinc-500"> / {rentPeriodLabel(property.rent_period)}</span>
            )}
            {property.price_negotiable && <span className="text-xs font-medium text-zinc-500"> negotiable</span>}
          </p>
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-800 dark:text-zinc-200 sm:text-base">
            {property.title}
          </h2>
          <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
            {[property.district, property.city, regionLabel(property.region)].filter(Boolean).join(" - ")}
          </p>
          <div className="mt-auto flex flex-wrap gap-1 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400 sm:gap-2 sm:pt-2 sm:text-xs">
            {property.bedrooms != null && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800 sm:px-2.5 sm:py-1">{property.bedrooms} bed</span>
            )}
            {property.bathrooms != null && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800 sm:px-2.5 sm:py-1">{property.bathrooms} bath</span>
            )}
            {property.land_size_sqm != null && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800 sm:px-2.5 sm:py-1">
                {Number(property.land_size_sqm).toLocaleString()} sqm
              </span>
            )}
          </div>
        </div>
      </Link>
      {viewerUserId != null && (
        <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
          <FavoriteButton
            key={property.id}
            propertyId={property.id}
            initialFavorited={initialFav}
            signedIn={signedIn}
          />
        </div>
      )}
    </div>
  );
}
