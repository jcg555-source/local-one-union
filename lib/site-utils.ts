export function slugifySiteName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function composeSiteAddress(parts: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
}) {
  const street = parts.address?.trim() ?? "";
  const city = parts.city?.trim() ?? "";
  const state = parts.state?.trim() ?? "";
  const zipcode = parts.zipcode?.trim() ?? "";
  const stateZip = [state, zipcode].filter(Boolean).join(" ");
  const locality = [city, stateZip].filter(Boolean).join(", ");

  return [street, locality].filter(Boolean).join(", ");
}
