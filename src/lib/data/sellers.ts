import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PropertyRow } from "@/types/property";
import type { SellerProfile, SellerReport, SellerReview, SellerReviewSummary } from "@/types/seller";

export function sellerDisplayName(profile: SellerProfile | null | undefined, fallback?: string | null) {
  return profile?.seller_business_name || profile?.full_name || fallback || "Property seller";
}

export async function getSellerProfile(
  client: SupabaseClient,
  sellerId: string
): Promise<{ data: SellerProfile | null; error: string | null }> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, phone, avatar_url, seller_business_name, seller_bio, seller_location, seller_verified, created_at")
    .eq("id", sellerId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: (data as SellerProfile | null) ?? null, error: null };
}

export async function listPublishedPropertiesBySeller(
  client: SupabaseClient,
  sellerId: string
): Promise<{ data: PropertyRow[]; error: string | null }> {
  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("owner_id", sellerId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as PropertyRow[], error: null };
}

export async function getSellerReviewSummary(
  client: SupabaseClient,
  sellerId: string
): Promise<SellerReviewSummary> {
  const { data } = await client
    .from("seller_reviews")
    .select("rating")
    .eq("seller_id", sellerId)
    .eq("is_published", true);

  const ratings = ((data ?? []) as { rating: number }[]).map((review) => review.rating);
  if (ratings.length === 0) return { average: 0, count: 0 };
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return { average: Math.round((total / ratings.length) * 10) / 10, count: ratings.length };
}

export async function listSellerReviews(
  client: SupabaseClient,
  sellerId: string
): Promise<{ data: SellerReview[]; error: string | null }> {
  const { data, error } = await client
    .from("seller_reviews")
    .select("id, seller_id, reviewer_id, rating, body, is_published, created_at")
    .eq("seller_id", sellerId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as SellerReview[], error: null };
}

export async function upsertSellerReview(
  client: SupabaseClient,
  sellerId: string,
  reviewerId: string,
  rating: number,
  body: string | null
): Promise<{ error: string | null }> {
  const { error } = await client
    .from("seller_reviews")
    .upsert(
      {
        seller_id: sellerId,
        reviewer_id: reviewerId,
        rating,
        body,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "seller_id,reviewer_id" }
    );

  return { error: error?.message ?? null };
}

export async function insertSellerReport(
  client: SupabaseClient,
  sellerId: string,
  reporterId: string,
  reason: SellerReport["reason"],
  details: string,
  propertyId?: string | null
): Promise<{ error: string | null }> {
  const { error } = await client.from("seller_reports").insert({
    seller_id: sellerId,
    reporter_id: reporterId,
    property_id: propertyId || null,
    reason,
    details,
  });

  return { error: error?.message ?? null };
}

export async function listAdminSellerReports(
  client: SupabaseClient
): Promise<{ data: SellerReport[]; error: string | null }> {
  const { data, error } = await client
    .from("seller_reports")
    .select(
      `
      id,
      seller_id,
      reporter_id,
      property_id,
      reason,
      details,
      status,
      created_at,
      profiles!seller_reports_seller_id_fkey (
        full_name,
        email
      ),
      properties (
        id,
        title,
        city
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as SellerReport[], error: null };
}

export async function updateSellerReportStatus(
  client: SupabaseClient,
  id: string,
  status: SellerReport["status"]
): Promise<{ error: string | null }> {
  const { error } = await client
    .from("seller_reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export function parseSellerReportReason(value: FormDataEntryValue | null): SellerReport["reason"] {
  if (
    value === "fraud" ||
    value === "misleading_listing" ||
    value === "harassment" ||
    value === "unreachable" ||
    value === "other"
  ) {
    return value;
  }

  return "other";
}

export function parseSellerReportStatus(value: FormDataEntryValue | null): SellerReport["status"] {
  if (value === "reviewing" || value === "resolved" || value === "dismissed") return value;
  return "open";
}
