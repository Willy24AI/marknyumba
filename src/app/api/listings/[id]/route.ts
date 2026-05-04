import { jsonError, jsonOk } from "@/lib/api/http";
import { getProfileRole } from "@/lib/data/admin";
import { deleteProperty, getPropertyById, updateProperty } from "@/lib/data/properties";
import type { UpdatePropertyPayload } from "@/lib/data/properties";
import { isSupabaseConfigured } from "@/lib/env";
import { updatePropertyJsonSchema } from "@/lib/schemas/property";
import { createClient, createClientOptional } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  if (!isSupabaseConfigured()) {
    return jsonError("Supabase not configured", 503);
  }

  const { id } = await ctx.params;
  const supabase = await createClientOptional();
  if (!supabase) {
    return jsonError("Supabase not configured", 503);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user ? (await getProfileRole(supabase, user.id)) === "admin" : false;
  const { data, error } = await getPropertyById(supabase, id, user?.id ?? null, {
    includeUnpublished: isAdmin,
  });
  if (error) {
    return jsonError(error, 500);
  }
  if (!data) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ listing: data });
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!isSupabaseConfigured()) {
    return jsonError("Supabase not configured", 503);
  }

  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updatePropertyJsonSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, {
      issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  const raw = parsed.data;
  const { image_urls: urlsIn, amenities: amenitiesIn, ...rest } = raw;
  const patch: UpdatePropertyPayload = { ...rest };
  if (urlsIn !== undefined) {
    patch.image_urls =
      typeof urlsIn === "string"
        ? urlsIn
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 24)
        : urlsIn;
  }
  if (amenitiesIn !== undefined) {
    patch.amenities =
      typeof amenitiesIn === "string"
        ? amenitiesIn
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 40)
        : amenitiesIn;
  }

  const { data, error } = await updateProperty(supabase, user.id, id, patch);
  if (error) {
    const status = error === "Not found or access denied" ? 404 : 400;
    return jsonError(error, status);
  }

  return jsonOk({ listing: data });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!isSupabaseConfigured()) {
    return jsonError("Supabase not configured", 503);
  }

  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { ok, error } = await deleteProperty(supabase, user.id, id);
  if (!ok) {
    return jsonError(error ?? "Delete failed", 400);
  }

  return new Response(null, { status: 204 });
}
