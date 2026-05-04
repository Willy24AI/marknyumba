"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toggleFavorite } from "@/lib/data/favorites";
import { ensureConversation, insertMessage } from "@/lib/data/messages";
import { getPropertyById } from "@/lib/data/properties";
import { createClient } from "@/lib/supabase/server";

function withErr(base: string, message: string) {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}err=${encodeURIComponent(message)}`;
}

export async function toggleFavoriteAction(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, favorited: false, error: "Sign in to save favorites." };
  }

  const { favorited, error } = await toggleFavorite(supabase, user.id, propertyId);
  if (error) {
    return { ok: false as const, favorited: !favorited, error };
  }

  revalidatePath("/favorites");
  revalidatePath("/listings");
  revalidatePath("/");
  revalidatePath(`/listings/${propertyId}`);
  return { ok: true as const, favorited, error: undefined as string | undefined };
}

export async function sendMessageAction(formData: FormData): Promise<void> {
  const body = String(formData.get("body") ?? "").trim();
  const conversationId = String(formData.get("conversation_id") ?? "").trim();
  const propertyId = String(formData.get("property_id") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  function fail(path: string, msg: string): never {
    redirect(withErr(path, msg));
  }

  if (!body || body.length > 5000) {
    if (conversationId) fail(`/messages/${conversationId}`, "Message must be 1–5000 characters.");
    if (propertyId) fail(`/listings/${propertyId}`, "Message must be 1–5000 characters.");
    fail("/messages", "Invalid message.");
  }

  if (!user) {
    const next = propertyId ? `/listings/${propertyId}` : conversationId ? `/messages/${conversationId}` : "/messages";
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  if (conversationId) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("id, buyer_id, seller_id")
      .eq("id", conversationId)
      .maybeSingle();

    const c = conv as { buyer_id: string; seller_id: string } | null;
    if (!c || (c.buyer_id !== user.id && c.seller_id !== user.id)) {
      fail(`/messages/${conversationId}`, "Conversation not found.");
    }

    const { error } = await insertMessage(supabase, conversationId, user.id, body);
    if (error) fail(`/messages/${conversationId}`, error);

    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);
    redirect(`/messages/${conversationId}`);
  }

  if (!propertyId) {
    fail("/messages", "Missing listing.");
  }

  const { data: property, error: pe } = await getPropertyById(supabase, propertyId, user.id);
  if (pe || !property) {
    fail(`/listings/${propertyId}`, "Listing not found.");
  }
  if (property.owner_id === user.id) {
    fail(`/listings/${propertyId}`, "You cannot message yourself.");
  }

  const { conversationId: cid, error: ce } = await ensureConversation(
    supabase,
    propertyId,
    user.id,
    property.owner_id
  );
  if (ce || !cid) {
    fail(`/listings/${propertyId}`, ce ?? "Could not start conversation.");
  }

  const { error: me } = await insertMessage(supabase, cid, user.id, body);
  if (me) fail(`/listings/${propertyId}`, me);

  revalidatePath("/messages");
  revalidatePath(`/messages/${cid}`);
  revalidatePath(`/listings/${propertyId}`);
  redirect(`/messages/${cid}`);
}
