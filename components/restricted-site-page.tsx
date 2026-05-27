"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { SiteDetailView } from "@/components/site-detail-view";
import { Site } from "@/lib/data";
import { getActiveSiteBySlug } from "@/lib/sites";

export function RestrictedSitePage({ slug }: { slug: string }) {
  const { session } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isApprovedViewer =
    session.status === "approved" &&
    (session.role === "member" || session.role === "admin");

  useEffect(() => {
    if (!isApprovedViewer) {
      return;
    }

    let active = true;

    async function loadSite() {
      setLoading(true);
      setError(null);

      const result = await getActiveSiteBySlug(slug);

      if (!active) {
        return;
      }

      if (!result.site) {
        setError("We could not load this site right now.");
        setSite(null);
        setLoading(false);
        return;
      }

      setSite(result.site);
      setError(result.error ?? null);
      setLoading(false);
    }

    void loadSite();

    return () => {
      active = false;
    };
  }, [isApprovedViewer, slug]);

  if (!isApprovedViewer) {
    return (
      <div className="container-shell py-14 sm:py-20">
        <div className="card-panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
            Member-Only Site
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-union-navy">
            This site is available to approved Local One members only.
          </h1>
          <p className="mt-4 text-sm leading-7 text-union-steel">
            Approved members and admins can sign in to view full site locations,
            member-only worksites, and contract details.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white"
            >
              Log In
            </Link>
            <Link
              href="/portal"
              className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy"
            >
              Member Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-shell py-14 sm:py-20">
        <div className="card-panel p-8 text-sm text-union-steel">
          Loading site information...
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="container-shell py-14 sm:py-20">
        <div className="card-panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
            Site Page
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-union-navy">
            This site is currently unavailable.
          </h1>
          <p className="mt-4 text-sm leading-7 text-union-steel">
            {error ?? "Please try again in a moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SiteDetailView
      site={site}
      error={error ?? undefined}
      showHiringAlertForm={Boolean(site.id)}
      hiringAlertMessage="Hiring alerts are unavailable for this site until the live Supabase site record is connected."
    />
  );
}
