import { jsonOk, jsonError } from "@/lib/api/http";
import { isSupabaseConfigured } from "@/lib/env";
import { createClientOptional } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return jsonError("Supabase environment variables are not set", 503, {
      configured: false,
    });
  }

  const supabase = await createClientOptional();
  if (!supabase) {
    return jsonError("Could not create Supabase client", 503, { configured: true });
  }

  const { error } = await supabase.from("properties").select("id, region").limit(1);
  if (error) {
    return jsonOk({
      ok: true,
      supabase: "connected",
      database: "error",
      hint: error.message,
    });
  }

  return jsonOk({
    ok: true,
    supabase: "connected",
    database: "ok",
  });
}
