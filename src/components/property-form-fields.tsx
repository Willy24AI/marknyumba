import { PropertyImageUploader } from "@/components/property-image-uploader";
import { ugandaRegions, ugandaTownOptions } from "@/lib/locations/uganda";
import type { PropertyRow } from "@/types/property";

type Defaults = Partial<
  Pick<
    PropertyRow,
    | "title"
    | "description"
    | "listing_type"
    | "property_category"
    | "price"
    | "currency"
    | "price_negotiable"
    | "rent_period"
    | "listing_status"
    | "region"
    | "city"
    | "district"
    | "address_line"
    | "bedrooms"
    | "bathrooms"
    | "parking_spaces"
    | "furnishing"
    | "land_size_sqm"
    | "built_size_sqm"
    | "image_urls"
    | "video_url"
    | "virtual_tour_url"
    | "amenities"
    | "seller_name"
    | "seller_phone"
    | "seller_whatsapp"
    | "seller_email"
    | "contact_preference"
    | "available_from"
  >
>;

const amenityOptions = [
  "Electricity",
  "Water",
  "Security",
  "Parking",
  "Garden",
  "Balcony",
  "Servant quarter",
  "Internet",
  "Air conditioning",
  "Paved access",
  "Near main road",
  "School nearby",
  "Hospital nearby",
  "Shopping nearby",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PropertyFormFields({ defaults }: { defaults?: Defaults }) {
  const d = defaults;
  const imageText = d?.image_urls?.length ? d.image_urls.join("\n") : "";
  const selectedAmenities = new Set(d?.amenities ?? []);
  const customAmenities =
    d?.amenities?.filter((a) => !amenityOptions.includes(a)).join("\n") ?? "";

  return (
    <>
      <Section title="Listing basics">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={d?.title}
            placeholder="e.g. 3-bedroom house in Ntinda"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="listing_type" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Listing
            </label>
            <select
              id="listing_type"
              name="listing_type"
              required
              defaultValue={d?.listing_type ?? "sale"}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="sale">For sale</option>
              <option value="rent">To rent</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="property_category"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Property type
            </label>
            <select
              id="property_category"
              name="property_category"
              required
              defaultValue={d?.property_category ?? "house"}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="listing_status" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Availability
            </label>
            <select
              id="listing_status"
              name="listing_status"
              defaultValue={d?.listing_status ?? "available"}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="available">Available</option>
              <option value="under_offer">Under offer</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          <div>
            <label htmlFor="available_from" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Available from
            </label>
            <input
              id="available_from"
              name="available_from"
              type="date"
              defaultValue={d?.available_from ?? ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </Section>

      <Section title="Price">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="1"
              required
              defaultValue={d?.price != null ? String(d.price) : undefined}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="currency" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue={d?.currency ?? "UGX"}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="UGX">UGX</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label htmlFor="rent_period" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Rent period
            </label>
            <select
              id="rent_period"
              name="rent_period"
              defaultValue={d?.rent_period ?? ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Not rental</option>
              <option value="day">Per day</option>
              <option value="week">Per week</option>
              <option value="month">Per month</option>
              <option value="year">Per year</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="price_negotiable"
            defaultChecked={Boolean(d?.price_negotiable)}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-700"
          />
          Price is negotiable
        </label>
      </Section>

      <Section title="Location">
        <div>
          <label htmlFor="region" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Region
          </label>
          <select
            id="region"
            name="region"
            required
            defaultValue={d?.region ?? "central"}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {ugandaRegions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Town / area
            </label>
            <input
              id="city"
              name="city"
              required
              defaultValue={d?.city}
              placeholder="Kampala, Gulu, Mbarara"
              list="uganda-town-options"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <datalist id="uganda-town-options">
              {ugandaTownOptions.map((town) => (
                <option key={town} value={town} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="district" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              District / municipality
            </label>
            <input
              id="district"
              name="district"
              defaultValue={d?.district ?? ""}
              placeholder="e.g. Wakiso"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address_line" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Street, estate, or landmark
          </label>
          <input
            id="address_line"
            name="address_line"
            defaultValue={d?.address_line ?? ""}
            placeholder="Street, estate, or landmark"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </Section>

      <Section title="Features">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bedrooms" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={d?.bedrooms != null ? String(d.bedrooms) : ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="bathrooms" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={d?.bathrooms != null ? String(d.bathrooms) : ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="parking_spaces" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Parking spaces
            </label>
            <input
              id="parking_spaces"
              name="parking_spaces"
              type="number"
              min={0}
              defaultValue={d?.parking_spaces != null ? String(d.parking_spaces) : ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="furnishing" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Furnishing
            </label>
            <select
              id="furnishing"
              name="furnishing"
              defaultValue={d?.furnishing ?? ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Not specified</option>
              <option value="furnished">Furnished</option>
              <option value="semi_furnished">Semi-furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="built_size_sqm" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Built size (sqm)
            </label>
            <input
              id="built_size_sqm"
              name="built_size_sqm"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d?.built_size_sqm != null ? String(d.built_size_sqm) : ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="land_size_sqm" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Land size (sqm)
            </label>
            <input
              id="land_size_sqm"
              name="land_size_sqm"
              type="number"
              min={0}
              step="0.01"
              defaultValue={d?.land_size_sqm != null ? String(d.land_size_sqm) : ""}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amenities
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {amenityOptions.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  defaultChecked={selectedAmenities.has(amenity)}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-700"
                />
                {amenity}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="custom_amenities" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Other amenities
          </label>
          <textarea
            id="custom_amenities"
            name="custom_amenities"
            rows={2}
            defaultValue={customAmenities}
            placeholder="One per line, or comma-separated"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </Section>

      <Section title="Photos and media">
        <div>
          <label htmlFor="image_urls" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Images
          </label>
          <PropertyImageUploader />
          <textarea
            id="image_urls"
            name="image_urls"
            rows={3}
            defaultValue={imageText}
            placeholder="One image URL per line, or comma-separated."
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="video_url" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Video URL
            </label>
            <input
              id="video_url"
              name="video_url"
              type="url"
              defaultValue={d?.video_url ?? ""}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="virtual_tour_url" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Virtual tour URL
            </label>
            <input
              id="virtual_tour_url"
              name="virtual_tour_url"
              type="url"
              defaultValue={d?.virtual_tour_url ?? ""}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </Section>

      <Section title="Seller contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="seller_name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contact name
            </label>
            <input
              id="seller_name"
              name="seller_name"
              defaultValue={d?.seller_name ?? ""}
              placeholder="Owner or agent name"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="contact_preference" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Preferred contact
            </label>
            <select
              id="contact_preference"
              name="contact_preference"
              defaultValue={d?.contact_preference ?? "message"}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="message">Mark Nyumba messages</option>
              <option value="phone">Phone call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label htmlFor="seller_phone" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone
            </label>
            <input
              id="seller_phone"
              name="seller_phone"
              type="tel"
              defaultValue={d?.seller_phone ?? ""}
              placeholder="+256..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="seller_whatsapp" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              WhatsApp
            </label>
            <input
              id="seller_whatsapp"
              name="seller_whatsapp"
              type="tel"
              defaultValue={d?.seller_whatsapp ?? ""}
              placeholder="+256..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
        <div>
          <label htmlFor="seller_email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Contact email
          </label>
          <input
            id="seller_email"
            name="seller_email"
            type="email"
            defaultValue={d?.seller_email ?? ""}
            placeholder="seller@example.com"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </Section>

      <Section title="Description">
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={d?.description ?? ""}
            placeholder="Describe the property, neighborhood, access, utilities, terms, and anything buyers or tenants should know."
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </Section>
    </>
  );
}
