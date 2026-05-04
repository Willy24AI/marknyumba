import { z } from "zod";
import type { ListingType, PropertyCategory, UgandaRegion } from "@/types/property";

export const listingTypeSchema = z.enum(["sale", "rent"]);
export const propertyCategorySchema = z.enum([
  "house",
  "apartment",
  "land",
  "commercial",
  "other",
]);
export const ugandaRegionSchema = z.enum(["central", "eastern", "northern", "western"]);
export const listingStatusSchema = z.enum(["available", "under_offer", "sold", "rented"]);
export const rentPeriodSchema = z.enum(["day", "week", "month", "year"]);
export const furnishingSchema = z.enum(["furnished", "semi_furnished", "unfurnished"]);
export const contactPreferenceSchema = z.enum(["message", "phone", "whatsapp", "email"]);

function emptyToNull(s: string | undefined | null) {
  if (s == null || s.trim() === "") return null;
  return s.trim();
}

const nullableInt = z.preprocess((v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}, z.number().int().min(0).nullable());

const nullableDecimal = z.preprocess((v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}, z.number().nonnegative().nullable());

const nullableUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((s) => emptyToNull(s));

function splitTextList(value: string) {
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniqueList(values: string[], limit = 40) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean))).slice(0, limit);
}

export const createPropertyPayloadSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z
    .string()
    .max(10000)
    .optional()
    .transform((s) => emptyToNull(s ?? "")),
  listing_type: listingTypeSchema,
  property_category: propertyCategorySchema,
  price: z.coerce.number().nonnegative("Price must be zero or positive"),
  currency: z.string().trim().min(1).max(10).default("UGX"),
  price_negotiable: z.boolean().default(false),
  rent_period: rentPeriodSchema.nullable().default(null),
  listing_status: listingStatusSchema.default("available"),
  region: ugandaRegionSchema,
  city: z.string().trim().min(1, "City is required").max(120),
  district: z
    .string()
    .max(120)
    .optional()
    .transform((s) => emptyToNull(s)),
  address_line: z
    .string()
    .max(300)
    .optional()
    .transform((s) => emptyToNull(s)),
  bedrooms: nullableInt,
  bathrooms: nullableInt,
  parking_spaces: nullableInt,
  furnishing: furnishingSchema.nullable().default(null),
  land_size_sqm: nullableDecimal,
  built_size_sqm: nullableDecimal,
  image_urls: z.array(z.string().max(2048)).max(24).default([]),
  video_url: nullableUrl,
  virtual_tour_url: nullableUrl,
  amenities: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
  seller_name: z
    .string()
    .max(120)
    .optional()
    .transform((s) => emptyToNull(s)),
  seller_phone: z
    .string()
    .max(40)
    .optional()
    .transform((s) => emptyToNull(s)),
  seller_whatsapp: z
    .string()
    .max(40)
    .optional()
    .transform((s) => emptyToNull(s)),
  seller_email: z
    .string()
    .email("Seller email must be valid")
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((s) => emptyToNull(s)),
  contact_preference: contactPreferenceSchema.default("message"),
  available_from: z
    .string()
    .max(40)
    .optional()
    .transform((s) => emptyToNull(s)),
  is_published: z.boolean().default(true),
});

export type CreatePropertyPayload = z.infer<typeof createPropertyPayloadSchema>;

export const createPropertyJsonSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(10000).nullable().optional(),
    listing_type: listingTypeSchema,
    property_category: propertyCategorySchema,
    price: z.number().nonnegative(),
    currency: z.string().trim().min(1).max(10).default("UGX"),
    price_negotiable: z.boolean().optional(),
    rent_period: rentPeriodSchema.nullable().optional(),
    listing_status: listingStatusSchema.optional(),
    region: ugandaRegionSchema,
    city: z.string().trim().min(1).max(120),
    district: z.string().max(120).nullable().optional(),
    address_line: z.string().max(300).nullable().optional(),
    bedrooms: z.number().int().min(0).nullable().optional(),
    bathrooms: z.number().int().min(0).nullable().optional(),
    parking_spaces: z.number().int().min(0).nullable().optional(),
    furnishing: furnishingSchema.nullable().optional(),
    land_size_sqm: z.number().nonnegative().nullable().optional(),
    built_size_sqm: z.number().nonnegative().nullable().optional(),
    image_urls: z.union([z.array(z.string().max(2048)).max(24), z.string()]).optional(),
    video_url: z.string().max(2048).nullable().optional(),
    virtual_tour_url: z.string().max(2048).nullable().optional(),
    amenities: z.union([z.array(z.string().trim().min(1).max(80)).max(40), z.string()]).optional(),
    seller_name: z.string().max(120).nullable().optional(),
    seller_phone: z.string().max(40).nullable().optional(),
    seller_whatsapp: z.string().max(40).nullable().optional(),
    seller_email: z.string().email().max(200).nullable().optional(),
    contact_preference: contactPreferenceSchema.optional(),
    available_from: z.string().max(40).nullable().optional(),
    is_published: z.boolean().optional(),
  })
  .transform((data) => {
    const urls = data.image_urls;
    const image_urls =
      typeof urls === "string"
        ? urls
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 24)
        : (urls ?? []);
    const amenities =
      typeof data.amenities === "string"
        ? uniqueList(splitTextList(data.amenities))
        : uniqueList(data.amenities ?? []);
    return {
      ...data,
      description: data.description ?? null,
      district: data.district ?? null,
      address_line: data.address_line ?? null,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      parking_spaces: data.parking_spaces ?? null,
      furnishing: data.furnishing ?? null,
      land_size_sqm: data.land_size_sqm ?? null,
      built_size_sqm: data.built_size_sqm ?? null,
      image_urls,
      video_url: data.video_url ?? null,
      virtual_tour_url: data.virtual_tour_url ?? null,
      amenities,
      seller_name: data.seller_name ?? null,
      seller_phone: data.seller_phone ?? null,
      seller_whatsapp: data.seller_whatsapp ?? null,
      seller_email: data.seller_email ?? null,
      price_negotiable: data.price_negotiable ?? false,
      rent_period: data.rent_period ?? null,
      listing_status: data.listing_status ?? "available",
      contact_preference: data.contact_preference ?? "message",
      available_from: data.available_from ?? null,
      is_published: data.is_published ?? true,
    };
  });

export const updatePropertyJsonSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(10000).nullable().optional(),
  listing_type: listingTypeSchema.optional(),
  property_category: propertyCategorySchema.optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().trim().min(1).max(10).optional(),
  price_negotiable: z.boolean().optional(),
  rent_period: rentPeriodSchema.nullable().optional(),
  listing_status: listingStatusSchema.optional(),
  region: ugandaRegionSchema.optional(),
  city: z.string().trim().min(1).max(120).optional(),
  district: z.string().max(120).nullable().optional(),
  address_line: z.string().max(300).nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  parking_spaces: z.number().int().min(0).nullable().optional(),
  furnishing: furnishingSchema.nullable().optional(),
  land_size_sqm: z.number().nonnegative().nullable().optional(),
  built_size_sqm: z.number().nonnegative().nullable().optional(),
  image_urls: z.union([z.array(z.string().max(2048)).max(24), z.string()]).optional(),
  video_url: z.string().max(2048).nullable().optional(),
  virtual_tour_url: z.string().max(2048).nullable().optional(),
  amenities: z.union([z.array(z.string().trim().min(1).max(80)).max(40), z.string()]).optional(),
  seller_name: z.string().max(120).nullable().optional(),
  seller_phone: z.string().max(40).nullable().optional(),
  seller_whatsapp: z.string().max(40).nullable().optional(),
  seller_email: z.string().email().max(200).nullable().optional(),
  contact_preference: contactPreferenceSchema.optional(),
  available_from: z.string().max(40).nullable().optional(),
  is_published: z.boolean().optional(),
});

export function parseCreatePropertyFromFormData(formData: FormData): {
  ok: true;
  data: CreatePropertyPayload;
} | { ok: false; error: string } {
  const imageUrlsRaw = String(formData.get("image_urls") ?? "").trim();
  const image_urls = imageUrlsRaw ? uniqueList(splitTextList(imageUrlsRaw), 24) : [];
  const selectedAmenities = formData.getAll("amenities").map(String);
  const customAmenities = splitTextList(String(formData.get("custom_amenities") ?? ""));

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    listing_type: formData.get("listing_type"),
    property_category: formData.get("property_category"),
    price: formData.get("price"),
    currency: formData.get("currency") ?? "UGX",
    price_negotiable: formData.get("price_negotiable") === "on",
    rent_period: emptyToNull(String(formData.get("rent_period") ?? "")),
    listing_status: formData.get("listing_status") ?? "available",
    region: formData.get("region"),
    city: formData.get("city"),
    district: formData.get("district"),
    address_line: formData.get("address_line"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    parking_spaces: formData.get("parking_spaces"),
    furnishing: emptyToNull(String(formData.get("furnishing") ?? "")),
    land_size_sqm: formData.get("land_size_sqm"),
    built_size_sqm: formData.get("built_size_sqm"),
    image_urls,
    video_url: formData.get("video_url"),
    virtual_tour_url: formData.get("virtual_tour_url"),
    amenities: uniqueList([...selectedAmenities, ...customAmenities]),
    seller_name: formData.get("seller_name"),
    seller_phone: formData.get("seller_phone"),
    seller_whatsapp: formData.get("seller_whatsapp"),
    seller_email: formData.get("seller_email"),
    contact_preference: formData.get("contact_preference") ?? "message",
    available_from: formData.get("available_from"),
    is_published: formData.get("is_published") === "on",
  };

  const result = createPropertyPayloadSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join("; ") || "Invalid input";
    return { ok: false, error: msg };
  }
  return { ok: true, data: result.data };
}

export function parseFiltersFromSearchParams(
  params: Record<string, string | string[] | undefined>
): {
  listingType?: ListingType;
  propertyCategory?: PropertyCategory;
  region?: UgandaRegion;
  city?: string;
  limit?: number;
} {
  const listing_type = typeof params.listing_type === "string" ? params.listing_type : undefined;
  const property_category =
    typeof params.property_category === "string" ? params.property_category : undefined;
  const region = typeof params.region === "string" ? params.region : undefined;
  const city = typeof params.city === "string" ? params.city.trim() || undefined : undefined;
  const limitRaw = typeof params.limit === "string" ? Number(params.limit) : undefined;

  const listingType =
    listing_type === "sale" || listing_type === "rent" ? listing_type : undefined;
  const cats: PropertyCategory[] = ["house", "apartment", "land", "commercial", "other"];
  const propertyCategory =
    property_category && cats.includes(property_category as PropertyCategory)
      ? (property_category as PropertyCategory)
      : undefined;
  const regions: UgandaRegion[] = ["central", "eastern", "northern", "western"];
  const parsedRegion = region && regions.includes(region as UgandaRegion) ? (region as UgandaRegion) : undefined;
  const limit =
    limitRaw != null && Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100
      ? Math.floor(limitRaw)
      : undefined;

  return { listingType, propertyCategory, region: parsedRegion, city, limit };
}
