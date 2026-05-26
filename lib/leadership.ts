import { Leader, leaders as fallbackLeaders } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

type SupabaseLeadershipRow = {
  id: string;
  name: string | null;
  role: string | null;
  bio: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

type LeadershipResult = {
  error?: string;
  leaders: Leader[];
  source: "supabase" | "fallback";
};

function mapLeadership(row: SupabaseLeadershipRow): Leader | null {
  if (!row.name?.trim() || !row.image_url?.trim()) {
    return null;
  }

  const fallback = fallbackLeaders.find((leader) => leader.name === row.name?.trim());

  return {
    name: row.name.trim(),
    title: row.role?.trim() || fallback?.title || "Leadership",
    bio:
      row.bio?.trim() ||
      fallback?.bio ||
      "Local One leadership supports organizing, representation, and member advocacy.",
    email: fallback?.email || "info@localoneunion.org",
    image: row.image_url.trim()
  };
}

export async function getPublicLeadership(): Promise<LeadershipResult> {
  if (!supabase) {
    return {
      leaders: fallbackLeaders,
      source: "fallback",
      error: "Leadership information is temporarily unavailable, so backup content is being shown."
    };
  }

  const { data, error } = await supabase
    .from("leadership")
    .select("id, name, role, bio, image_url, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    logDevelopmentError("Public leadership load", error);
    return {
      leaders: fallbackLeaders,
      source: "fallback",
      error: getFriendlySupabaseMessage({
        action: "load leadership information"
      })
    };
  }

  const leaders = ((data as SupabaseLeadershipRow[] | null) ?? [])
    .map(mapLeadership)
    .filter((leader): leader is Leader => Boolean(leader));

  if (leaders.length === 0) {
    return {
      leaders: fallbackLeaders,
      source: "fallback",
      error: "No active leadership records were available, so fallback leadership data is being shown."
    };
  }

  return {
    leaders,
    source: "supabase"
  };
}
