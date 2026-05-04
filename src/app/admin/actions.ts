"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import {
  deleteAdminProperty,
  getAdminUser,
  parseListingStatus,
  parseProfileRole,
  updateAdminProperty,
  updateProfileRole,
} from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAdminClient() {
  const supabase = await createClient();
  const { user, isAdmin } = await getAdminUser(supabase);
  if (!user) redirect("/auth/login?next=/admin");
  if (!isAdmin) notFound();
  return supabase;
}

function adminError(message: string): never {
  redirect(`/admin?error=${encodeURIComponent(message)}`);
}

export async function updateAdminListingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) adminError("Missing listing id.");

  const supabase = await requireAdminClient();
  const status = parseListingStatus(formData.get("listing_status"));
  const isPublished = formData.get("is_published") === "on";

  const { error } = await updateAdminProperty(supabase, id, {
    listing_status: status,
    is_published: isPublished,
  });

  if (error) adminError(error);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  redirect("/admin");
}

export async function deleteAdminListingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) adminError("Missing listing id.");

  const supabase = await requireAdminClient();
  const { error } = await deleteAdminProperty(supabase, id);
  if (error) adminError(error);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/listings");
  redirect("/admin");
}

export async function updateUserRoleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) adminError("Missing user id.");

  const supabase = await requireAdminClient();
  const role = parseProfileRole(formData.get("role"));
  const { error } = await updateProfileRole(supabase, id, role);
  if (error) adminError(error);

  revalidatePath("/admin");
  redirect("/admin");
}
