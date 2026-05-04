import { jsonError, jsonOk } from "@/lib/api/http";
import { listPublishedProperties, insertProperty } from "@/lib/data/properties";
import { isSupabaseConfigured } from "@/lib/env";
import { createPropertyJsonSchema, parseFiltersFromSearchParams } from "@/lib/schemas/property";
import type { CreatePropertyPayload } from "@/lib/schemas/property";
import { createClient, createClientOptional } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonError("Supabase not configured", 503);
  }

  const supabase = await createClientOptional();
  if (!supabase) {
    return jsonError("Supabase not configured", 503);
  }

  const { searchParams } = new URL(request.url);
  const paramsObj: Record<string, string | undefined> = {};
  searchParams.forEach((v, k) => {
    paramsObj[k] = v;
  });
  const filters = parseFiltersFromSearchParams(paramsObj);

  const { data, error } = await listPublishedProperties(supabase, filters);
  if (error) {
    return jsonError(error, 500);
  }

  return jsonOk({ listings: data });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonError("Supabase not configured", 503);
  }

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

  const parsed = createPropertyJsonSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, {
      issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  const payload = parsed.data as CreatePropertyPayload;
  const { data, error } = await insertProperty(supabase, user.id, payload);
  if (error) {
    return jsonError(error, 400);
  }

  return jsonOk({ listing: data }, { status: 201 });
}
