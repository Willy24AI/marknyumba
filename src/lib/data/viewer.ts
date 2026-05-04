import "server-only";

import { listFavoritePropertyIds } from "@/lib/data/favorites";
import { createClientOptional } from "@/lib/supabase/server";

/** Logged-in browser user + saved listing ids for browse UI (favorites). */
export async function getBrowseContext(): Promise<{
  userId: string | null;
  favoriteIds: Set<string>;
}> {
  const supabase = await createClientOptional();
  if (!supabase) {
    return { userId: null, favoriteIds: new Set() };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { userId: null, favoriteIds: new Set() };
  }

  const { ids } = await listFavoritePropertyIds(supabase, user.id);
  return { userId: user.id, favoriteIds: ids };
}
