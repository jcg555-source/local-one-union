"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { sites } from "@/lib/data";

export function MapExplorer() {
  const [activeSlug, setActiveSlug] = useState(sites[0].slug);
  const activeSite = sites.find((site) => site.slug === activeSlug) ?? sites[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
      <div className="card-panel overflow-hidden">
        <div className="map-surface relative min-h-[420px] bg-union-grid bg-[length:42px_42px]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-[18%] top-[22%] h-36 w-36 rounded-full border border-white/25" />
            <div className="absolute right-[12%] top-[38%] h-44 w-44 rounded-full border border-white/20" />
            <div className="absolute bottom-[14%] left-[33%] h-28 w-28 rounded-full border border-white/20" />
          </div>
          {sites.map((site) => (
            <button
              key={site.slug}
              type="button"
              onClick={() => setActiveSlug(site.slug)}
              className={clsx(
                "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1",
                activeSlug === site.slug ? "z-20" : "z-10"
              )}
              style={{
                top: site.coordinates.top,
                left: site.coordinates.left
              }}
              aria-label={`View ${site.name}`}
            >
              <span
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow-lg transition",
                  activeSlug === site.slug
                    ? "scale-110 bg-union-gold text-union-navy"
                    : "bg-white text-union-navy"
                )}
              >
                {site.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-union-navy">
                {site.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <aside className="card-panel p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
          Active Site
        </p>
        <h3 className="mt-4 text-3xl font-semibold text-union-navy">
          {activeSite.name}
        </h3>
        <dl className="mt-6 space-y-4 text-sm text-union-steel">
          <div>
            <dt className="font-semibold text-union-navy">Employer</dt>
            <dd>{activeSite.employer}</dd>
          </div>
          <div>
            <dt className="font-semibold text-union-navy">Location</dt>
            <dd>{activeSite.address}</dd>
          </div>
          <div>
            <dt className="font-semibold text-union-navy">Representative</dt>
            <dd>{activeSite.representative}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm leading-7 text-union-steel">{activeSite.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/sites/${activeSite.slug}`}
            className="rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white"
          >
            Open Site Page
          </Link>
          <a
            href={activeSite.contractPath}
            className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy"
          >
            Open Contract PDF
          </a>
        </div>
      </aside>
    </div>
  );
}
