import { SectionHeading } from "@/components/section-heading";
import { SiteCard } from "@/components/site-card";
import { SitesMap } from "@/components/sites-map";
import { getPublicSites } from "@/lib/sites";

export const dynamic = "force-dynamic";

export default async function SitesMapPage() {
  const { sites, source, error } = await getPublicSites();

  return (
    <div className="container-shell py-14 sm:py-20">
      <SectionHeading
        eyebrow="Sites Map"
        title="Interactive map pins for every represented worksite."
        copy="The map gives visitors a quick way to explore represented employers, open public site pages, and view each site's contract PDF."
      />
      {source === "fallback" ? (
        <p className="mt-6 rounded-2xl border border-union-slate/70 bg-union-mist px-4 py-3 text-sm text-union-steel">
          {error ?? "Fallback site data is being shown right now."}
        </p>
      ) : null}
      {sites.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
          No active public sites are available right now.
        </p>
      ) : null}
      <div className="mt-10">
        <SitesMap sites={sites} />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.slug} site={site} />
        ))}
      </div>
    </div>
  );
}
