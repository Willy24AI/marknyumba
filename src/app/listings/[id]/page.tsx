import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { MessageComposer } from "@/components/message-composer";
import { SellerRating } from "@/components/seller-rating";
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
import { getSellerProfile, getSellerReviewSummary, sellerDisplayName } from "@/lib/data/sellers";
import { getBrowseContext } from "@/lib/data/viewer";
import { regionLabel } from "@/lib/locations/uganda";
import { createClientOptional } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string }>;
};

type ContactKind = "phone" | "whatsapp" | "email";

type ContactAction = {
  kind: ContactKind;
  label: string;
  mobileLabel: string;
  href: string;
  external?: boolean;
};

function ContactIcon({ kind }: { kind: ContactKind }) {
  if (kind === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (kind === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5.5 19.5 6.4 16A7.5 7.5 0 1 1 9 18.2z" />
        <path d="M9.5 8.8c.2-.4.3-.4.6-.4h.4c.2 0 .4.1.5.4l.6 1.3c.1.3.1.5-.1.7l-.4.5a4.7 4.7 0 0 0 2.3 2.3l.5-.4c.2-.2.5-.2.7-.1l1.3.6c.3.1.4.3.4.5v.4c0 .3 0 .4-.4.6-.5.3-1.1.4-1.7.3-2.8-.4-5.3-2.9-5.7-5.7-.1-.6 0-1.2.3-1.7z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z" />
    </svg>
  );
}

function contactIconTone(kind: ContactKind) {
  if (kind === "whatsapp") {
    return "bg-[#25D366]/10 text-[#25D366] ring-[#25D366]/20";
  }

  if (kind === "email") {
    return "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60";
  }

  return "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60";
}

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
  const [{ data: sellerProfile }, sellerSummary] = await Promise.all([
    getSellerProfile(supabase, property.owner_id),
    getSellerReviewSummary(supabase, property.owner_id),
  ]);
  const sellerName = sellerDisplayName(sellerProfile, property.seller_name);

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
    property.seller_phone
      ? { kind: "phone", label: `Call ${property.seller_phone}`, mobileLabel: "Call", href: `tel:${property.seller_phone}` }
      : null,
    property.seller_whatsapp
      ? {
          kind: "whatsapp",
          label: `WhatsApp ${property.seller_whatsapp}`,
          mobileLabel: "WhatsApp",
          href: `https://wa.me/${property.seller_whatsapp.replace(/\D/g, "")}`,
          external: true,
        }
      : null,
    property.seller_email
      ? { kind: "email", label: `Email ${property.seller_email}`, mobileLabel: "Email", href: `mailto:${property.seller_email}` }
      : null,
  ].filter(Boolean) as ContactAction[];

  return (
    <article
      className={`mx-auto max-w-4xl flex-1 px-4 pt-8 sm:px-6 sm:py-10 ${
        contactLinks.length > 0 ? "pb-32" : "pb-8"
      }`}
    >
      <Link
        href="/listings"
        className="mb-5 inline-flex text-sm font-medium text-brand-700 hover:underline dark:text-brand-400"
      >
        Back to listings
      </Link>

      {(isOwner || isAdmin) && !property.is_published && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          This listing is hidden from public search.
        </div>
      )}

      {isOwner && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/80 px-4 py-3 dark:border-brand-900/50 dark:bg-brand-950/40">
          <p className="text-sm font-medium text-brand-950 dark:text-brand-100">You own this listing.</p>
          <Link
            href={`/dashboard/listings/${property.id}/edit`}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
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
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-900 dark:bg-brand-900/40 dark:text-brand-200">
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
            <p className="mt-3 text-2xl font-bold text-brand-800 dark:text-brand-400">
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
                    className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-900 dark:bg-brand-950 dark:text-brand-200"
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

        <Link
          href={`/sellers/${property.owner_id}`}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-brand-200 hover:bg-brand-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-brand-900 dark:hover:bg-brand-950/30"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-100 text-lg font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            {sellerProfile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sellerProfile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(sellerName)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-zinc-950 dark:text-zinc-50">{sellerName}</p>
              {sellerProfile?.seller_verified && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Verified
                </span>
              )}
            </div>
            <div className="mt-1">
              <SellerRating summary={sellerSummary} compact />
            </div>
          </div>
          <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:inline-flex">
            View profile
          </span>
        </Link>

        {(property.seller_name || contactLinks.length > 0) && (
          <div
            className={`mt-4 rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950 ${
              property.seller_name ? "" : "hidden sm:block"
            }`}
          >
            {property.seller_name && (
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{property.seller_name}</p>
            )}
            {contactLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {contactLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="hidden rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:text-brand-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 sm:inline-flex"
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
              className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
            >
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/auth/signup" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">
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
                className="inline-flex text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
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

      {contactLinks.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-16px_40px_rgba(24,24,27,0.18)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
          <div className="mx-auto flex max-w-md gap-2">
            {contactLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                aria-label={link.label}
                className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-800 shadow-sm transition active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-1 ${contactIconTone(link.kind)}`}>
                  <ContactIcon kind={link.kind} />
                </span>
                <span>{link.mobileLabel}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
