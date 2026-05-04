import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PropertyRow } from "@/types/property";

export async function listFavoritePropertyIds(
  client: SupabaseClient,
  userId: string
): Promise<{ ids: Set<string>; error: string | null }> {
  const { data, error } = await client.from("favorites").select("property_id").eq("user_id", userId);

  if (error) return { ids: new Set(), error: error.message };
  const ids = new Set((data ?? []).map((r: { property_id: string }) => r.property_id));
  return { ids, error: null };
}

export async function isFavorite(
  client: SupabaseClient,
  userId: string,
  propertyId: string
): Promise<boolean> {
  const { data } = await client
    .from("favorites")
    .select("property_id")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .maybeSingle();

  return !!data;
}

export async function addFavorite(
  client: SupabaseClient,
  userId: string,
  propertyId: string
): Promise<{ error: string | null }> {
  const { error } = await client.from("favorites").insert({ user_id: userId, property_id: propertyId });
  return { error: error?.message ?? null };
}

export async function removeFavorite(
  client: SupabaseClient,
  userId: string,
  propertyId: string
): Promise<{ error: string | null }> {
  const { error } = await client.from("favorites").delete().eq("user_id", userId).eq("property_id", propertyId);
  return { error: error?.message ?? null };
}

export async function toggleFavorite(
  client: SupabaseClient,
  userId: string,
  propertyId: string
): Promise<{ favorited: boolean; error: string | null }> {
  const exists = await isFavorite(client, userId, propertyId);
  if (exists) {
    const { error } = await removeFavorite(client, userId, propertyId);
    return { favorited: false, error };
  }
  const { error } = await addFavorite(client, userId, propertyId);
  return { favorited: !error, error };
}

export async function listFavoriteProperties(
  client: SupabaseClient,
  userId: string
): Promise<{ data: PropertyRow[]; error: string | null }> {
  const { data, error } = await client
    .from("favorites")
    .select(
      `
      property_id,
      properties (
        id,
        owner_id,
        title,
        description,
        listing_type,
        property_category,
        price,
        currency,
        price_negotiable,
        rent_period,
        listing_status,
        region,
        city,
        district,
        address_line,
        bedrooms,
        bathrooms,
        parking_spaces,
        furnishing,
        land_size_sqm,
        built_size_sqm,
        image_urls,
        video_url,
        virtual_tour_url,
        amenities,
        seller_name,
        seller_phone,
        seller_whatsapp,
        seller_email,
        contact_preference,
        available_from,
        is_published,
        created_at,
        updated_at
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const rows = (data ?? []) as {
    properties: PropertyRow | PropertyRow[] | null;
  }[];

  const out: PropertyRow[] = [];
  for (const r of rows) {
    const p = r.properties;
    if (!p) continue;
    const row = Array.isArray(p) ? p[0] : p;
    if (row?.id) out.push(row);
  }

  return { data: out, error: null };
}
