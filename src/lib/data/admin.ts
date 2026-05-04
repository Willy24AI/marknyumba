import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ProfileRole, ProfileRow } from "@/types/admin";
import type { ListingStatus, PropertyRow } from "@/types/property";

export async function getProfileRole(
  client: SupabaseClient,
  userId: string
): Promise<ProfileRole> {
  const { data } = await client.from("profiles").select("role").eq("id", userId).maybeSingle();
  const role = (data as { role?: ProfileRole } | null)?.role;
  return role === "admin" ? "admin" : "user";
}

export async function getAdminUser(
  client: SupabaseClient
): Promise<{ user: User | null; isAdmin: boolean }> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { user: null, isAdmin: false };
  const role = await getProfileRole(client, user.id);
  return { user, isAdmin: role === "admin" };
}

export async function listAdminProperties(
  client: SupabaseClient
): Promise<{ data: PropertyRow[]; error: string | null }> {
  const { data, error } = await client
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as PropertyRow[], error: null };
}

export async function listAdminProfiles(
  client: SupabaseClient
): Promise<{ data: ProfileRow[]; error: string | null }> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as ProfileRow[], error: null };
}

export async function updateAdminProperty(
  client: SupabaseClient,
  id: string,
  patch: Partial<Pick<PropertyRow, "is_published" | "listing_status">>
): Promise<{ error: string | null }> {
  const { error } = await client
    .from("properties")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function deleteAdminProperty(
  client: SupabaseClient,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await client.from("properties").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateProfileRole(
  client: SupabaseClient,
  id: string,
  role: ProfileRole
): Promise<{ error: string | null }> {
  const { error } = await client
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export function parseListingStatus(value: FormDataEntryValue | null): ListingStatus {
  return value === "under_offer" || value === "sold" || value === "rented" ? value : "available";
}

export function parseProfileRole(value: FormDataEntryValue | null): ProfileRole {
  return value === "admin" ? "admin" : "user";
}
