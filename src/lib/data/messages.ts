import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationRow, ConversationWithProperty, MessageRow } from "@/types/social";

export async function getConversationForPropertyBuyer(
  client: SupabaseClient,
  propertyId: string,
  buyerId: string
): Promise<{ data: ConversationRow | null; error: string | null }> {
  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("property_id", propertyId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as ConversationRow | null, error: null };
}

export async function createConversation(
  client: SupabaseClient,
  propertyId: string,
  buyerId: string,
  sellerId: string
): Promise<{ data: ConversationRow | null; error: string | null }> {
  const { data, error } = await client
    .from("conversations")
    .insert({
      property_id: propertyId,
      buyer_id: buyerId,
      seller_id: sellerId,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ConversationRow, error: null };
}

export async function insertMessage(
  client: SupabaseClient,
  conversationId: string,
  senderId: string,
  body: string
): Promise<{ data: MessageRow | null; error: string | null }> {
  const trimmed = body.trim();
  if (!trimmed) return { data: null, error: "Message cannot be empty" };

  const { data, error } = await client
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: trimmed,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as MessageRow, error: null };
}

/** Get or create conversation; returns conversation id. */
export async function ensureConversation(
  client: SupabaseClient,
  propertyId: string,
  buyerId: string,
  sellerId: string
): Promise<{ conversationId: string | null; error: string | null }> {
  if (buyerId === sellerId) {
    return { conversationId: null, error: "Cannot message yourself" };
  }

  const existing = await getConversationForPropertyBuyer(client, propertyId, buyerId);
  if (existing.error) return { conversationId: null, error: existing.error };
  if (existing.data) return { conversationId: existing.data.id, error: null };

  const created = await createConversation(client, propertyId, buyerId, sellerId);
  if (created.error) return { conversationId: null, error: created.error };
  return { conversationId: created.data?.id ?? null, error: null };
}

export async function listMessages(
  client: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<{ data: MessageRow[]; error: string | null }> {
  const { data: conv, error: ce } = await client
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (ce) return { data: [], error: ce.message };
  const c = conv as { buyer_id: string; seller_id: string } | null;
  if (!c || (c.buyer_id !== userId && c.seller_id !== userId)) {
    return { data: [], error: "Not found" };
  }

  const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as MessageRow[], error: null };
}

export async function listConversationsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: ConversationWithProperty[]; error: string | null }> {
  const { data, error } = await client
    .from("conversations")
    .select(
      `
      id,
      property_id,
      buyer_id,
      seller_id,
      created_at,
      updated_at,
      properties (
        id,
        title,
        image_urls,
        city
      )
    `
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as ConversationWithProperty[], error: null };
}

export async function getConversationById(
  client: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<{ data: ConversationWithProperty | null; error: string | null }> {
  const { data, error } = await client
    .from("conversations")
    .select(
      `
      id,
      property_id,
      buyer_id,
      seller_id,
      created_at,
      updated_at,
      properties (
        id,
        title,
        image_urls,
        city
      )
    `
    )
    .eq("id", conversationId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  const row = data as unknown as ConversationWithProperty | null;
  if (!row || (row.buyer_id !== userId && row.seller_id !== userId)) {
    return { data: null, error: null };
  }
  return { data: row, error: null };
}
