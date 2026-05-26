import { GalleryItem, galleryItems as fallbackGalleryItems } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

type SupabaseGalleryRow = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

type GalleryResult = {
  error?: string;
  items: GalleryItem[];
  source: "supabase" | "fallback";
};

export async function getPublicGalleryItems(): Promise<GalleryResult> {
  if (!supabase) {
    return {
      items: fallbackGalleryItems,
      source: "fallback",
      error: "Gallery highlights are temporarily unavailable, so backup content is being shown."
    };
  }

  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, title, subtitle, image_url, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    logDevelopmentError("Public gallery load", error);
    return {
      items: fallbackGalleryItems,
      source: "fallback",
      error: getFriendlySupabaseMessage({
        action: "load gallery items"
      })
    };
  }

  const items = ((data as SupabaseGalleryRow[] | null) ?? [])
    .filter((item) => item.image_url)
    .map((item) => ({
      title: item.title?.trim() || "Local One Gallery",
      subtitle: item.subtitle?.trim() || "Community, work, and solidarity in action.",
      image: item.image_url as string
    }));

  if (items.length === 0) {
    return {
      items: fallbackGalleryItems,
      source: "fallback",
      error: "No active gallery items were available, so fallback gallery items are being shown."
    };
  }

  return {
    items,
    source: "supabase"
  };
}
