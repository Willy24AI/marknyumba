import Link from "next/link";
import { ListingsGrid } from "@/components/listings-grid";
import { listPublishedProperties } from "@/lib/data/properties";
import { getBrowseContext } from "@/lib/data/viewer";
import { ugandaRegions, ugandaTownOptions } from "@/lib/locations/uganda";
import { createClientOptional } from "@/lib/supabase/server";

const quickStats = [
  { value: "24/7", label: "buyer discovery" },
  { value: "UGX", label: "local pricing" },
  { value: "4", label: "Uganda regions" },
];

const regionImages: Record<string, string> = {
  central: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80",
  eastern: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80",
  northern: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=700&q=80",
  western: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=700&q=80",
};

const locations = ugandaRegions.map((region) => ({
  href: `/listings?region=${region.value}`,
  city: region.label,
  caption: region.description,
  image: regionImages[region.value],
}));

const popularTownLinks = [
  {
    href: "/listings?city=Kampala",
    label: "Kampala",
  },
  {
    href: "/listings?city=Jinja",
    label: "Jinja",
  },
  {
    href: "/listings?city=Gulu",
    label: "Gulu",
  },
  {
    href: "/listings?city=Mbarara",
    label: "Mbarara",
  },
  {
    href: "/listings?city=Mbale",
    label: "Mbale",
  },
  {
    href: "/listings?city=Arua",
    label: "Arua",
  },
];

const trustPoints = [
  "Seller-managed listings",
  "Saved homes and land",
  "Property-specific conversations",
  "Photo-rich listing pages",
];

export default async function Home() {
  const supabase = await createClientOptional();
  const { userId, favoriteIds } = await getBrowseContext();
  const { data: featured } = supabase
    ? await listPublishedProperties(supabase, { limit: 6 })
    : { data: [] };

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85')] bg-cover bg-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.86),rgba(9,9,11,0.58),rgba(9,9,11,0.2))]" />
        <div className="relative mx-auto grid max-w-7xl gap-5 px-4 pb-5 pt-6 sm:min-h-[680px] sm:content-end sm:gap-10 sm:px-6 sm:pb-10 sm:pt-20 lg:grid-cols-[1.05fr_0.75fr] lg:items-end lg:px-8 lg:pb-16">
          <div className="max-w-3xl">
            <p className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-brand-100 backdrop-blur sm:inline-flex">
              Uganda real estate marketplace
            </p>
            <h1 className="max-w-sm text-3xl font-semibold tracking-tight sm:mt-5 sm:max-w-none sm:text-6xl">
              Find property in Uganda.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-100 sm:hidden">
              Homes, rentals, land, and commercial spaces across Uganda.
            </p>
            <p className="mt-5 hidden max-w-2xl text-lg leading-8 text-zinc-100 sm:block">
              Mark Nyumba brings homes, rentals, land, and commercial spaces into one focused marketplace for
              Ugandan buyers, tenants, sellers, and landlords.
            </p>
            <div className="mt-5 hidden flex-col gap-3 sm:mt-8 sm:flex sm:flex-row">
              <Link
                href="/listings"
                className="inline-flex justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition hover:bg-brand-50"
              >
                Browse listings
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                List property
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/95 p-3 shadow-2xl shadow-black/30 backdrop-blur dark:bg-zinc-950/90 sm:p-4">
            <form action="/listings" method="get" className="grid gap-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label htmlFor="home-listing" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                    Goal
                  </label>
                  <select
                    id="home-listing"
                    name="listing_type"
                    defaultValue=""
                    className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 sm:min-h-12 sm:px-4"
                  >
                    <option value="">Buy or rent</option>
                    <option value="sale">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="home-region" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                    Region
                  </label>
                  <select
                    id="home-region"
                    name="region"
                    defaultValue=""
                    className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 sm:min-h-12 sm:px-4"
                  >
                    <option value="">All Uganda</option>
                    {ugandaRegions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="home-city" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                    Town / area
                  </label>
                  <input
                    id="home-city"
                    name="city"
                    type="search"
                    placeholder="Kampala, Gulu, Mbarara"
                    list="home-uganda-town-options"
                    className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 sm:min-h-12 sm:px-4"
                  />
                  <datalist id="home-uganda-town-options">
                    {ugandaTownOptions.map((town) => (
                      <option key={town} value={town} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="home-type" className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                    Type
                  </label>
                  <select
                    id="home-type"
                    name="property_category"
                    className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 sm:min-h-12 sm:px-4"
                  >
                    <option value="">Any property</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="min-h-11 rounded-2xl bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 sm:min-h-12"
              >
                Search property
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:block">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {quickStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-brand-700 dark:text-brand-400">{stat.value}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-100/70 py-7 dark:bg-zinc-950 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="hidden text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400 sm:block">
                Featured listings
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:mt-2 sm:text-3xl">
                Latest listings
              </h2>
            </div>
            <Link href="/listings?limit=24" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
              View all
            </Link>
          </div>

          <div className="mt-5 sm:mt-8">
            <ListingsGrid
              properties={featured}
              emptyMessage="Listings will appear here once sellers publish properties."
              viewerUserId={userId ?? undefined}
              favoriteIds={favoriteIds}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto hidden w-full max-w-7xl px-4 py-8 sm:block sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="hidden text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400 sm:block">
              Nationwide coverage
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:mt-2 sm:text-3xl">
              Browse by region
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTownLinks.map((town) => (
              <Link
                key={town.label}
                href={town.href}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800"
              >
                {town.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
          {locations.map((location) => (
            <Link
              key={location.city}
              href={location.href}
              className="group relative min-h-36 overflow-hidden rounded-3xl bg-zinc-900 text-white shadow-sm sm:min-h-72"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={location.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative flex min-h-36 flex-col justify-end p-4 sm:min-h-72 sm:p-6">
                <p className="text-xl font-semibold sm:text-2xl">{location.city}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-100 sm:mt-2 sm:text-sm">{location.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="hidden border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:block">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
              Built for trust
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              A clearer path from search to contact.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Search by location and property type, scan key details quickly, save the listings that matter,
              then contact the seller from the property page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto hidden w-full max-w-7xl px-4 py-16 sm:block sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-2xl shadow-zinc-300/30 dark:shadow-black/40">
          <div className="grid gap-8 p-8 md:grid-cols-[1fr_0.75fr] md:p-10 lg:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">For property owners</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Publish a listing, upload photos, and manage buyer conversations.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                Sellers get a dashboard for property details, photos, live listing previews, and direct messages
                from serious buyers or tenants.
              </p>
            </div>
            <div className="flex flex-col justify-end gap-3 sm:flex-row md:flex-col">
              <Link
                href="/dashboard/listings/new"
                className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-brand-50"
              >
                Create listing
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
