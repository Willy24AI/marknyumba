import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatePropertyPayload } from "@/lib/schemas/property";
import type {
  ContactPreference,
  FurnishingStatus,
  ListingStatus,
  ListingType,
  PropertyCategory,
  PropertyRow,
  RentPeriod,
  UgandaRegion,
} from "@/types/property";

export type ListingFilters = {
  listingType?: ListingType;
  propertyCategory?: PropertyCategory;
  region?: UgandaRegion;
  city?: string;
  limit?: number;
  /** When true, only published (public browse). When false with owner scope, caller uses different query. */
  publishedOnly?: boolean;
};

export async function listPublishedProperties(
  client: SupabaseClient,
  filters: ListingFilters = {}
): Promise<{ data: PropertyRow[]; error: string | null }> {
  let query = client
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (filters.listingType) query = query.eq("listing_type", filters.listingType);
  if (filters.propertyCategory) query = query.eq("property_category", filters.propertyCategory);
  if (filters.region) query = query.eq("region", filters.region);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.limit != null) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as PropertyRow[], error: null };
}

export async function listPropertiesByOwner(
  client: SupabaseClient,
  ownerId: string
): Promise<{ data: PropertyRow[]; error: string | null }> {
  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as PropertyRow[], error: null };
}

export async function getPropertyById(
  client: SupabaseClient,
  id: string,
  viewerUserId?: string | null,
  options: { includeUnpublished?: boolean } = {}
): Promise<{ data: PropertyRow | null; error: string | null }> {
  const { data, error } = await client.from("properties").select("*").eq("id", id).maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  const row = data as PropertyRow;
  if (!row.is_published && row.owner_id !== viewerUserId && !options.includeUnpublished) {
    return { data: null, error: null };
  }
  return { data: row, error: null };
}

export async function getPropertyMeta(
  client: SupabaseClient,
  id: string
): Promise<{ title: string | null; city: string | null }> {
  const { data } = await client.from("properties").select("title, city").eq("id", id).maybeSingle();
  const row = data as { title?: string; city?: string } | null;
  return { title: row?.title ?? null, city: row?.city ?? null };
}

export async function insertProperty(
  client: SupabaseClient,
  ownerId: string,
  payload: CreatePropertyPayload
): Promise<{ data: PropertyRow | null; error: string | null }> {
  const { data, error } = await client
    .from("properties")
    .insert({
      owner_id: ownerId,
      title: payload.title,
      description: payload.description,
      listing_type: payload.listing_type,
      property_category: payload.property_category,
      price: payload.price,
      currency: payload.currency,
      price_negotiable: payload.price_negotiable,
      rent_period: payload.rent_period,
      listing_status: payload.listing_status,
      region: payload.region,
      city: payload.city,
      district: payload.district,
      address_line: payload.address_line,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      parking_spaces: payload.parking_spaces,
      furnishing: payload.furnishing,
      land_size_sqm: payload.land_size_sqm,
      built_size_sqm: payload.built_size_sqm,
      image_urls: payload.image_urls,
      video_url: payload.video_url,
      virtual_tour_url: payload.virtual_tour_url,
      amenities: payload.amenities,
      seller_name: payload.seller_name,
      seller_phone: payload.seller_phone,
      seller_whatsapp: payload.seller_whatsapp,
      seller_email: payload.seller_email,
      contact_preference: payload.contact_preference,
      available_from: payload.available_from,
      is_published: payload.is_published,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as PropertyRow, error: null };
}

export type UpdatePropertyPayload = Partial<{
  title: string;
  description: string | null;
  listing_type: ListingType;
  property_category: PropertyCategory;
  price: number;
  currency: string;
  price_negotiable: boolean;
  rent_period: RentPeriod | null;
  listing_status: ListingStatus;
  region: UgandaRegion;
  city: string;
  district: string | null;
  address_line: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  furnishing: FurnishingStatus | null;
  land_size_sqm: number | null;
  built_size_sqm: number | null;
  image_urls: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  amenities: string[];
  seller_name: string | null;
  seller_phone: string | null;
  seller_whatsapp: string | null;
  seller_email: string | null;
  contact_preference: ContactPreference;
  available_from: string | null;
  is_published: boolean;
}>;

export async function updateProperty(
  client: SupabaseClient,
  ownerId: string,
  id: string,
  patch: UpdatePropertyPayload
): Promise<{ data: PropertyRow | null; error: string | null }> {
  const { data: existing, error: fetchErr } = await client
    .from("properties")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { data: null, error: fetchErr.message };
  const row = existing as { owner_id: string } | null;
  if (!row || row.owner_id !== ownerId) {
    return { data: null, error: "Not found or access denied" };
  }

  const updateRow = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>;

  if (Object.keys(updateRow).length === 0) {
    return getPropertyById(client, id, ownerId);
  }

  const { data, error } = await client
    .from("properties")
    .update({ ...updateRow, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as PropertyRow, error: null };
}

export async function deleteProperty(
  client: SupabaseClient,
  ownerId: string,
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await client.from("properties").delete().eq("id", id).eq("owner_id", ownerId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
