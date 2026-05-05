"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  insertSellerReport,
  parseSellerReportReason,
  upsertSellerReview,
} from "@/lib/data/sellers";
import { createClient } from "@/lib/supabase/server";

function sellerPath(sellerId: string, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/sellers/${sellerId}?${search.toString()}`;
}

export async function submitSellerReviewAction(formData: FormData) {
  const sellerId = String(formData.get("seller_id") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();

  if (!sellerId) redirect("/listings");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(sellerPath(sellerId, { err: "Choose a rating from 1 to 5 stars." }));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?next=${encodeURIComponent(`/sellers/${sellerId}`)}`);
  if (user.id === sellerId) {
    redirect(sellerPath(sellerId, { err: "You cannot review your own seller profile." }));
  }

  const { error } = await upsertSellerReview(supabase, sellerId, user.id, rating, body || null);
  if (error) redirect(sellerPath(sellerId, { err: error }));

  revalidatePath(`/sellers/${sellerId}`);
  redirect(sellerPath(sellerId, { reviewed: "1" }));
}

export async function reportSellerAction(formData: FormData) {
  const sellerId = String(formData.get("seller_id") ?? "").trim();
  const propertyId = String(formData.get("property_id") ?? "").trim();
  const reason = parseSellerReportReason(formData.get("reason"));
  const details = String(formData.get("details") ?? "").trim();

  if (!sellerId) redirect("/listings");
  if (details.length < 10 || details.length > 2000) {
    redirect(sellerPath(sellerId, { err: "Report details must be 10 to 2000 characters." }));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?next=${encodeURIComponent(`/sellers/${sellerId}`)}`);
  if (user.id === sellerId) {
    redirect(sellerPath(sellerId, { err: "You cannot report your own seller profile." }));
  }

  const { error } = await insertSellerReport(
    supabase,
    sellerId,
    user.id,
    reason,
    details,
    propertyId || null
  );
  if (error) redirect(sellerPath(sellerId, { err: error }));

  revalidatePath("/admin");
  revalidatePath(`/sellers/${sellerId}`);
  redirect(sellerPath(sellerId, { reported: "1" }));
}
