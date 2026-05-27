import { notFound } from "next/navigation";
import { RestrictedSitePage } from "@/components/restricted-site-page";
import { SiteDetailView } from "@/components/site-detail-view";
import { getPublicSiteBySlug } from "@/lib/sites";

export const dynamic = "force-dynamic";

export default async function SiteDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { site, source, error, restricted } = await getPublicSiteBySlug(slug);

  if (restricted) {
    return <RestrictedSitePage slug={slug} />;
  }

  if (!site) {
    notFound();
  }

  return (
    <SiteDetailView
      site={site}
      error={error}
      showHiringAlertForm={source === "supabase" && Boolean(site.id)}
      hiringAlertMessage="Hiring alerts are unavailable for this fallback site record until the live Supabase site entry is connected."
    />
  );
}
