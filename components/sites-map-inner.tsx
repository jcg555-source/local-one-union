"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useJsApiLoader
} from "@react-google-maps/api";
import { Site } from "@/lib/data";

const mapContainerStyle = {
  width: "100%",
  height: "100%"
} as const;

const defaultCenter = {
  lat: 40.724,
  lng: -73.98
};

const mapOptions: google.maps.MapOptions = {
  clickableIcons: false,
  disableDefaultUI: false,
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#eef2f6" }]
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#173a5b" }]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#cdd6e0" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#d8e6f2" }]
    }
  ],
  zoomControl: true
};

function isValidCoordinate(value: number | null) {
  return Number.isFinite(value);
}

type SiteWithCoordinates = Site & {
  latitude: number;
  longitude: number;
};

function MapFallback({
  message = "Map temporarily unavailable."
}: {
  message?: string;
}) {
  return (
    <div className="card-panel flex min-h-[420px] items-center justify-center p-8 text-sm font-medium text-union-steel sm:min-h-[520px]">
      {message}
    </div>
  );
}

export function SitesMapInner({
  sites,
  mapKey
}: {
  sites: Site[];
  mapKey: string;
}) {
  const [activeSiteSlug, setActiveSiteSlug] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const validSites = useMemo(
    () =>
      sites.filter(
        (site) =>
          isValidCoordinate(site.latitude) && isValidCoordinate(site.longitude)
      ) as SiteWithCoordinates[],
    [sites]
  );
  const activeSite =
    validSites.find((site) => site.slug === activeSiteSlug) ?? null;
  const center = useMemo(() => {
    if (validSites.length === 0) {
      return defaultCenter;
    }

    const latTotal = validSites.reduce((sum, site) => sum + site.latitude, 0);
    const lngTotal = validSites.reduce((sum, site) => sum + site.longitude, 0);

    return {
      lat: latTotal / validSites.length,
      lng: lngTotal / validSites.length
    };
  }, [validSites]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "local-one-google-maps",
    googleMapsApiKey: apiKey
  });

  if (!apiKey) {
    return <MapFallback message="Map temporarily unavailable." />;
  }

  if (validSites.length === 0) {
    return <MapFallback message="Map temporarily unavailable." />;
  }

  if (loadError) {
    return <MapFallback message="Map temporarily unavailable." />;
  }

  if (!isLoaded) {
    return <MapFallback message="Loading interactive site map..." />;
  }

  return (
    <div className="card-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-union-slate/70 bg-union-mist px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-union-gold">
            Live Site Coverage
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-union-navy">
            Local One represented worksites
          </h3>
        </div>
        <div className="rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white">
          {validSites.length} sites
        </div>
      </div>

      <div className="h-[420px] w-full sm:h-[520px]">
        <GoogleMap
          key={mapKey}
          center={center}
          zoom={10}
          mapContainerStyle={mapContainerStyle}
          options={mapOptions}
        >
          {validSites.map((site) => (
            <MarkerF
              key={site.id ?? site.slug}
              position={{ lat: site.latitude, lng: site.longitude }}
              title={site.name}
              onClick={() => setActiveSiteSlug(site.slug)}
            />
          ))}

          {activeSite ? (
            <InfoWindowF
              position={{ lat: activeSite.latitude, lng: activeSite.longitude }}
              onCloseClick={() => setActiveSiteSlug(null)}
            >
              <div className="max-w-[240px] p-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-union-gold">
                  {activeSite.employer}
                </p>
                <h4 className="mt-2 text-lg font-semibold text-union-navy">
                  {activeSite.name}
                </h4>
                <p className="mt-2 text-sm leading-6 text-union-steel">
                  {activeSite.address}
                </p>
                <Link
                  href={`/sites/${activeSite.slug}`}
                  className="mt-4 inline-flex rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173a5b]"
                >
                  View Full Site Page
                </Link>
              </div>
            </InfoWindowF>
          ) : null}
        </GoogleMap>
      </div>
    </div>
  );
}
