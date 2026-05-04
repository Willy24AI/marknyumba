import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { MessageComposer } from "@/components/message-composer";
import {
  categoryLabel,
  formatPrice,
  furnishingLabel,
  listingLabel,
  listingStatusLabel,
  rentPeriodLabel,
} from "@/lib/format";
import { getConversationForPropertyBuyer } from "@/lib/data/messages";
import { getProfileRole } from "@/lib/data/admin";
import { getPropertyById, getPropertyMeta } from "@/lib/data/properties";
import { getBrowseContext } from "@/lib/data/viewer";
import { regionLabel } from "@/lib/locations/uganda";
import { createClientOptional } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClientOptional();
  if (!supabase) return { title: "Listing | Mark Nyumba" };
  const { title, city } = await getPropertyMeta(supabase, id);
  if (!title) return { title: "Listing | Mark Nyumba" };
  return { title: `${title} | Mark Nyumba`, description: `${title} in ${city ?? "Uganda"}` };
}

export default async function ListingDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await searchParams;
  const supabase = await createClientOptional();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user ? (await getProfileRole(supabase, user.id)) === "admin" : false;
  const { data: property, error } = await getPropertyById(supabase, id, user?.id ?? null, {
    includeUnpublished: isAdmin,
  });
  if (error || !property) notFound();

  const isOwner = user?.id === property.owner_id;
  const { userId, favoriteIds } = await getBrowseContext();

  const { data: existingConv } =
    userId && !isOwner
      ? await getConversationForPropertyBuyer(supabase, id, userId)
      : { data: null };

  const images =
    property.image_urls && property.image_urls.length > 0
      ? property.image_urls
      : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"];
  const facts = [
    property.bedrooms != null ? `${property.bedrooms} bedrooms` : null,
    property.bathrooms != null ? `${property.bathrooms} bathrooms` : null,
    property.parking_spaces != null ? `${property.parking_spaces} parking` : null,
    furnishingLabel(property.furnishing),
    property.built_size_sqm != null ? `Built: ${property.built_size_sqm} sqm` : null,
    property.land_size_sqm != null ? `Land: ${property.land_size_sqm} sqm` : null,
    property.available_from ? `Available from ${property.available_from}` : null,
  ].filter(Boolean);
  const contactLinks = [
    property.seller_phone ? { label: `Call ${property.seller_phone}`, href: `tel:${property.seller_phone}` } : null,
    property.seller_whatsapp
      ? {
          label: `WhatsApp ${property.seller_whatsapp}`,
          href: `https://wa.me/${property.seller_whatsapp.replace(/\D/g, "")}`,
        }
      : null,
    property.seller_email ? { label: `Email ${property.seller_email}`, href: `mailto:${property.seller_email}` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article className="mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/listings"
        className="mb-5 inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Back to listings
      </Link>

      {(isOwner || isAdmin) && !property.is_published && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          This listing is hidden from public search.
        </div>
      )}

      {isOwner && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/40">
          <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100">You own this listing.</p>
          <Link
            href={`/dashboard/listings/${property.id}/edit`}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Edit listing
          </Link>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-0 sm:grid-cols-5">
          <div className="relative aspect-[4/3] bg-zinc-100 sm:col-span-3 sm:aspect-auto sm:min-h-[320px] dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center p-5 sm:col-span-2 sm:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
                {listingLabel(property.listing_type)}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {categoryLabel(property.property_category)}
              </span>
              {property.listing_status !== "available" && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                  {listingStatusLabel(property.listing_status)}
                </span>
              )}
            </div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="flex-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {property.title}
              </h1>
              {userId ? (
                <FavoriteButton
                  key={property.id}
                  propertyId={property.id}
                  initialFavorited={favoriteIds.has(property.id)}
                  signedIn
                />
              ) : null}
            </div>
            <p className="mt-3 text-2xl font-bold text-emerald-800 dark:text-emerald-400">
              {formatPrice(Number(property.price), property.currency)}
              {property.listing_type === "rent" && (
                <span className="text-base font-normal text-zinc-500"> / {rentPeriodLabel(property.rent_period)}</span>
              )}
              {property.price_negotiable && (
                <span className="ml-2 text-sm font-semibold text-zinc-500">negotiable</span>
              )}
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {[property.address_line, property.district, property.city, regionLabel(property.region)]
                .filter(Boolean)
                .join(" - ")}
            </p>
            {facts.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                {facts.map((fact) => (
                  <span key={fact} className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
                    {fact}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-zinc-100 p-6 sm:p-8 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {property.description || "No description provided."}
          </p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.slice(1, 5).map((url, i) => (
            <div key={i} className="aspect-video overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {(property.amenities?.length || property.video_url || property.virtual_tour_url) && (
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {property.amenities?.length ? (
            <>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Amenities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </>
          ) : null}
          {(property.video_url || property.virtual_tour_url) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {property.video_url && (
                <a
                  href={property.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                >
                  View video
                </a>
              )}
              {property.virtual_tour_url && (
                <a
                  href={property.virtual_tour_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Virtual tour
                </a>
              )}
            </div>
          )}
        </section>
      )}

      <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Contact seller</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Ask about viewings, price, or what is included. Your messages stay on Mark Nyumba.
        </p>

        {(property.seller_name || contactLinks.length > 0) && (
          <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950">
            {property.seller_name && (
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{property.seller_name}</p>
            )}
            {contactLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {contactLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {q.err && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {q.err}
          </p>
        )}

        {!userId && (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              href={`/auth/login?next=/listings/${id}`}
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/auth/signup" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
              create an account
            </Link>{" "}
            to message the seller or save this listing to favorites.
          </p>
        )}

        {userId && isOwner && (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            You are the seller. Buyers will reach you through this thread.
          </p>
        )}

        {userId && !isOwner && (
          <div className="mt-6 space-y-4">
            {existingConv ? (
              <Link
                href={`/messages/${existingConv.id}`}
                className="inline-flex text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Open full conversation
              </Link>
            ) : null}
            <MessageComposer
              conversationId={existingConv?.id}
              propertyId={existingConv ? undefined : property.id}
            />
          </div>
        )}
      </section>
    </article>
  );
}
