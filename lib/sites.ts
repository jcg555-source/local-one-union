import { Site, sites as fallbackSites } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { composeSiteAddress } from "@/lib/site-utils";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

type SupabaseSiteRow = {
  id: string;
  name: string | null;
  slug: string | null;
  employer: string | null;
  visibility: "public" | "member" | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  intro: string | null;
  representative: string | null;
  lat: number | null;
  lng: number | null;
  archived: boolean | null;
  is_active: boolean | null;
};

type SupabaseContractRow = {
  id: string;
  site_id: string | null;
  title: string | null;
  file_url: string | null;
  effective_date: string | null;
  expiration_date: string | null;
};

type SiteCollectionResult = {
  error?: string;
  sites: Site[];
  source: "supabase" | "fallback";
};

type SiteDetailResult = {
  error?: string;
  restricted?: boolean;
  site: Site | null;
  source: "supabase" | "fallback";
};

const fallbackSiteBySlug = new Map(
  fallbackSites.map((site) => [site.slug, site] as const)
);
const siteSlugAliases = new Map<string, string>([
  ["nyu-langone-health", "nyu-langone"]
]);

function resolveSiteSlugAlias(slug: string) {
  return siteSlugAliases.get(slug) ?? slug;
}

function logSiteLookup(message: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[Local One Sites] ${message}`, details);
  }
}

function mapSupabaseSite(row: SupabaseSiteRow): Site | null {
  const slug = row.slug?.trim();
  if (!slug) {
    return null;
  }

  const fallback = fallbackSiteBySlug.get(slug);
  const latitude = row.lat ?? fallback?.latitude ?? null;
  const longitude = row.lng ?? fallback?.longitude ?? null;
  const streetAddress = row.address?.trim() || fallback?.streetAddress || "";
  const city = row.city?.trim() || fallback?.city || "";
  const state = row.state?.trim() || fallback?.state || "";
  const zipcode = row.zipcode?.trim() || fallback?.zipcode || "";
  const fullAddress =
    composeSiteAddress({
      address: streetAddress,
      city,
      state,
      zipcode
    }) ||
    fallback?.address ||
    "Address unavailable";

  return {
    id: row.id,
    slug,
    name: row.name?.trim() || fallback?.name || "Unnamed Site",
    employer: row.employer?.trim() || fallback?.employer || "Local One Employer",
    visibility: row.visibility ?? fallback?.visibility ?? "member",
    address: fullAddress,
    streetAddress,
    city: city || undefined,
    state: state || undefined,
    zipcode: zipcode || undefined,
    intro:
      row.intro?.trim() ||
      fallback?.intro ||
      "Local One members support this worksite with public-facing security coverage.",
    representative:
      row.representative?.trim() || fallback?.representative || "Local One Representative",
    representativeEmail:
      fallback?.representativeEmail || "info@localoneunion.org",
    contractPath: fallback?.contractPath || "/contracts/Local-1.pdf",
    isActive: row.is_active ?? fallback?.isActive ?? true,
    latitude,
    longitude,
    coordinates: fallback?.coordinates || { top: "50%", left: "50%" }
  };
}

function mergeContractIntoSite(
  site: Site,
  contract?: SupabaseContractRow | null
): Site {
  if (!contract?.file_url) {
    return site;
  }

  return {
    ...site,
    contractPath: contract.file_url,
    contractTitle: contract.title?.trim() || site.contractTitle,
    contractEffectiveDate: contract.effective_date ?? site.contractEffectiveDate,
    contractExpirationDate: contract.expiration_date ?? site.contractExpirationDate
  };
}

function getFallbackSites(): Site[] {
  return fallbackSites;
}

function getFallbackPublicSites(): Site[] {
  return fallbackSites.filter((site) => site.visibility === "public");
}

function getFallbackSiteDetail(slug: string): SiteDetailResult {
  const normalizedSlug = resolveSiteSlugAlias(slug);
  const fallbackSite = fallbackSiteBySlug.get(normalizedSlug) ?? null;

  if (!fallbackSite) {
    return {
      site: null,
      source: "fallback"
    };
  }

  if (fallbackSite.visibility !== "public") {
    return {
      site: null,
      source: "fallback",
      restricted: true
    };
  }

  return {
    site: fallbackSite,
    source: "fallback"
  };
}

async function loadLatestContracts() {
  if (!supabase) {
    return {
      error: null as string | null,
      latestContractBySiteId: new Map<string, SupabaseContractRow>()
    };
  }

  const { data: contractData, error: contractError } = await supabase
    .from("contracts")
    .select("id, site_id, title, file_url, effective_date, expiration_date")
    .order("effective_date", { ascending: false });

  const latestContractBySiteId = new Map<string, SupabaseContractRow>();
  for (const contract of (contractData as SupabaseContractRow[] | null) ?? []) {
    if (contract.site_id && !latestContractBySiteId.has(contract.site_id)) {
      latestContractBySiteId.set(contract.site_id, contract);
    }
  }

  return {
    error: contractError ? getFriendlySupabaseMessage({ action: "load contract information" }) : null,
    latestContractBySiteId
  };
}

async function fetchActiveSites({
  visibility
}: {
  visibility?: "public" | "member";
} = {}): Promise<SiteCollectionResult> {
  if (!supabase) {
    return {
      sites: visibility === "public" ? getFallbackPublicSites() : getFallbackSites(),
      source: "fallback",
      error: "Site information is temporarily unavailable, so backup content is being shown."
    };
  }

  const query = supabase
    .from("sites")
    .select(
      "id, name, slug, employer, visibility, address, city, state, zipcode, intro, representative, lat, lng, archived, is_active"
    )
    .order("name", { ascending: true });

  const { data, error } = visibility
    ? await query.eq("visibility", visibility)
    : await query;

  if (error) {
    logDevelopmentError("Sites load", error, { visibility });
    return {
      sites: visibility === "public" ? getFallbackPublicSites() : getFallbackSites(),
      source: "fallback",
      error: getFriendlySupabaseMessage({
        action: "load site information"
      })
    };
  }

  const siteRows = ((data as SupabaseSiteRow[] | null) ?? []).filter(
    (row) => row.archived !== true && row.is_active !== false
  );

  const { latestContractBySiteId, error: contractError } = await loadLatestContracts();

  const mappedSites = siteRows
    .map((row) => {
      const site = mapSupabaseSite(row);
      if (!site) {
        return null;
      }
      return mergeContractIntoSite(site, latestContractBySiteId.get(row.id));
    })
    .filter((site): site is Site => Boolean(site));

  if (mappedSites.length === 0) {
    return {
      sites: visibility === "public" ? getFallbackPublicSites() : getFallbackSites(),
      source: "fallback",
      error: "No active site records were available, so fallback site data is being shown."
    };
  }

  return {
    sites: mappedSites,
    source: "supabase",
    error: contractError ?? undefined
  };
}

export async function getPublicSites(): Promise<SiteCollectionResult> {
  return fetchActiveSites({ visibility: "public" });
}

export async function getPublicSiteBySlug(slug: string): Promise<SiteDetailResult> {
  const normalizedSlug = resolveSiteSlugAlias(slug);
  logSiteLookup("public site lookup requested", {
    requestedSlug: slug,
    normalizedSlug
  });

  if (!supabase) {
    return {
      ...getFallbackSiteDetail(normalizedSlug),
      error: "This site page is temporarily unavailable, so backup content is being shown."
    };
  }

  const slugOptions = Array.from(new Set([slug, normalizedSlug]));
  const { data, error } = await supabase
    .from("sites")
    .select(
      "id, name, slug, employer, visibility, address, city, state, zipcode, intro, representative, lat, lng, archived, is_active"
    )
    .in("slug", slugOptions)
    .limit(2);

  if (error) {
    logDevelopmentError("Public site detail load", error, { slug: normalizedSlug });
    return {
      ...getFallbackSiteDetail(normalizedSlug),
      error: getFriendlySupabaseMessage({
        action: "load this site page"
      })
    };
  }

  const matchingRows = (data as SupabaseSiteRow[] | null) ?? [];
  const siteRow =
    matchingRows.find((row) => row.slug?.trim() === slug) ??
    matchingRows.find((row) => row.slug?.trim() === normalizedSlug) ??
    null;

  logSiteLookup("public site Supabase result", {
    requestedSlug: slug,
    normalizedSlug,
    matchingRows,
    selectedSiteId: siteRow?.id ?? null,
    selectedSiteSlug: siteRow?.slug ?? null
  });

  if (!siteRow) {
    return fallbackSiteBySlug.has(normalizedSlug)
      ? getFallbackSiteDetail(normalizedSlug)
      : { site: null, source: "supabase" };
  }

  if (siteRow.archived === true || siteRow.is_active === false) {
    return fallbackSiteBySlug.has(normalizedSlug)
      ? getFallbackSiteDetail(normalizedSlug)
      : { site: null, source: "supabase" };
  }

  if ((siteRow.visibility ?? "member") !== "public") {
    return {
      site: null,
      source: "supabase",
      restricted: true
    };
  }

  const mappedSite = mapSupabaseSite(siteRow);

  if (!mappedSite) {
    return fallbackSiteBySlug.has(normalizedSlug)
      ? getFallbackSiteDetail(normalizedSlug)
      : { site: null, source: "supabase" };
  }

  const { data: contractData, error: contractError } = await supabase
    .from("contracts")
    .select("id, site_id, title, file_url, effective_date, expiration_date")
    .eq("site_id", siteRow.id)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    site: mergeContractIntoSite(
      mappedSite,
      (contractData as SupabaseContractRow | null) ?? null
    ),
    source: "supabase",
    error: contractError
      ? getFriendlySupabaseMessage({ action: "load contract information" })
      : undefined
  };
}

export async function getAllActiveSites(): Promise<SiteCollectionResult> {
  return fetchActiveSites();
}

export async function getActiveSiteBySlug(slug: string): Promise<SiteDetailResult> {
  const normalizedSlug = resolveSiteSlugAlias(slug);
  logSiteLookup("active site lookup requested", {
    requestedSlug: slug,
    normalizedSlug
  });

  if (!supabase) {
    return {
      site: fallbackSiteBySlug.get(normalizedSlug) ?? null,
      source: fallbackSiteBySlug.has(normalizedSlug) ? "fallback" : "supabase"
    };
  }

  const slugOptions = Array.from(new Set([slug, normalizedSlug]));
  const { data, error } = await supabase
    .from("sites")
    .select(
      "id, name, slug, employer, visibility, address, city, state, zipcode, intro, representative, lat, lng, archived, is_active"
    )
    .in("slug", slugOptions)
    .limit(2);

  if (error) {
    logDevelopmentError("Active site detail load", error, { slug: normalizedSlug });
    return {
      site: fallbackSiteBySlug.get(normalizedSlug) ?? null,
      source: fallbackSiteBySlug.has(normalizedSlug) ? "fallback" : "supabase",
      error: getFriendlySupabaseMessage({
        action: "load this site page"
      })
    };
  }

  const matchingRows = (data as SupabaseSiteRow[] | null) ?? [];
  const siteRow =
    matchingRows.find((row) => row.slug?.trim() === slug) ??
    matchingRows.find((row) => row.slug?.trim() === normalizedSlug) ??
    null;

  logSiteLookup("active site Supabase result", {
    requestedSlug: slug,
    normalizedSlug,
    matchingRows,
    selectedSiteId: siteRow?.id ?? null,
    selectedSiteSlug: siteRow?.slug ?? null
  });

  if (!siteRow) {
    return {
      site: fallbackSiteBySlug.get(normalizedSlug) ?? null,
      source: fallbackSiteBySlug.has(normalizedSlug) ? "fallback" : "supabase"
    };
  }

  if (siteRow.archived === true || siteRow.is_active === false) {
    return {
      site: null,
      source: "supabase"
    };
  }

  const mappedSite = mapSupabaseSite(siteRow);

  if (!mappedSite) {
    return {
      site: null,
      source: "supabase"
    };
  }

  const { data: contractData, error: contractError } = await supabase
    .from("contracts")
    .select("id, site_id, title, file_url, effective_date, expiration_date")
    .eq("site_id", siteRow.id)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    site: mergeContractIntoSite(
      mappedSite,
      (contractData as SupabaseContractRow | null) ?? null
    ),
    source: "supabase",
    error: contractError
      ? getFriendlySupabaseMessage({ action: "load contract information" })
      : undefined
  };
}
