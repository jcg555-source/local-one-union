"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { SiteCard } from "@/components/site-card";
import { SitesMap } from "@/components/sites-map";
import { useAuth } from "@/components/auth-provider";
import { Site } from "@/lib/data";
import { getAllActiveSites, getPublicSites } from "@/lib/sites";

export function SitesMapPortal() {
  const { session } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isApprovedViewer =
    session.status === "approved" &&
    (session.role === "member" || session.role === "admin");

  useEffect(() => {
    let active = true;

    async function loadSites() {
      setLoading(true);
      setError(null);

      const result = isApprovedViewer
        ? await getAllActiveSites()
        : await getPublicSites();

      if (!active) {
        return;
      }

      setSites(result.sites);
      setError(result.error ?? null);
      setLoading(false);
    }

    void loadSites();

    return () => {
      active = false;
    };
  }, [isApprovedViewer]);

  return (
    <div className="container-shell py-14 sm:py-20">
      <SectionHeading
        eyebrow="Sites Map"
        title={
          isApprovedViewer
            ? "Interactive map pins for every represented worksite."
            : "Interactive map pins for Local One's public site pages."
        }
        copy={
          isApprovedViewer
            ? "Approved Local One members can explore all represented sites, review locations, and open each contract page from one place."
            : "Public visitors can explore the two public Local One site pages here. Approved members and admins can sign in to view all represented worksites."
        }
      />
      {!isApprovedViewer ? (
        <div className="mt-6 card-panel p-6">
          <h2 className="text-2xl font-semibold text-union-navy">
            The full sites map is available to approved Local One members only.
          </h2>
          <p className="mt-3 text-sm leading-7 text-union-steel">
            Public visitors can still review New York University and NYU
            Langone Health below. Approved members and admins can sign in to
            unlock the full represented site map and every site page.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white"
            >
              Log In
            </Link>
            <Link
              href="/sites/new-york-university"
              className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy"
            >
              View Public Site Page
            </Link>
          </div>
        </div>
      ) : null}
      {loading ? (
        <p className="mt-6 rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
          Loading site map...
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-2xl border border-union-slate/70 bg-union-mist px-4 py-3 text-sm text-union-steel">
          {error}
        </p>
      ) : null}
      {!loading && sites.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
          No active sites are available right now.
        </p>
      ) : null}
      <div className="mt-10">
        <SitesMap sites={sites} />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.id ?? site.slug} site={site} />
        ))}
      </div>
    </div>
  );
}
