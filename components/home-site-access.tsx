"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

type HomeSiteAccessProps = {
  leadersCount: number;
  newsCount: number;
  publicSitesCount: number;
  totalSitesCount: number;
};

function useSiteAccessState() {
  const { session } = useAuth();
  const isApprovedViewer =
    session.status === "approved" &&
    (session.role === "member" || session.role === "admin");

  const siteHref: Route | "/#public-sites" = isApprovedViewer
    ? "/sites-map"
    : "/#public-sites";

  const heroLabel = isApprovedViewer ? "Explore Sites Map" : "View Public Site Pages";
  return { heroLabel, isApprovedViewer, siteHref };
}

export function HomeSiteHeroButton() {
  const { heroLabel, siteHref } = useSiteAccessState();

  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href={siteHref}
        className="rounded-full bg-union-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-union-navy shadow-lg shadow-black/20 transition hover:translate-y-[-1px]"
      >
        {heroLabel}
      </Link>
    </div>
  );
}

export function HomeSiteAccess({
  leadersCount,
  newsCount,
  publicSitesCount,
  totalSitesCount
}: HomeSiteAccessProps) {
  const { isApprovedViewer, siteHref } = useSiteAccessState();
  const siteCardValue = isApprovedViewer ? totalSitesCount : publicSitesCount;
  const siteCardLabel = isApprovedViewer ? "Sites Map" : "Public Sites";

  const homepageCards: Array<{
    href: Route | "/#public-sites";
    label: string;
    value: number;
  }> = [
    {
      href: siteHref,
      label: siteCardLabel,
      value: siteCardValue
    },
    {
      href: "/leadership",
      label: "Leadership",
      value: leadersCount
    },
    {
      href: "/news",
      label: "News Updates",
      value: newsCount
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {homepageCards.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="card-panel gold-ring group block cursor-pointer p-6 transition duration-200 hover:-translate-y-1 hover:border-union-gold/50 hover:shadow-[0_20px_45px_rgba(16,42,67,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-union-gold focus-visible:ring-offset-2"
          aria-label={`Go to ${item.label}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-union-gold">
            {item.label}
          </p>
          <p className="mt-3 text-4xl font-semibold text-union-navy">
            {item.value}
          </p>
          <p className="mt-3 text-sm font-medium text-union-steel transition group-hover:text-union-navy">
            Explore section
          </p>
        </Link>
      ))}
    </div>
  );
}
