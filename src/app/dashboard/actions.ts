"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteProperty, insertProperty, updateProperty } from "@/lib/data/properties";
import { parseCreatePropertyFromFormData } from "@/lib/schemas/property";
import { createClient } from "@/lib/supabase/server";

function cleanNullableText(value: FormDataEntryValue | null, maxLength: number) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/dashboard/listings/new");

  const parsed = parseCreatePropertyFromFormData(formData);
  if (!parsed.ok) {
    redirect(`/dashboard/listings/new?error=${encodeURIComponent(parsed.error)}`);
  }

  const { error } = await insertProperty(supabase, user.id, parsed.data);
  if (error) {
    redirect(`/dashboard/listings/new?error=${encodeURIComponent(error)}`);
  }

  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updatePropertyAction(formData: FormData) {
  const id = String(formData.get("property_id") ?? "").trim();
  if (!id) {
    redirect("/dashboard?error=missing-id");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const parsed = parseCreatePropertyFromFormData(formData);
  if (!parsed.ok) {
    redirect(`/dashboard/listings/${id}/edit?error=${encodeURIComponent(parsed.error)}`);
  }

  const payload = parsed.data;
  const { error } = await updateProperty(supabase, user.id, id, {
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
  });

  if (error) {
    redirect(`/dashboard/listings/${id}/edit?error=${encodeURIComponent(error)}`);
  }

  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/dashboard");
  revalidatePath(`/listings/${id}`);
  redirect("/dashboard");
}

export async function deletePropertyAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { ok, error } = await deleteProperty(supabase, user.id, id);
  if (!ok) {
    redirect(`/dashboard?error=${encodeURIComponent(error ?? "delete-failed")}`);
  }

  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateSellerProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/dashboard");

  const patch = {
    full_name: cleanNullableText(formData.get("full_name"), 120),
    phone: cleanNullableText(formData.get("phone"), 40),
    avatar_url: cleanNullableText(formData.get("avatar_url"), 500),
    seller_business_name: cleanNullableText(formData.get("seller_business_name"), 160),
    seller_location: cleanNullableText(formData.get("seller_location"), 160),
    seller_bio: cleanNullableText(formData.get("seller_bio"), 1000),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard");
  revalidatePath(`/sellers/${user.id}`);
  redirect("/dashboard?sellerProfile=updated");
}
