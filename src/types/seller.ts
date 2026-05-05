import type { PropertyRow } from "@/types/property";

export type SellerProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  seller_business_name: string | null;
  seller_bio: string | null;
  seller_location: string | null;
  seller_verified: boolean;
  created_at: string;
};

export type SellerReview = {
  id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  body: string | null;
  is_published: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type SellerReport = {
  id: string;
  seller_id: string;
  reporter_id: string;
  property_id: string | null;
  reason: "fraud" | "misleading_listing" | "harassment" | "unreachable" | "other";
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
  profiles?:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
  properties?:
    | Pick<PropertyRow, "id" | "title" | "city">
    | Pick<PropertyRow, "id" | "title" | "city">[]
    | null;
};

export type SellerReviewSummary = {
  average: number;
  count: number;
};
