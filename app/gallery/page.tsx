import { GalleryShowcase } from "@/components/gallery-showcase";
import { SectionHeading } from "@/components/section-heading";
import { getPublicGalleryItems } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { items, source, error } = await getPublicGalleryItems();

  return (
    <div className="container-shell py-14 sm:py-20">
      <SectionHeading
        eyebrow="Gallery"
        title="Work, training, and community in action"
        copy="The gallery is public-facing and now uses image-based cards with enlarged viewing, making it easy to share union events, campaigns, member spotlights, and site activity."
      />
      {source === "fallback" ? (
        <p className="mt-6 rounded-2xl border border-union-slate/70 bg-union-mist px-4 py-3 text-sm text-union-steel">
          {error ?? "Fallback gallery items are being shown right now."}
        </p>
      ) : null}
      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
          No gallery items are available right now.
        </p>
      ) : (
        <GalleryShowcase items={items} />
      )}
    </div>
  );
}
