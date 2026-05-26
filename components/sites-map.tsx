"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Site } from "@/lib/data";

const SitesMapInner = dynamic(
  () => import("@/components/sites-map-inner").then((mod) => mod.SitesMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="card-panel flex min-h-[420px] items-center justify-center p-8 text-sm font-medium text-union-steel sm:min-h-[520px]">
        Map temporarily unavailable.
      </div>
    )
  }
);

export function SitesMap({ sites }: { sites: Site[] }) {
  const [mounted, setMounted] = useState(false);
  const mapKey = useMemo(
    () =>
      sites
        .map((site) => `${site.id ?? site.slug}:${site.latitude}:${site.longitude}`)
        .join("|"),
    [sites]
  );
  const hasVisibleSites = sites.length > 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !hasVisibleSites) {
    return (
      <div className="card-panel flex min-h-[420px] items-center justify-center p-8 text-sm font-medium text-union-steel sm:min-h-[520px]">
        Map temporarily unavailable.
      </div>
    );
  }

  return <SitesMapInner key={mapKey} sites={sites} mapKey={mapKey} />;
}
