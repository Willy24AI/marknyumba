export type ConversationRow = {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ConversationWithProperty = ConversationRow & {
  properties: {
    id: string;
    title: string;
    image_urls: string[] | null;
    city: string;
  } | null;
};
