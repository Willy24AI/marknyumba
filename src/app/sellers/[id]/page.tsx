import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingsGrid } from "@/components/listings-grid";
import { SellerRating } from "@/components/seller-rating";
import { reportSellerAction, submitSellerReviewAction } from "@/app/sellers/actions";
import { getBrowseContext } from "@/lib/data/viewer";
import {
  getSellerProfile,
  getSellerReviewSummary,
  listPublishedPropertiesBySeller,
  listSellerReviews,
  sellerDisplayName,
} from "@/lib/data/sellers";
import { createClientOptional } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; reviewed?: string; reported?: string }>;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClientOptional();
  if (!supabase) return { title: "Seller | Mark Nyumba" };
  const [{ data: profile }, { data: listings }] = await Promise.all([
    getSellerProfile(supabase, id),
    listPublishedPropertiesBySeller(supabase, id),
  ]);
  const name = sellerDisplayName(profile, listings[0]?.seller_name);
  return { title: `${name} | Seller on Mark Nyumba`, description: `View ${name}'s listings and seller ratings.` };
}

export default async function SellerPage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await searchParams;
  const supabase = await createClientOptional();
  if (!supabase) notFound();

  const [
    { data: profile },
    { data: listings, error: listingError },
    summary,
    { data: reviews, error: reviewError },
    browseContext,
  ] = await Promise.all([
    getSellerProfile(supabase, id),
    listPublishedPropertiesBySeller(supabase, id),
    getSellerReviewSummary(supabase, id),
    listSellerReviews(supabase, id),
    getBrowseContext(),
  ]);

  if (!profile && listings.length === 0) notFound();

  const displayName = sellerDisplayName(profile, listings[0]?.seller_name);
  const activeLocations = Array.from(new Set(listings.map((listing) => listing.city).filter(Boolean))).slice(0, 4);
  const isOwner = browseContext.userId === id;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Link href="/listings" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
        Back to listings
      </Link>

      <section className="mt-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                  {initials(displayName)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                  {displayName}
                </h1>
                {profile?.seller_verified && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900">
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-3">
                <SellerRating summary={summary} />
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
                {profile?.seller_bio ||
                  "Seller profile for active Mark Nyumba listings. Check their properties, rating, and contact options before you proceed."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
                  {listings.length} active {listings.length === 1 ? "listing" : "listings"}
                </span>
                {profile?.seller_location && (
                  <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">{profile.seller_location}</span>
                )}
                {activeLocations.map((city) => (
                  <span key={city} className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex min-h-11 justify-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
              >
                Call seller
              </a>
            )}
            <a
              href="#seller-reviews"
              className="inline-flex min-h-11 justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Reviews
            </a>
            {!isOwner && (
              <a
                href="#report-seller"
                className="inline-flex min-h-11 justify-center rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                Report seller
              </a>
            )}
          </div>
        </div>
      </section>

      {q.err && (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {q.err}
        </p>
      )}
      {q.reviewed && (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          Your seller review has been saved.
        </p>
      )}
      {q.reported && (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          Your report has been sent to the Mark Nyumba team.
        </p>
      )}

      <section className="mt-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
              Seller inventory
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Properties from {displayName}
            </h2>
          </div>
        </div>
        {listingError ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {listingError}
          </p>
        ) : (
          <div className="mt-5">
            <ListingsGrid
              properties={listings}
              emptyMessage="This seller does not have active public listings yet."
              viewerUserId={browseContext.userId ?? undefined}
              favoriteIds={browseContext.favoriteIds}
            />
          </div>
        )}
      </section>

      <section id="seller-reviews" className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Rate this seller</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Reviews help buyers and tenants know who they are dealing with before they call or visit.
          </p>

          {isOwner ? (
            <p className="mt-4 rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              This is your seller profile.
            </p>
          ) : browseContext.userId ? (
            <form action={submitSellerReviewAction} className="mt-5 grid gap-4">
              <input type="hidden" name="seller_id" value={id} />
              <div>
                <label htmlFor="rating" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Rating
                </label>
                <select
                  id="rating"
                  name="rating"
                  defaultValue="5"
                  className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="5">5 stars - Excellent</option>
                  <option value="4">4 stars - Good</option>
                  <option value="3">3 stars - Okay</option>
                  <option value="2">2 stars - Poor</option>
                  <option value="1">1 star - Bad</option>
                </select>
              </div>
              <div>
                <label htmlFor="review-body" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Review
                </label>
                <textarea
                  id="review-body"
                  name="body"
                  rows={4}
                  maxLength={1000}
                  placeholder="Share what happened when you contacted or worked with this seller."
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
              <button
                type="submit"
                className="min-h-11 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
              >
                Save review
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href={`/auth/login?next=/sellers/${id}`} className="font-semibold text-brand-700 hover:underline">
                Sign in
              </Link>{" "}
              to rate this seller.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Reviews</h2>
            <SellerRating summary={summary} compact />
          </div>
          {reviewError ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {reviewError}
            </p>
          ) : reviews.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              No reviews yet.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800">
              {reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <SellerRating summary={{ average: review.rating, count: 1 }} compact />
                  {review.body && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {review.body}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-400">{new Date(review.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {!isOwner && (
        <section
          id="report-seller"
          className="mt-8 rounded-3xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/50 dark:bg-zinc-900 sm:p-6"
        >
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Report seller</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Use this for scams, misleading listings, harassment, unreachable sellers, or other unfair business behavior.
          </p>
          {browseContext.userId ? (
            <form action={reportSellerAction} className="mt-5 grid gap-4 sm:grid-cols-[0.7fr_1.3fr_auto] sm:items-end">
              <input type="hidden" name="seller_id" value={id} />
              <div>
                <label htmlFor="reason" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Reason
                </label>
                <select
                  id="reason"
                  name="reason"
                  className="min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="fraud">Fraud or scam</option>
                  <option value="misleading_listing">Misleading listing</option>
                  <option value="harassment">Harassment</option>
                  <option value="unreachable">Unreachable seller</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="details" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Details
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={2}
                  minLength={10}
                  maxLength={2000}
                  required
                  placeholder="Tell us what happened."
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/15 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
              <button
                type="submit"
                className="min-h-11 rounded-2xl border border-red-200 px-5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                Send report
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href={`/auth/login?next=/sellers/${id}`} className="font-semibold text-brand-700 hover:underline">
                Sign in
              </Link>{" "}
              to report this seller.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
