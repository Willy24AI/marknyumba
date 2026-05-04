import type { Metadata } from "next";
import Link from "next/link";
import { ListingsGrid } from "@/components/listings-grid";
import { listPublishedProperties } from "@/lib/data/properties";
import { getBrowseContext } from "@/lib/data/viewer";
import { ugandaRegions, ugandaTownOptions } from "@/lib/locations/uganda";
import { createClientOptional } from "@/lib/supabase/server";
import type { ListingType, PropertyCategory, PropertyRow, UgandaRegion } from "@/types/property";

export const metadata: Metadata = {
  title: "Browse listings | Mark Nyumba",
  description: "Houses, apartments, land, and commercial property for sale and rent in Uganda.",
};

const listingOptions: { value: ListingType | ""; label: string }[] = [
  { value: "", label: "Sale or rent" },
  { value: "sale", label: "For sale" },
  { value: "rent", label: "To rent" },
];

const categoryOptions: { value: PropertyCategory | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

type Search = {
  listing_type?: string;
  property_category?: string;
  region?: string;
  city?: string;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const q = await searchParams;
  const listingType = q.listing_type === "sale" || q.listing_type === "rent" ? q.listing_type : undefined;
  const category =
    q.property_category &&
    ["house", "apartment", "land", "commercial", "other"].includes(q.property_category)
      ? (q.property_category as PropertyCategory)
      : undefined;
  const region =
    q.region && ["central", "eastern", "northern", "western"].includes(q.region)
      ? (q.region as UgandaRegion)
      : undefined;
  const cityFilter = q.city?.trim() || undefined;

  const { userId, favoriteIds } = await getBrowseContext();
  const supabase = await createClientOptional();
  const { data: properties, error: listError } = supabase
    ? await listPublishedProperties(supabase, {
        listingType,
        propertyCategory: category,
        region,
        city: cityFilter,
      })
    : { data: [] as PropertyRow[], error: null as string | null };

  const buildHref = (overrides: Partial<Search>) => {
    const p = new URLSearchParams();
    const merged = { ...q, ...overrides };
    if (merged.listing_type) p.set("listing_type", merged.listing_type);
    if (merged.property_category) p.set("property_category", merged.property_category);
    if (merged.region) p.set("region", merged.region);
    if (merged.city) p.set("city", merged.city);
    const s = p.toString();
    return s ? `/listings?${s}` : "/listings";
  };

  const activeFilters = [listingType, category, region, cityFilter].filter(Boolean).length;

  return (
    <main className="flex-1">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid gap-4 sm:gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="hidden text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 sm:block">
                Property search
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:mt-2 sm:text-4xl">
                Browse listings
              </h1>
              <p className="mt-2 hidden max-w-2xl text-zinc-600 dark:text-zinc-400 sm:block">
                Filter homes, rentals, land, and commercial listings by deal type, category, and location.
              </p>
            </div>
            <form
              className="grid grid-cols-2 gap-2 rounded-3xl border border-zinc-200 bg-zinc-50 p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:gap-3 sm:p-3 lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto]"
              action="/listings"
              method="get"
            >
              <div>
                <label htmlFor="listing_type" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                  Listing
                </label>
                <select
                  id="listing_type"
                  name="listing_type"
                  defaultValue={listingType ?? ""}
                  className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:min-h-12"
                >
                  {listingOptions.map((o) => (
                    <option key={o.label} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="property_category" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                  Type
                </label>
                <select
                  id="property_category"
                  name="property_category"
                  defaultValue={category ?? ""}
                  className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:min-h-12"
                >
                  {categoryOptions.map((o) => (
                    <option key={o.label} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="region" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                  Region
                </label>
                <select
                  id="region"
                  name="region"
                  defaultValue={region ?? ""}
                  className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:min-h-12"
                >
                  <option value="">All Uganda</option>
                  {ugandaRegions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                  Town / area
                </label>
                <input
                  id="city"
                  name="city"
                  type="search"
                  placeholder="Kampala"
                  defaultValue={cityFilter ?? ""}
                  list="listings-uganda-town-options"
                  className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:min-h-12"
                />
                <datalist id="listings-uganda-town-options">
                  {ugandaTownOptions.map((town) => (
                    <option key={town} value={town} />
                  ))}
                </datalist>
              </div>
              <div className="col-span-2 flex items-end gap-2 lg:col-span-1">
                <button
                  type="submit"
                  className="min-h-11 flex-1 rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:min-h-12"
                >
                  Search
                </button>
                <Link
                  href="/listings"
                  className="inline-flex min-h-11 items-center rounded-2xl border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:min-h-12"
                >
                  Clear
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {properties.length} {properties.length === 1 ? "listing" : "listings"}
              {activeFilters > 0 ? " matching your search" : " available"}
            </p>
            <p className="mt-1 hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
              Save listings when signed in, then contact sellers from the listing detail page.
            </p>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <Link className="rounded-full bg-white px-3 py-1.5 font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:text-emerald-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800" href={buildHref({ listing_type: "sale", property_category: "" })}>
              For sale
            </Link>
            <Link className="rounded-full bg-white px-3 py-1.5 font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:text-emerald-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800" href={buildHref({ listing_type: "rent", property_category: "" })}>
              Rentals
            </Link>
            <Link className="rounded-full bg-white px-3 py-1.5 font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:text-emerald-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800" href={buildHref({ property_category: "land", listing_type: "sale" })}>
              Land
            </Link>
          </div>
        </div>

        {listError && (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {listError}
          </p>
        )}

        <ListingsGrid
          properties={properties}
          emptyMessage={
            supabase
              ? "No published listings match this search yet."
              : "No listings are available yet."
          }
          viewerUserId={userId ?? undefined}
          favoriteIds={favoriteIds}
        />
      </section>
    </main>
  );
}
