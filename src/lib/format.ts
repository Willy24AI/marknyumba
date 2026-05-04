export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: currency === "UGX" ? "UGX" : currency,
      maximumFractionDigits: currency === "UGX" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function listingLabel(listingType: "sale" | "rent") {
  return listingType === "sale" ? "For sale" : "To rent";
}

export function categoryLabel(c: string) {
  const map: Record<string, string> = {
    house: "House",
    apartment: "Apartment",
    land: "Land",
    commercial: "Commercial",
    other: "Other",
  };
  return map[c] ?? c;
}

export function listingStatusLabel(status: string) {
  const map: Record<string, string> = {
    available: "Available",
    under_offer: "Under offer",
    sold: "Sold",
    rented: "Rented",
  };
  return map[status] ?? status;
}

export function rentPeriodLabel(period: string | null | undefined) {
  const map: Record<string, string> = {
    day: "day",
    week: "week",
    month: "month",
    year: "year",
  };
  return period ? map[period] ?? period : "month";
}

export function furnishingLabel(value: string | null | undefined) {
  const map: Record<string, string> = {
    furnished: "Furnished",
    semi_furnished: "Semi-furnished",
    unfurnished: "Unfurnished",
  };
  return value ? map[value] ?? value : null;
}
